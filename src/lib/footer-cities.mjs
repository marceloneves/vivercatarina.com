import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getHomeHeroBackgroundUrl } from './home-page.mjs';

const dataPath = join(process.cwd(), 'src/data/footer-cities-by-region.json');

export function listFooterCitiesByRegion() {
	return JSON.parse(readFileSync(dataPath, 'utf8'));
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
