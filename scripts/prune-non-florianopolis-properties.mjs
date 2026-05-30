import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FLORIANOPOLIS_CITY_SLUG } from '../src/lib/property-data.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const imoveisDir = join(root, 'src/data/imoveis');
const indexPath = join(imoveisDir, 'index.json');

const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const floripaEntries = index.properties.filter(
	(entry) => entry.city === FLORIANOPOLIS_CITY_SLUG,
);
const floripaSlugs = new Set(floripaEntries.map((entry) => entry.slug));

let removedFolders = 0;

for (const entry of index.properties) {
	if (floripaSlugs.has(entry.slug)) {
		continue;
	}

	const folderPath = join(imoveisDir, entry.slug);

	if (existsSync(folderPath)) {
		rmSync(folderPath, { recursive: true, force: true });
		removedFolders += 1;
	}
}

writeFileSync(
	indexPath,
	`${JSON.stringify(
		{
			...index,
			total: floripaEntries.length,
			properties: floripaEntries,
			prunedAt: new Date().toISOString(),
		},
		null,
		2,
	)}\n`,
	'utf8',
);

console.log(`Imóveis mantidos: ${floripaEntries.length}`);
console.log(`Pastas removidas: ${removedFolders}`);
