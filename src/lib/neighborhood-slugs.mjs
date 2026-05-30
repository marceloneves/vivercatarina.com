import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const dataRoot = join(process.cwd(), 'src/data');

let pageSlugsCache;
let aliasesCache;

function loadPageSlugs() {
	if (!pageSlugsCache) {
		const neighborhoods = JSON.parse(
			readFileSync(join(dataRoot, 'florianopolis-neighborhoods.json'), 'utf8'),
		);
		pageSlugsCache = new Set(neighborhoods.map(({ slug }) => slug));
	}

	return pageSlugsCache;
}

function loadAliases() {
	if (!aliasesCache) {
		aliasesCache = JSON.parse(
			readFileSync(join(dataRoot, 'bairros/neighborhood-aliases.json'), 'utf8'),
		);
	}

	return aliasesCache;
}

export function resolveNeighborhoodPageSlug(sourceSlug) {
	if (!sourceSlug) {
		return null;
	}

	const pageSlugs = loadPageSlugs();
	const aliases = loadAliases();

	if (pageSlugs.has(sourceSlug)) {
		return sourceSlug;
	}

	if (aliases[sourceSlug]) {
		return aliases[sourceSlug];
	}

	const compact = sourceSlug.replace(/-/g, '');

	for (const slug of pageSlugs) {
		if (slug.replace(/-/g, '') === compact) {
			return slug;
		}
	}

	return null;
}
