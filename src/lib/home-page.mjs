import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { applySemanticHtml } from './semantic-html.mjs';
import { getKindLabel, getKindPageSlug, PROPERTY_KINDS } from './property-kind.mjs';
import { resolveNeighborhoodPageSlug } from './neighborhood-slugs.mjs';
import {
	enrichProperty,
	getThumbnailUrl,
	listActiveNeighborhoods,
	loadNeighborhoodListing,
	sortPropertiesByPrice,
} from './property-listings.mjs';
import { loadLancamentosKindListing } from './lancamentos-page.mjs';

const templatePath = join(process.cwd(), 'src/content/template-pages/index.html');
const dataRoot = join(process.cwd(), 'src/data');

const FALLBACK_NEIGHBORHOOD_IMAGES = [
	'/assets/img/gallery/gallery-1-1.jpg',
	'/assets/img/gallery/gallery-1-2.jpg',
	'/assets/img/gallery/gallery-1-3.jpg',
	'/assets/img/gallery/gallery-1-4.jpg',
	'/assets/img/gallery/gallery-1-5.jpg',
	'/assets/img/gallery/gallery-1-6.jpg',
];

const KIND_FILTER_CLASS = {
	apartamento: 'cat-apartamento',
	casa: 'cat-casa',
	loteamento: 'cat-loteamento',
};

const KIND_LISTING_PATHS = Object.fromEntries(
	PROPERTY_KINDS.map((kind) => [kind, `/lancamentos/${getKindPageSlug(kind)}`]),
);

function resolvePropertyNeighborhoodSlug(entry) {
	const propertyPath = join(dataRoot, entry.dataPath);

	if (!existsSync(propertyPath)) {
		return null;
	}

	const property = JSON.parse(readFileSync(propertyPath, 'utf8'));

	return resolveNeighborhoodPageSlug(property.address?.neighborhood?.slug);
}

export function getHomePropertyKindOptions() {
	return PROPERTY_KINDS.map((kind) => ({
		value: kind,
		label: getKindLabel(kind),
		href: KIND_LISTING_PATHS[kind],
	}));
}

export function getHomeNeighborhoodOptions() {
	return listActiveNeighborhoods().map(({ slug, name }) => ({
		value: slug,
		label: name,
		href: `/bairro/${slug}`,
	}));
}

export function loadHomeFeaturedLancamentos(perKind = 4) {
	const featured = [];

	for (const kind of PROPERTY_KINDS) {
		const listing = loadLancamentosKindListing(kind);

		if (!listing?.properties?.length) {
			continue;
		}

		const enriched = listing.properties.map((entry) => enrichProperty(entry));

		featured.push(
			...sortPropertiesByPrice(enriched, 'price')
				.slice(0, perKind)
				.map((property) => {
					const neighborhoodSlug = resolvePropertyNeighborhoodSlug(property);

					return {
						...property,
						kindFilterClass: KIND_FILTER_CLASS[kind] || KIND_FILTER_CLASS.apartamento,
						neighborhoodSlug,
						neighborhoodFilterClass: neighborhoodSlug ? `bairro-${neighborhoodSlug}` : '',
					};
				}),
		);
	}

	return featured;
}

