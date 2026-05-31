import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const redirectsPath = join(process.cwd(), 'src/data/property-slug-redirects.json');

let cache;

export function getPropertySlugRedirects() {
	if (cache) {
		return cache;
	}

	if (!existsSync(redirectsPath)) {
		cache = {};
		return cache;
	}

	cache = JSON.parse(readFileSync(redirectsPath, 'utf8'));
	return cache;
}

export function resolvePropertySlugRedirect(slug) {
	return getPropertySlugRedirects()[slug] || null;
}
