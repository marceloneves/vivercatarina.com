import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
	buildPropertySlug,
	ensureUniquePropertySlug,
} from '../src/lib/property-slug.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imoveisDir = join(root, 'src/data/imoveis');
const indexPath = join(imoveisDir, 'index.json');
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const usedSlugs = new Set();
const migrations = [];

for (const entry of index.properties) {
	const oldSlug = entry.slug;
	const filePath = join(imoveisDir, oldSlug, 'property.json');
	const property = JSON.parse(readFileSync(filePath, 'utf8'));
	const baseSlug = buildPropertySlug(property);
	const newSlug = ensureUniquePropertySlug(baseSlug, usedSlugs, property.id);
	usedSlugs.add(newSlug);

	if (oldSlug === newSlug) {
		continue;
	}

	migrations.push({ oldSlug, newSlug, propertyId: property.id });
}

if (!migrations.length) {
	console.log('Nenhuma slug precisou ser alterada.');
	process.exit(0);
}

for (const { oldSlug, propertyId } of migrations) {
	const oldPath = join(imoveisDir, oldSlug);
	const tempPath = join(imoveisDir, `__migrate-${propertyId}`);

	if (!existsSync(oldPath)) {
		throw new Error(`Diretório não encontrado: ${oldSlug}`);
	}

	renameSync(oldPath, tempPath);
}

for (const { oldSlug, newSlug, propertyId } of migrations) {
	const tempPath = join(imoveisDir, `__migrate-${propertyId}`);
	const newPath = join(imoveisDir, newSlug);
	const property = JSON.parse(readFileSync(join(tempPath, 'property.json'), 'utf8'));

	property.slug = newSlug;
	property.sourceUrl = `https://lancamentossc.com.br/site/property/${newSlug}/`;
	if (property.address?.state) {
		property.address.state.slug = 'sc';
	}

	writeFileSync(join(tempPath, 'property.json'), `${JSON.stringify(property, null, 2)}\n`, 'utf8');
	renameSync(tempPath, newPath);

	const indexEntry = index.properties.find((entry) => entry.slug === oldSlug);
	if (indexEntry) {
		indexEntry.slug = newSlug;
	}

	console.log(`${oldSlug} -> ${newSlug}`);
}

writeFileSync(
	indexPath,
	`${JSON.stringify(
		{
			...index,
			slugsMigratedAt: new Date().toISOString(),
		},
		null,
		2,
	)}\n`,
	'utf8',
);

console.log(`Slugs migradas: ${migrations.length}`);

const generateBairros = spawnSync('node', ['scripts/generate-bairro-listings.mjs'], {
	cwd: root,
	stdio: 'inherit',
});

if (generateBairros.status !== 0) {
	process.exit(generateBairros.status ?? 1);
}

const generateLancamentos = spawnSync('node', ['scripts/generate-lancamentos-by-kind.mjs'], {
	cwd: root,
	stdio: 'inherit',
});

if (generateLancamentos.status !== 0) {
	process.exit(generateLancamentos.status ?? 1);
}
