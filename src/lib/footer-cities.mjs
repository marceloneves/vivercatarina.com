import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getHomeHeroBackgroundUrl } from './home-page.mjs';
import { slugifyText } from './property-slug.mjs';

const dataPath = join(process.cwd(), 'src/data/footer-cities-by-region.json');
const CITY_PORTAL_DOMAIN = 'vivercatarina.com';
const CITY_IMAGES_DIR = join(process.cwd(), 'public/assets/img/cities');

function getCityImageUrl(subdomain, fallbackUrl) {
	const relativePath = `/assets/img/cities/${subdomain}.webp`;

	if (existsSync(join(CITY_IMAGES_DIR, `${subdomain}.webp`))) {
		return relativePath;
	}

	return fallbackUrl;
}

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

export function buildCitiesMenuHtml() {
	const regions = listFooterCitiesByRegion();
	const regionsHtml = regions
		.map(({ region, cities }) => {
			const items = cities
				.map(
					({ name, href }) =>
						`<li><a href="${href}" target="_blank" rel="noopener noreferrer">${name}</a></li>`,
				)
				.join('\n                                                    ');

			return `                                                <li class="menu-item-has-children">
                                                    <a href="#">${region}</a>
                                                    <ul class="sub-menu">
                                                    ${items}
                                                    </ul>
                                                </li>`;
		})
		.join('\n');

	return `<li class="menu-item-has-children">
                                        <a href="#">Cidades</a>
                                        <ul class="sub-menu">
${regionsHtml}
                                        </ul>
                                    </li>`;
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
			const subdomain = city.subdomain || slugifyText(city.name).replace(/-/g, '');

			cards.push({
				name: city.name,
				href: city.href,
				region,
				imageUrl: getCityImageUrl(subdomain, heroImageUrl),
			});
		}
	}

	return cards.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

export function loadHomeCityCardsByRegion() {
	const regions = listFooterCitiesByRegion();
	const heroImageUrl = getHomeHeroBackgroundUrl();

	return regions.map(({ region, cities }) => ({
		region,
		cities: cities
			.map((city) => {
				const subdomain = city.subdomain || slugifyText(city.name).replace(/-/g, '');

				return {
					name: city.name,
					href: city.href,
					region,
					imageUrl: getCityImageUrl(subdomain, heroImageUrl),
				};
			})
			.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
	}));
}
