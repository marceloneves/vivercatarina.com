import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildPropertySlug, ensureUniquePropertySlug } from '../src/lib/property-slug.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imoveisDir = join(root, 'src/data/imoveis');
const indexPath = join(imoveisDir, 'index.json');
const redirectsPath = join(root, 'src/data/property-slug-redirects.json');
const vercelPath = join(root, 'vercel.json');
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const usedSlugs = new Set();
const migrations = [];
const redirectMap = {};

for (const entry of index.properties) {
	const oldSlug = entry.slug;
	const filePath = join(imoveisDir, oldSlug, 'property.json');
	const property = JSON.parse(readFileSync(filePath, 'utf8'));
	const baseSlug = buildPropertySlug(property);
	const newSlug = ensureUniquePropertySlug(baseSlug, usedSlugs, property);
	usedSlugs.add(newSlug);

	if (oldSlug !== newSlug) {
		migrations.push({ oldSlug, newSlug, propertyId: property.id });
	}
}

const existingRedirects = existsSync(redirectsPath)
	? JSON.parse(readFileSync(redirectsPath, 'utf8'))
	: {};

for (const { oldSlug, newSlug } of migrations) {
	redirectMap[oldSlug] = newSlug;

	if (existingRedirects[oldSlug] && existingRedirects[oldSlug] !== newSlug) {
		redirectMap[existingRedirects[oldSlug]] = newSlug;
	}
}

for (const [from, to] of Object.entries(existingRedirects)) {
	if (!redirectMap[from] && from !== to) {
		const finalTarget = redirectMap[to] || to;
		if (from !== finalTarget) {
			redirectMap[from] = finalTarget;
		}
	}
}

if (!migrations.length) {
	console.log('Nenhuma slug precisou ser alterada.');
	writeFileSync(redirectsPath, `${JSON.stringify(redirectMap, null, 2)}\n`, 'utf8');
	updateVercelRedirects(redirectMap);
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

writeFileSync(redirectsPath, `${JSON.stringify(redirectMap, null, 2)}\n`, 'utf8');
updateVercelRedirects(redirectMap);

console.log(`Slugs migradas: ${migrations.length}`);
console.log(`Redirects 301: ${Object.keys(redirectMap).length}`);

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

function updateVercelRedirects(map) {
	const vercel = JSON.parse(readFileSync(vercelPath, 'utf8'));
	const staticRedirects = (vercel.redirects || []).filter(
		(entry) => !entry.source.startsWith('/imovel/') && !entry.source.startsWith('/property/'),
	);

	for (const [from, to] of Object.entries(map)) {
		staticRedirects.push(
			{
				source: `/imovel/${from}`,
				destination: `/imovel/${to}`,
				permanent: true,
			},
			{
				source: `/property/${from}`,
				destination: `/imovel/${to}`,
				permanent: true,
			},
		);
	}

	vercel.redirects = staticRedirects;
	writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`, 'utf8');
}
