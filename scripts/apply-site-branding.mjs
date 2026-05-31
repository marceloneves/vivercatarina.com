import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const targets = [
	join(root, 'src/content/template-pages'),
	join(root, 'scripts/home-page-translations.mjs'),
	join(root, 'scripts/import-template-pages.mjs'),
	join(root, 'README.md'),
];

const replacements = [
	['Na Planta SC', 'Viver Catarina'],
	['naplantasc.com.br', 'vivercatarina.com'],
	[/https:\/\/[a-z0-9-]+\.naplantasc\.com/g, 'https://florianopolis.vivercatarina.com'],
	['infomail123@domain.com', 'contato@vivercatarina.com'],
	['infomailexample@mail.com', 'contato@vivercatarina.com'],
	['info@agency.com', 'contato@vivercatarina.com'],
	['alt="Piller-html"', 'alt="Viver Catarina"'],
	['>Piller</a>. All Rights Reserved.', '>Viver Catarina</a>. Todos os direitos reservados.'],
	['>Piller</a>. Todos os direitos reservados.', '>Viver Catarina</a>. Todos os direitos reservados.'],
];

function applyBranding(content) {
	let output = content;

	for (const [from, to] of replacements) {
		output = typeof from === 'string' ? output.replaceAll(from, to) : output.replace(from, to);
	}

	return output;
}

function walkFiles(dir) {
	const entries = readdirSync(dir);
	const files = [];

	for (const entry of entries) {
		const fullPath = join(dir, entry);
		const stats = statSync(fullPath);

		if (stats.isDirectory()) {
			files.push(...walkFiles(fullPath));
			continue;
		}

		if (fullPath.endsWith('.html') || fullPath.endsWith('.mjs') || fullPath.endsWith('.md')) {
			files.push(fullPath);
		}
	}

	return files;
}

let updated = 0;

for (const target of targets) {
	const files = statSync(target).isDirectory() ? walkFiles(target) : [target];

	for (const file of files) {
		const original = readFileSync(file, 'utf8');
		const next = applyBranding(original);

		if (next !== original) {
			writeFileSync(file, next, 'utf8');
			updated += 1;
		}
	}
}

console.log(`Branding aplicado em ${updated} arquivo(s).`);
