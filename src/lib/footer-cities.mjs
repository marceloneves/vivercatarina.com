import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getHomeHeroBackgroundUrl } from './home-page.mjs';
import { slugifyText } from './property-slug.mjs';

const dataPath = join(process.cwd(), 'src/data/footer-cities-by-region.json');
const CITY_PORTAL_DOMAIN = 'vivercatarina.com';

export function buildCityPortalUrl(cityName) {
	const subdomain = slugifyText(cityName).replace(/-/g, '');

	return `https://${subdomain}.${CITY_PORTAL_DOMAIN}`;
}

function withCityPortalHref(city) {
	return {
		...city,
		href: city.subdomain ? "https://" + city.subdomain + ".vivercatarina.com" : buildCityPortalUrl(city.name),
	};
}

export function listFooterCitiesByRegion() {
	const regions = JSON.parse(readFileSync(dataPath, 'utf8'));

	return regions.map(({ region, cities }) => ({
		region,
		cities: cities.map(withCityPortalHref),
	}));
}

export function loadHomeCityCards() {
	const regions = listFooterCitiesByRegion();
	const heroImageUrl = getHomeHeroBackgroundUrl();
	const cards = [];

	for (const { region, cities } of regions) {
		for (const city of cities) {
			cards.push({
				name: city.name,
				href: city.href,
				region,
				imageUrl: heroImageUrl,
			});
		}
	}

	return cards;
}
