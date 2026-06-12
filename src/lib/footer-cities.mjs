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
	const subdomain = city.subdomain || slugifyText(city.name).replace(/-/g, '');

	return {
		...city,
		href: `https://${subdomain}.${CITY_PORTAL_DOMAIN}`,
	};
}

export function buildFooterCitiesSectionHtml() {
	const regions = listFooterCitiesByRegion();
	const regionsHtml = regions
		.map(({ region, cities }) => {
			const items = cities
				.map(({ name, href }) => `<li><a href="${href}">${name}</a></li>`)
				.join('\n                                ');

			return `                        <div class="footer-cities-region">
                            <h4 class="footer-cities-region-title">${region}</h4>
                            <ul class="footer-cities-list">
                                ${items}
                            </ul>
                        </div>`;
		})
		.join('\n');

	return `                <section class="footer-cities-section" aria-label="Cidades atendidas">
            <div class="container">
                <div class="footer-cities-wrap">
                    <h3 class="widget_title">Cidades de Santa Catarina</h3>
                    <div class="footer-cities-regions">
${regionsHtml}
                    </div>
                </div>
            </div>
        </section>
`;
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
