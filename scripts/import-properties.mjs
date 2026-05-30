import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { FLORIANOPOLIS_CITY_SLUG, sanitizeImportedLocation } from '../src/lib/property-data.mjs';
import { inferPropertyKind } from '../src/lib/property-kind.mjs';
import { buildPropertySlug, cleanPropertyTitle, ensureUniquePropertySlug } from '../src/lib/property-slug.mjs';
import { resolvePropertyPrice } from '../src/lib/property-price.mjs';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const defaultSource = join(
	'/Users/marceloneves/Downloads/us.sitesucker.mac.sitesucker-pro/sitereferencia/site',
);
const sourceSiteDir = resolve(process.env.REFERENCE_SITE_PATH || defaultSource);
const propertySourceDir = join(sourceSiteDir, 'property');
const uploadsDir = join(sourceSiteDir, 'wp-content/uploads');
const outputDir = join(root, 'src/data/imoveis');

function decodeHtml(text) {
	return text
		.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
		.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, ' ')
		.trim();
}

function stripTags(html) {
	return decodeHtml(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
}

function firstMatch(html, pattern) {
	if (!html) {
		return '';
	}
	const match = html.match(pattern);
	return match ? match[1] ?? match[0] : '';
}

function allMatches(html, pattern) {
	const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`;
	const globalPattern = new RegExp(pattern.source, flags);
	return [...html.matchAll(globalPattern)].map((match) => match[1]);
}

function extractTaxonomyClasses(classes, prefix) {
	return [...new Set(classes.match(new RegExp(`${prefix}-([a-z0-9-]+)`, 'g')) || [])].map((token) =>
		token.replace(`${prefix}-`, ''),
	);
}

function extractLinkedTaxonomy(html, className) {
	const items = new Map();
	const pattern = new RegExp(
		`class="g5ere__property-${className}"[\\s\\S]*?<a href="[^"]*/([^/"]+)/index\\.html"[^>]*>([\\s\\S]*?)<\\/a>`,
		'g',
	);

	for (const match of html.matchAll(pattern)) {
		items.set(match[1], { slug: match[1], name: stripTags(match[2]) });
	}

	return [...items.values()];
}

function extractAddressField(html, fieldClass) {
	const block = firstMatch(
		html,
		new RegExp(`(<li class="[^"]* ${fieldClass}"[\\s\\S]*?<\\/li>)`),
	);
	const slug = firstMatch(block, /href="[^"]*\/([^/"]+)\/index\.html"/);
	const name = stripTags(firstMatch(block, /<a[^>]*>([\s\S]*?)<\/a>/));
	return slug ? { slug, name } : null;
}

function parsePriceFields(html) {
	const display = stripTags(firstMatch(html, /class="g5ere__lpp-price"[^>]*>([\s\S]*?)<\/span>/));
	const prefix = stripTags(firstMatch(html, /class="g5ere__pp-postfix"[^>]*>([\s\S]*?)<\/span>/));
	return {
		prefix: prefix || null,
		display: display || null,
	};
}

function shouldImport(classes) {
	if (classes.includes('property-status-pronto-para-construir')) {
		return false;
	}
	if (classes.includes('property-type-pronto-para-construir')) {
		return false;
	}
	return true;
}

function resolveCategory(classes) {
	if (classes.includes('property-status-pronto-para-morar') || classes.includes('property-type-pronto-para-morar')) {
		return 'pronto-para-morar';
	}
	return 'lancamento';
}

function parseNumber(html, className) {
	const value = stripTags(firstMatch(html, new RegExp(`class="${className}"[^>]*>([\\s\\S]*?)<\\/span>`)));
	const normalized = value.replace(',', '.').replace(/[^\d.]/g, '');
	return normalized ? Number(normalized) : null;
}

function extractImagePaths(sectionHtml) {
	const paths = new Set();
	const patterns = [
		/href="(\.\.\/\.\.\/wp-content\/uploads\/[^"]+)"/g,
		/src="(\.\.\/\.\.\/wp-content\/uploads\/[^"]+)"/g,
		/background-image:\s*url\((\.\.\/\.\.\/wp-content\/uploads\/[^)]+)\)/g,
	];

	for (const pattern of patterns) {
		for (const match of sectionHtml.matchAll(pattern)) {
			paths.add(match[1]);
		}
	}

	return [...paths];
}

