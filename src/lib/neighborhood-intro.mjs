import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dataRoot = join(process.cwd(), 'src/data');

let neighborhoodsCache;

function loadNeighborhoods() {
	if (!neighborhoodsCache) {
		neighborhoodsCache = JSON.parse(
			readFileSync(join(dataRoot, 'florianopolis-neighborhoods.json'), 'utf8'),
		);
	}

	return neighborhoodsCache;
}

/** @param {string | null | undefined} neighborhoodName @param {string | null | undefined} [neighborhoodSlug] */
export function resolveNeighborhoodEntry(neighborhoodName, neighborhoodSlug) {
	const neighborhoods = loadNeighborhoods();
	const bySlug = new Map(neighborhoods.map((entry) => [entry.slug, entry]));
	const byName = new Map(neighborhoods.map((entry) => [entry.name.toLowerCase(), entry]));

	if (neighborhoodSlug && bySlug.has(neighborhoodSlug)) {
		return bySlug.get(neighborhoodSlug);
	}

	if (neighborhoodName) {
		const byExactName = byName.get(neighborhoodName.toLowerCase());

		if (byExactName) {
			return byExactName;
		}
	}

	return null;
}

/** @param {string | null | undefined} neighborhoodName @param {string | null | undefined} [neighborhoodSlug] */
export function buildNeighborhoodIntroTitle(neighborhoodName, neighborhoodSlug) {
	if (!neighborhoodName || neighborhoodName === 'Não informado') {
		return 'Conheça o bairro';
	}

	const entry = resolveNeighborhoodEntry(neighborhoodName, neighborhoodSlug);
	const name = entry?.name ?? neighborhoodName;

	return `Conheça o bairro ${name}`;
}
