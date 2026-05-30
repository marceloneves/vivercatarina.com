import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBairroSidebarHtml } from '../src/lib/template-html.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const templateDir = join(root, 'src/content/template-pages');

function walkHtmlFiles(dir) {
	const files = [];

	for (const entry of readdirSync(dir)) {
		const fullPath = join(dir, entry);
		if (statSync(fullPath).isDirectory()) {
			files.push(...walkHtmlFiles(fullPath));
			continue;
		}

		if (entry.endsWith('.html')) {
			files.push(fullPath);
		}
	}

	return files;
}

let updated = 0;

for (const filePath of walkHtmlFiles(templateDir)) {
	const html = readFileSync(filePath, 'utf8');

	if (!html.includes('Imóveis em destaque') && !html.includes('Featured Listings')) {
		continue;
	}

	const cleaned = prepareBairroSidebarHtml(html, '');

	if (cleaned === html) {
		continue;
	}

	writeFileSync(filePath, cleaned, 'utf8');
	updated += 1;
	console.log(filePath.replace(`${root}/`, ''));
}

console.log(`Templates atualizados: ${updated}`);