function resolveUploadPath(relativePath, htmlFile) {
	const absolute = resolve(dirname(htmlFile), relativePath);
	if (existsSync(absolute)) {
		return absolute;
	}

	const normalized = relativePath.replace(/^\.\.\/\.\.\/wp-content\/uploads\//, '');
	return join(uploadsDir, normalized);
}

function copyImages(imagePaths, htmlFile, imagesDir) {
	const copied = [];
	let index = 0;

	for (const relativePath of imagePaths) {
		const sourcePath = resolveUploadPath(relativePath, htmlFile);
		if (!existsSync(sourcePath)) {
			continue;
		}

		index += 1;
		const originalName = basename(relativePath);
		const safeName = `${String(index).padStart(2, '0')}-${originalName}`;
		const targetPath = join(imagesDir, safeName);
		copyFileSync(sourcePath, targetPath);
		copied.push({
			file: `images/${safeName}`,
			original: originalName,
		});
	}

	return copied;
}

function extractProperty(html, htmlFile, slug) {
	const propertyMatch = html.match(
		/<div id="property-(\d+)" class="([^"]*g5ere__single-property[^"]*)"/,
	);
	if (!propertyMatch) {
		return null;
	}

	const id = Number(propertyMatch[1]);
	const classes = propertyMatch[2];
	if (!shouldImport(classes)) {
		return null;
	}

	const similarIndex = html.indexOf('g5ere__property-block-similar');
	const headEnd = html.indexOf('id="primary-content"');
	const headHtml = headEnd > 0 ? html.slice(0, headEnd) : html.slice(0, similarIndex);
	const bodyStart = html.indexOf(propertyMatch[0]);
	const bodyHtml =
		similarIndex > bodyStart ? html.slice(bodyStart, similarIndex) : html.slice(bodyStart);

	const title = cleanPropertyTitle(
		decodeHtml(firstMatch(html, /<title>([^<]+)<\/title>/)).replace(/\s*–\s*Lançamentos SC\s*$/i, ''),
	);
	const galleryHtml = firstMatch(headHtml, /g5ere__single-property-galleries([\s\S]*?)g5ere__spg-nav/);
	const floorPlansHtml = firstMatch(bodyHtml, /g5ere__property-block-floor-plans([\s\S]*?)g5ere__property-block-video/);
	const mapData = firstMatch(headHtml, /g5ere__single-property-map-canvas[^>]*data-location="([^"]+)"/);

	let location = null;
	if (mapData) {
		try {
			const parsed = JSON.parse(decodeHtml(mapData.replace(/&quot;/g, '"')));
			location = sanitizeImportedLocation({
				lat: parsed.position?.lat ? Number(parsed.position.lat) : null,
				lng: parsed.position?.lng ? Number(parsed.position.lng) : null,
			});
		} catch {
			location = null;
		}
	}

	const descriptionHtml = firstMatch(
		bodyHtml,
		/g5ere__property-block-description[\s\S]*?<div class="card-body">\s*([\s\S]*?)\s*<\/div>\s*<\/div><\/div>\s*<div class="g5ere__single-block g5ere__property-block g5ere__property-block-overview/,
	);

	const features = allMatches(bodyHtml, /g5ere__property-feature-item[\s\S]*?<span>([^<]+)<\/span>/).map(decodeHtml);
	const floorPlans = [...floorPlansHtml.matchAll(/g5ere__property_floors-title">\s*([\s\S]*?)\s*<\/h3>[\s\S]*?href="(\.\.\/\.\.\/wp-content\/uploads\/[^"]+)"/g)].map(
		(match) => ({
			title: decodeHtml(match[1]),
			sourcePath: match[2],
		}),
	);

	const videoUrl = firstMatch(bodyHtml, /g5ere__property-block-video[\s\S]*?src="([^"]+)"/);

	const imagePaths = [
		...extractImagePaths(galleryHtml),
		...floorPlans.map((plan) => plan.sourcePath),
	];

	const uniqueImagePaths = [...new Set(imagePaths)];

	return {
		id,
		slug,
		title,
		category: resolveCategory(classes),
		price: resolvePropertyPrice({
			...parsePriceFields(bodyHtml),
			descriptionHtml,
		}),
		address: {
			street: stripTags(firstMatch(bodyHtml, /class="g5ere__property-address"[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/)),
			country: stripTags(
				firstMatch(bodyHtml, /class="g5ere__property-address-list"[\s\S]*?class="country"[\s\S]*?<span>([^<]+)<\/span>/),
			),
			state: extractAddressField(bodyHtml, 'state'),
			city: extractAddressField(bodyHtml, 'city'),
			neighborhood: extractAddressField(bodyHtml, 'neighborhood'),
		},
		location,
		overview: {
			code: stripTags(firstMatch(bodyHtml, /class="g5ere__property-identity"[^>]*>([\s\S]*?)<\/span>/)),
			bedrooms: parseNumber(bodyHtml, 'g5ere__property-bedrooms'),
			bathrooms: parseNumber(bodyHtml, 'g5ere__property-bathrooms'),
			garages: parseNumber(bodyHtml, 'g5ere__property-garage'),
			sizeSqm: parseNumber(bodyHtml, 'g5ere__property-size'),
			deliveryYear: stripTags(firstMatch(bodyHtml, /class="g5ere__property-year"[^>]*>([\s\S]*?)<\/span>/)) || null,
		},
		types: extractLinkedTaxonomy(bodyHtml, 'type'),
		statuses: extractLinkedTaxonomy(bodyHtml, 'status'),
		labels: extractLinkedTaxonomy(bodyHtml, 'label'),
		featureSlugs: extractTaxonomyClasses(classes, 'property-feature'),
		features,
		descriptionHtml: descriptionHtml.trim(),
		floorPlanSources: floorPlans,
		imagePaths: uniqueImagePaths,
		videoUrl: videoUrl || null,
		sourceUrl: `https://lancamentossc.com.br/site/property/${slug}/`,
		importedAt: new Date().toISOString(),
	};
}

function listPropertyPages() {
	return readdirSync(propertySourceDir, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && entry.name !== 'page' && !entry.name.startsWith('index'))
		.map((entry) => join(propertySourceDir, entry.name, 'index.html'))
		.filter((file) => existsSync(file));
}

function main() {
	if (!existsSync(propertySourceDir)) {
		console.error(`Diretório de origem não encontrado: ${propertySourceDir}`);
		process.exit(1);
	}

	mkdirSync(outputDir, { recursive: true });

	const files = listPropertyPages();
	const summary = [];
	const skipped = [];
	const usedSlugs = new Set();
	const usedCodes = new Set();
	let missingImages = 0;

	for (const htmlFile of files) {
		const sourceSlug = basename(dirname(htmlFile));
		const html = readFileSync(htmlFile, 'utf8');
		const parsed = extractProperty(html, htmlFile, sourceSlug);

		if (!parsed) {
			skipped.push(sourceSlug);
			continue;
		}

		if (parsed.address.city?.slug !== FLORIANOPOLIS_CITY_SLUG) {
			skipped.push(`${sourceSlug} (fora de Florianópolis)`);
			continue;
		}

		const slug = ensureUniquePropertySlug(buildPropertySlug(parsed), usedSlugs, parsed.id);
		usedSlugs.add(slug);
		parsed.slug = slug;

		let code = parsed.overview.code?.trim();
		if (!code || usedCodes.has(code)) {
			code = String(parsed.id);
		}
		parsed.overview.code = code;
		usedCodes.add(code);

		const propertyDir = join(outputDir, slug);
		const imagesDir = join(propertyDir, 'images');
		mkdirSync(imagesDir, { recursive: true });

		const copiedImages = copyImages(parsed.imagePaths, htmlFile, imagesDir);
		missingImages += parsed.imagePaths.length - copiedImages.length;

		const floorPlans = parsed.floorPlanSources.map((plan) => {
			const copied = copiedImages.find((image) => image.original === basename(plan.sourcePath));
			return {
				title: plan.title,
				image: copied?.file || null,
			};
		});

		const property = {
			id: parsed.id,
			slug: parsed.slug,
			title: parsed.title,
			category: parsed.category,
			kind: inferPropertyKind({
				slug: parsed.slug,
				title: parsed.title,
				descriptionHtml: parsed.descriptionHtml,
				types: parsed.types,
			}),
			price: parsed.price,
			address: parsed.address,
			location: parsed.location,
			overview: parsed.overview,
			types: parsed.types,
			statuses: parsed.statuses,
			labels: parsed.labels,
			featureSlugs: parsed.featureSlugs,
			features: parsed.features,
			descriptionHtml: parsed.descriptionHtml,
			floorPlans,
			images: copiedImages.map(({ file }) => ({ file, role: 'gallery' })),
			videoUrl: parsed.videoUrl,
			sourceUrl: `https://lancamentossc.com.br/site/property/${slug}/`,
			importedAt: parsed.importedAt,
		};

		writeFileSync(join(propertyDir, 'property.json'), `${JSON.stringify(property, null, 2)}\n`, 'utf8');

		summary.push({
			id: property.id,
			slug: property.slug,
			title: property.title,
			category: property.category,
			kind: property.kind,
			city: property.address.city?.slug || null,
			neighborhood: property.address.neighborhood?.slug || null,
			price: property.price.amount,
			imageCount: property.images.length,
		});
	}

	writeFileSync(
		join(outputDir, 'index.json'),
		`${JSON.stringify(
			{
				total: summary.length,
				importedAt: new Date().toISOString(),
				sourceSiteDir,
				properties: summary.sort((a, b) => a.title.localeCompare(b.title, 'pt-BR')),
			},
			null,
			2,
		)}\n`,
		'utf8',
	);

	console.log(`Importados: ${summary.length}`);
	console.log(`Ignorados (terrenos/pronto para construir): ${skipped.length}`);
	console.log(`Imagens ausentes na origem: ${missingImages}`);
	console.log(`Saída: ${relative(root, outputDir)}`);
}

main();
