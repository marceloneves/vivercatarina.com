import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	buildRobotsTxt,
	buildLlmsTxt,
	renderSitemapIndexXml,
	renderSitemapXml,
	SITEMAP_FILES,
} from '../src/lib/sitemap.mjs';

const publicDir = join(process.cwd(), 'public');

for (const { path, getEntries } of SITEMAP_FILES) {
	const filename = path.replace(/^\//, '');
	writeFileSync(join(publicDir, filename), renderSitemapXml(getEntries()));
}

writeFileSync(join(publicDir, 'sitemap-index.xml'), renderSitemapIndexXml());
writeFileSync(join(publicDir, 'robots.txt'), buildRobotsTxt());
writeFileSync(join(publicDir, 'llms.txt'), buildLlmsTxt());

console.log('Sitemaps, robots.txt e llms.txt gerados em public/');
