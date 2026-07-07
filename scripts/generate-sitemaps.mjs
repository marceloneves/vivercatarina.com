import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	buildRobotsTxt,
	buildLlmsTxt,
	buildLlmsTxtEs,
	renderSitemapIndexXml,
	renderSitemapXml,
	SITEMAP_FILES,
} from '../src/lib/sitemap.mjs';

const publicDir = join(process.cwd(), 'public');

for (const { path, getEntries } of SITEMAP_FILES) {
	const filename = path.replace(/^\//, '');
	writeFileSync(join(publicDir, filename), renderSitemapXml(getEntries()));
}

const sitemapIndexXml = renderSitemapIndexXml();

writeFileSync(join(publicDir, 'sitemap-index.xml'), sitemapIndexXml);
writeFileSync(join(publicDir, 'robots.txt'), buildRobotsTxt());
writeFileSync(join(publicDir, 'llms.txt'), buildLlmsTxt());

// Espelho ES do llms.txt em /es/llms.txt (site bilíngue).
mkdirSync(join(publicDir, 'es'), { recursive: true });
writeFileSync(join(publicDir, 'es', 'llms.txt'), buildLlmsTxtEs());

console.log('Sitemaps, robots.txt e llms.txt (pt + es) gerados em public/');
