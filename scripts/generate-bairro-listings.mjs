import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	FLORIANOPOLIS_CITY_SLUG,
	isSiteEligibleProperty,
	loadProperty,
} from '../src/lib/property-data.mjs';
import { resolveNeighborhoodPageSlug } from '../src/lib/neighborhood-slugs.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const neighborhoodsPath = join(root, 'src/data/florianopolis-neighborhoods.json');
const imoveisIndexPath = join(root, 'src/data/imoveis/index.json');
const imoveisDir = join(root, 'src/data/imoveis');
const outputDir = join(root, 'src/data/bairros');

const neighborhoods = JSON.parse(readFileSync(neighborhoodsPath, 'utf8'));
const imoveisIndex = JSON.parse(readFileSync(imoveisIndexPath, 'utf8'));

function loadPropertySummary(slug, indexEntry) {
	const propertyPath = join(imoveisDir, slug, 'property.json');
	let thumbnail = null;

	if (existsSync(propertyPath)) {
		const property = JSON.parse(readFileSync(propertyPath, 'utf8'));
		thumbnail = property.images?.[0]?.file || null;
	}

	return {
		slug,
		id: indexEntry.id,
		title: indexEntry.title,
		category: indexEntry.category,
		price: indexEntry.price,
		dataPath: `imoveis/${slug}/property.json`,
		thumbnail: thumbnail ? `imoveis/${slug}/${thumbnail}` : null,
	};
}

function main() {
	mkdirSync(outputDir, { recursive: true });

	const grouped = Object.fromEntries(neighborhoods.map(({ slug }) => [slug, []]));
	const unresolved = [];

	for (const entry of imoveisIndex.properties) {
		if (entry.city !== FLORIANOPOLIS_CITY_SLUG) {
			continue;
		}

		const property = loadProperty(entry.slug);

		if (!property || !isSiteEligibleProperty(property)) {
			continue;
		}

		const pageSlug = resolveNeighborhoodPageSlug(entry.neighborhood);

		if (!pageSlug) {
			unresolved.push({ slug: entry.slug, neighborhood: entry.neighborhood || null });
			continue;
		}

		grouped[pageSlug].push(loadPropertySummary(entry.slug, entry));
	}

	if (unresolved.length) {
		throw new Error(
			`Imóveis sem bairro mapeado: ${unresolved
				.map(({ slug, neighborhood }) => `${slug} (${neighborhood ?? 'vazio'})`)
				.join(', ')}`,
		);
	}

	const summary = [];

	for (const neighborhood of neighborhoods) {
		const properties = grouped[neighborhood.slug].sort((a, b) =>
			a.title.localeCompare(b.title, 'pt-BR'),
		);

		const payload = {
			slug: neighborhood.slug,
			name: neighborhood.name,
			city: {
				slug: FLORIANOPOLIS_CITY_SLUG,
				name: 'Florianópolis',
			},
			generatedAt: new Date().toISOString(),
			total: properties.length,
			properties,
		};

		writeFileSync(join(outputDir, `${neighborhood.slug}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

		summary.push({
			slug: neighborhood.slug,
			name: neighborhood.name,
			total: properties.length,
		});
	}

	writeFileSync(
		join(outputDir, 'index.json'),
		`${JSON.stringify(
			{
				city: FLORIANOPOLIS_CITY_SLUG,
				generatedAt: new Date().toISOString(),
				totalProperties: summary.reduce((acc, item) => acc + item.total, 0),
				neighborhoods: summary.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
			},
			null,
			2,
		)}\n`,
		'utf8',
	);

	const legacyOutrosPath = join(outputDir, 'outros.json');
	if (existsSync(legacyOutrosPath)) {
		unlinkSync(legacyOutrosPath);
	}

	console.log(`Bairros gerados: ${neighborhoods.length}`);
	console.log(`Imóveis em Florianópolis: ${summary.reduce((acc, item) => acc + item.total, 0)}`);
	console.log(`Saída: src/data/bairros`);
}

main();