function normalizeImageToken(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

function isUsableCoverImage(fileName) {
	if (!fileName) {
		return false;
	}

	const normalized = normalizeImageToken(fileName);

	return !/(planta|floor|blueprint|logo|icon|mapa\.|\.pdf)/.test(normalized);
}

function scoreCoverImageFile(fileName) {
	const normalized = normalizeImageToken(fileName.split('/').pop());
	let score = 0;

	if (/a[eé]re|drone|vista[\s_-]?a[eé]re|imagem[\s-]?de[\s-]?drone|voo[\s-]?drone|vista[\s-]?de[\s-]?passar/.test(normalized)) {
		score += 1000;
	}

	if (/localiza|paisagem|panoram|sat[eé]lite|google[\s-]?earth|orbita|hero|capa|banner/.test(normalized)) {
		score += 800;
	}

	if (/terreno[\s-]?para[\s-]?mar|mar[\s-]?para[\s-]?terreno|pin[\s-]?no[\s-]?mapa/.test(normalized)) {
		score += 650;
	}

	if (/\b(orla|costeira|entorno|regi[aã]o|natureza|montanha|morro|entardecer|nascer|sunset|sunrise)\b/.test(normalized)) {
		score += 250;
	}

	if (/\b(praia|lagoa|mar|ilha)\b/.test(normalized) && !/piscina|area|comum|interna|suite|quarto/.test(normalized)) {
		score += 150;
	}

	if (/externa|externo/.test(normalized) && !/fitness|estar|gourmet|salao|sala|piscina/.test(normalized)) {
		score += 120;
	}

	if (/ambiente|interior|sala|quarto|suite|su[ií]te|cozinha|banheiro|dormit|living|wc\b|closet/.test(normalized)) {
		score -= 900;
	}

	if (/perspectiva|enscape|captura-de-tela|render|fachada|planta|floorplan|unidade|apartamento/.test(normalized)) {
		score -= 800;
	}

	if (/whatsapp|original_|img_\d|dsc_|areas-comuns|area-comum|rooftop|piscina|academia|gourmet|playground|salao|salão/.test(normalized)) {
		score -= 600;
	}

	if (/varanda|sacada|hall|lobby|garagem|decor|mobili|torre-|edificio|residence|condominio/.test(normalized)) {
		score -= 450;
	}

	return score;
}

function pickBestNeighborhoodImage(property, entry) {
	const candidates = (property.images || []).filter(
		(image) => image.role !== 'floorplan' && image.role !== 'planta' && isUsableCoverImage(image.file),
	);

	if (candidates.length === 0) {
		return null;
	}

	let best = null;

	for (const image of candidates) {
		const score = scoreCoverImageFile(image.file);

		if (!best || score > best.score) {
			best = {
				score,
				thumbnail: `imoveis/${entry.slug}/${image.file}`,
			};
		}
	}

	return best;
}

function scoreNeighborhoodCover(entry) {
	const propertyPath = join(dataRoot, entry.dataPath);

	if (!existsSync(propertyPath)) {
		return entry.thumbnail
			? { score: scoreCoverImageFile(entry.thumbnail), thumbnail: entry.thumbnail }
			: null;
	}

	const property = JSON.parse(readFileSync(propertyPath, 'utf8'));

	return pickBestNeighborhoodImage(property, entry);
}

const MIN_LANDSCAPE_SCORE = 100;

export function pickNeighborhoodCoverImage(neighborhoodSlug) {
	const listing = loadNeighborhoodListing(neighborhoodSlug);

	if (!listing?.properties?.length) {
		return null;
	}

	let bestLandscape = null;
	let bestAny = null;

	for (const entry of listing.properties) {
		const candidate = scoreNeighborhoodCover(entry);

		if (!candidate?.thumbnail) {
			continue;
		}

		if (!bestAny || candidate.score > bestAny.score) {
			bestAny = candidate;
		}

		if (candidate.score >= MIN_LANDSCAPE_SCORE) {
			if (!bestLandscape || candidate.score > bestLandscape.score) {
				bestLandscape = candidate;
			}
		}
	}

	const chosen = bestLandscape || bestAny;

	return chosen ? getThumbnailUrl(chosen.thumbnail) : null;
}

export function loadHomeNeighborhoodCards() {
	return listActiveNeighborhoods().map((neighborhood, index) => ({
		...neighborhood,
		href: `/bairro/${neighborhood.slug}`,
		imageUrl:
			pickNeighborhoodCoverImage(neighborhood.slug) ||
			FALLBACK_NEIGHBORHOOD_IMAGES[index % FALLBACK_NEIGHBORHOOD_IMAGES.length],
	}));
}

export function getHomeHeroBackgroundUrl() {
	return pickNeighborhoodCoverImage('cacupe') || FALLBACK_NEIGHBORHOOD_IMAGES[2];
}

export function getHomePageShell() {
	const html = applySemanticHtml(readFileSync(templatePath, 'utf8'));
	const searchStart = html.indexOf('<section class="search-area"');
	const searchEndMarker = '<!--======== / Search Section ========-->';
	const searchEnd = html.indexOf(searchEndMarker, searchStart);
	const sectionStart = html.indexOf('<section class="popular-sec-1');
	const sectionEnd = html.indexOf('    </section><!--==============================\nGallery Area');
	const footerStart = html.indexOf('<!--==============================\n\tFooter Area');

	if (searchStart === -1 || searchEnd === -1) {
		throw new Error('Não foi possível localizar a busca na home.');
	}

	if (sectionStart === -1 || sectionEnd === -1) {
		throw new Error('Não foi possível localizar a seção de lançamentos na home.');
	}

	if (footerStart === -1) {
		throw new Error('Não foi possível localizar o rodapé na home.');
	}

	const heroBackgroundUrl = getHomeHeroBackgroundUrl();
	const before = (
		html.slice(0, searchStart) +
		html.slice(searchEnd + searchEndMarker.length, sectionStart)
	).replace(
		'data-bg-src="/assets/img/hero/hero_bg_1_1.jpg"',
		`data-bg-src="${heroBackgroundUrl}"`,
	);

	return {
		before,
		after: html.slice(footerStart),
	};
}
