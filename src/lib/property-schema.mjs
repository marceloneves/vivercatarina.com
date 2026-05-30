import {
	getPropertyCode,
	getPropertyImageUrl,
	getPropertyVideoUrl,
} from './property-data.mjs';
import { getCategoryLabel } from './property-listings.mjs';
import { SITE_EMAIL, SITE_NAME, SITE_PHONE_TEL, SITE_URL } from './site-contact.mjs';

function stripHtml(html) {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;|&#8211;|&amp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function compactObject(value) {
	if (Array.isArray(value)) {
		const items = value.map(compactObject).filter((item) => item != null);
		return items.length ? items : undefined;
	}

	if (value && typeof value === 'object') {
		const entries = Object.entries(value)
			.map(([key, nested]) => [key, compactObject(nested)])
			.filter(([, nested]) => nested != null);

		return entries.length ? Object.fromEntries(entries) : undefined;
	}

	return value == null || value === '' ? undefined : value;
}

function toAbsoluteUrl(path, siteUrl) {
	if (!path) {
		return undefined;
	}

	if (/^https?:\/\//i.test(path)) {
		return path;
	}

	return new URL(path.startsWith('/') ? path : `/${path}`, siteUrl).href;
}

function buildPostalAddress(property) {
	const street = property.address?.street?.trim();
	const neighborhood = property.address?.neighborhood?.name?.trim();
	const city = property.address?.city?.name?.trim();
	const state = property.address?.state?.slug?.trim()?.toUpperCase();
	const country = property.address?.country?.trim() || 'BR';

	return compactObject({
		'@type': 'PostalAddress',
		streetAddress: street || neighborhood || undefined,
		addressLocality: city,
		addressRegion: state,
		addressCountry: country,
	});
}

function buildFloorSize(property) {
	const sizeSqm = property.overview?.sizeSqm;

	if (!sizeSqm) {
		return undefined;
	}

	return {
		'@type': 'QuantitativeValue',
		value: sizeSqm,
		unitCode: 'MTK',
		unitText: 'm²',
	};
}

function buildAmenityFeatures(property) {
	return (property.features || []).map((name) => ({
		'@type': 'LocationFeatureSpecification',
		name,
		value: true,
	}));
}

function buildOffer({ property, listingUrl, siteUrl }) {
	if (!property.price?.amount) {
		return undefined;
	}

	return compactObject({
		'@type': 'Offer',
		price: property.price.amount,
		priceCurrency: property.price.currency || 'BRL',
		availability: 'https://schema.org/InStock',
		businessFunction: 'https://schema.org/Sell',
		url: listingUrl,
		offeredBy: {
			'@type': 'RealEstateAgent',
			name: SITE_NAME,
			url: SITE_URL,
			telephone: SITE_PHONE_TEL,
			email: SITE_EMAIL,
		},
	});
}

function buildVideo(property) {
	const videoUrl = getPropertyVideoUrl(property);

	if (!videoUrl) {
		return undefined;
	}

	return compactObject({
		'@type': 'VideoObject',
		name: property.title,
		embedUrl: videoUrl,
		contentUrl: videoUrl,
	});
}

export function buildPropertyListingUrl(slug, siteUrl = SITE_URL) {
	return new URL(`/imovel/${slug}`, siteUrl).href;
}

export function buildPropertyRealEstateListingJsonLd({
	property,
	slug,
	displayTitle,
	description,
	siteUrl = SITE_URL,
}) {
	const listingUrl = buildPropertyListingUrl(slug, siteUrl);
	const images = (property.images || [])
		.map((image) => toAbsoluteUrl(getPropertyImageUrl(slug, image.file), siteUrl))
		.filter(Boolean);
	const plainDescription =
		description?.trim() ||
		stripHtml(property.descriptionHtml).slice(0, 5000) ||
		displayTitle;
	const bedrooms = property.overview?.bedrooms;
	const bathrooms = property.overview?.bathrooms;
	const garages = property.overview?.garages;

	const listing = compactObject({
		'@type': 'RealEstateListing',
		'@id': `${listingUrl}#listing`,
		name: displayTitle,
		description: plainDescription,
		url: listingUrl,
		mainEntityOfPage: listingUrl,
		datePosted: property.importedAt?.slice(0, 10),
		category: getCategoryLabel(property.category),
		identifier: compactObject({
			'@type': 'PropertyValue',
			propertyID: getPropertyCode(property),
			name: 'Código do imóvel',
			value: getPropertyCode(property),
		}),
		image: images.length ? images : undefined,
		video: buildVideo(property),
		address: buildPostalAddress(property),
		floorSize: buildFloorSize(property),
		numberOfBedrooms: bedrooms ?? undefined,
		numberOfBathroomsTotal: bathrooms ?? undefined,
		numberOfRooms: bedrooms ?? undefined,
		amenityFeature: buildAmenityFeatures(property),
		offers: buildOffer({ property, listingUrl, siteUrl }),
		additionalProperty: compactObject([
			garages != null
				? {
						'@type': 'PropertyValue',
						name: 'Vagas de garagem',
						value: garages,
					}
				: undefined,
			property.overview?.deliveryYear
				? {
						'@type': 'PropertyValue',
						name: 'Previsão de entrega',
						value: property.overview.deliveryYear,
					}
				: undefined,
		]),
	});

	return compactObject({
		'@context': 'https://schema.org',
		'@graph': [listing],
	});
}
