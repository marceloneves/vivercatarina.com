import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveNeighborhoodPageSlug } from './neighborhood-slugs.mjs';
import { isStandaloneHouseProperty } from './property-kind.mjs';

const dataRoot = join(process.cwd(), 'src/data');
export const FLORIANOPOLIS_CITY_SLUG = 'florianopolis';
const GENERIC_VIDEO = 'https://www.youtube.com/embed/XgTfaP86ph0?feature=oembed';
const PLACEHOLDER_LAT = -33.868419;
const PLACEHOLDER_LNG = 151.193245;
const REGIONAL_CITY_NAMES = new Set([
	'Grande Florianópolis',
	'Litoral Norte',
	'Litoral Sul',
	'Oeste',
	'Serra Catarinense',
	'Sul',
	'Vale do Itajaí',
]);
const SANTA_CATARINA_BOUNDS = {
	minLat: -29.6,
	maxLat: -25.8,
	minLng: -53.9,
	maxLng: -48.3,
};

let florianopolisSlugCache;

export function isFlorianopolisProperty(property) {
	return property?.address?.city?.slug === FLORIANOPOLIS_CITY_SLUG;
}

export function isSiteEligibleProperty(property) {
	return isFlorianopolisProperty(property) && !isStandaloneHouseProperty(property);
}

export function getFlorianopolisPropertySlugs() {
	if (!florianopolisSlugCache) {
		const index = JSON.parse(readFileSync(join(dataRoot, 'imoveis/index.json'), 'utf8'));
		florianopolisSlugCache = new Set(
			index.properties
				.filter((property) => property.city === FLORIANOPOLIS_CITY_SLUG)
				.map((property) => property.slug)
				.filter((slug) => {
					const property = loadProperty(slug);
					return property && isSiteEligibleProperty(property);
				}),
		);
	}

	return florianopolisSlugCache;
}

export function isFlorianopolisListingEntry(entry) {
	if (!entry?.slug) {
		return false;
	}

	return getFlorianopolisPropertySlugs().has(entry.slug);
}

export function filterFlorianopolisListings(entries) {
	return entries.filter(isFlorianopolisListingEntry);
}

export function listPropertySlugs() {
	return [...getFlorianopolisPropertySlugs()];
}

export function loadProperty(slug) {
	const filePath = join(dataRoot, 'imoveis', slug, 'property.json');

	if (!existsSync(filePath)) {
		return null;
	}

	return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function getPropertyCode(property) {
	const code = property.overview?.code?.trim();

	if (code) {
		return code;
	}

	if (property.id != null) {
		return String(property.id);
	}

	return property.slug;
}

export function getPropertyImageUrl(slug, imageFile) {
	return `/data/imoveis/${slug}/${imageFile}`;
}

export function resolvePropertyCityName(property) {
	const city = property.address?.city?.name;

	if (city && !REGIONAL_CITY_NAMES.has(city)) {
		return city;
	}

	const neighborhood = property.address?.neighborhood?.name;

	if (neighborhood && !REGIONAL_CITY_NAMES.has(neighborhood)) {
		return neighborhood;
	}

	const street = property.address?.street || '';
	const streetCity = street.match(/,\s*([A-Za-zÀ-ú\s]+)\s+SC\b/i);

	if (streetCity) {
		return streetCity[1].trim();
	}

	const slashCity = street.match(/([A-Za-zÀ-ú\s]+)\/SC/i);

	if (slashCity) {
		return slashCity[1].trim();
	}

	const titleCity = property.title?.match(/([A-Za-zÀ-ú\s]+)\/SC/i);

	if (titleCity) {
		return titleCity[1].trim();
	}

	return city || null;
}

export function buildLocationLabel(property) {
	const city = property.address?.city?.name;
	const state = property.address?.state?.name || 'SC';
	const neighborhood = property.address?.neighborhood?.name;

	if (neighborhood && city) {
		return `${neighborhood}, ${city} - ${state}`;
	}

	if (city) {
		return `${city}, ${state}`;
	}

	return 'Santa Catarina';
}

export function buildPriceLabel(property) {
	const { prefix, display, amount } = property.price || {};
	const formatted = amount
		? new Intl.NumberFormat('pt-BR', {
				style: 'currency',
				currency: 'BRL',
				maximumFractionDigits: 0,
			}).format(amount)
		: display;

	if (prefix && formatted) {
		return `${prefix} ${formatted}`;
	}

	return formatted || 'Consulte';
}

export function isPlaceholderCoordinates(lat, lng) {
	return Math.abs(Number(lat) - PLACEHOLDER_LAT) < 0.000001 && Math.abs(Number(lng) - PLACEHOLDER_LNG) < 0.000001;
}

export function isSantaCatarinaCoordinates(lat, lng) {
	const latitude = Number(lat);
	const longitude = Number(lng);

	return (
		latitude >= SANTA_CATARINA_BOUNDS.minLat &&
		latitude <= SANTA_CATARINA_BOUNDS.maxLat &&
		longitude >= SANTA_CATARINA_BOUNDS.minLng &&
		longitude <= SANTA_CATARINA_BOUNDS.maxLng
	);
}

export function sanitizeImportedLocation(location) {
	if (!location?.lat || !location?.lng) {
		return null;
	}

	if (isPlaceholderCoordinates(location.lat, location.lng)) {
		return null;
	}

	if (!isSantaCatarinaCoordinates(location.lat, location.lng)) {
		return null;
	}

	return {
		lat: Number(location.lat),
		lng: Number(location.lng),
	};
}

function addressLooksComplete(street) {
	return /,/.test(street) || /\b(sc|santa catarina)\b/i.test(street);
}

export function buildMapAddressQuery(property) {
	const address = property.address || {};
	const parts = [];
	const street = address.street?.trim();

	if (street) {
		parts.push(street);

		if (!addressLooksComplete(street)) {
			if (address.neighborhood?.name) {
				parts.push(address.neighborhood.name);
			}

			if (address.city?.name && !REGIONAL_CITY_NAMES.has(address.city.name)) {
				parts.push(address.city.name);
			}
		}
	} else {
		if (address.neighborhood?.name) {
			parts.push(address.neighborhood.name);
		}

		if (address.city?.name && !REGIONAL_CITY_NAMES.has(address.city.name)) {
			parts.push(address.city.name);
		}
	}

	if (!parts.some((part) => /\b(sc|santa catarina)\b/i.test(part))) {
		parts.push(address.state?.name || 'Santa Catarina');
	}

	parts.push('Brasil');

	return parts.filter(Boolean).join(', ');
}

export function buildMapEmbedUrl(property) {
	const { lat, lng } = property.location || {};
	const sanitized = sanitizeImportedLocation({ lat, lng });

	if (sanitized) {
		return `https://www.google.com/maps?q=${sanitized.lat},${sanitized.lng}&z=15&output=embed`;
	}

	const query = buildMapAddressQuery(property);

	if (query) {
		return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
	}

	return null;
}

export function getBairroUrl(property) {
	if (property.address?.city?.slug !== 'florianopolis') {
		return null;
	}

	const pageSlug = resolveNeighborhoodPageSlug(property.address?.neighborhood?.slug);
	return pageSlug ? `/bairro/${pageSlug}` : null;
}

export function getPropertyVideoUrl(property) {
	const url = property.videoUrl;
	if (!url || url === GENERIC_VIDEO) {
		return null;
	}

	return url;
}

export function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}
