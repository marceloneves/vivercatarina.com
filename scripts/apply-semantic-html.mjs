import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySemanticHtml } from '../src/lib/semantic-html.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const templateDir = join(root, 'src/content/template-pages');

function walkHtmlFiles(dir) {
	const entries = readdirSync(dir);
	const files = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
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
	const original = readFileSync(filePath, 'utf8');
	const next = applySemanticHtml(original);

	if (next !== original) {
		writeFileSync(filePath, next, 'utf8');
		updated += 1;
	}
}

console.log(`HTML semântico aplicado em ${updated} arquivo(s).`);
