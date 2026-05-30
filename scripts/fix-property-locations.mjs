import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sanitizeImportedLocation } from '../src/lib/property-data.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imoveisDir = join(root, 'src/data/imoveis');
const index = JSON.parse(readFileSync(join(imoveisDir, 'index.json'), 'utf8'));

let cleared = 0;
let kept = 0;

for (const entry of index.properties) {
	const filePath = join(imoveisDir, entry.slug, 'property.json');
	const property = JSON.parse(readFileSync(filePath, 'utf8'));
	const sanitized = sanitizeImportedLocation(property.location);

	if (sanitized) {
		property.location = sanitized;
		kept += 1;
	} else if (property.location) {
		delete property.location;
		cleared += 1;
	}

	writeFileSync(filePath, `${JSON.stringify(property, null, 2)}\n`, 'utf8');
}

console.log(`Coordenadas mantidas: ${kept}`);
console.log(`Coordenadas inválidas removidas: ${cleared}`);
