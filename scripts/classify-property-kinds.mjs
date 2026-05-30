import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inferPropertyKind, resolvePropertyKind } from '../src/lib/property-kind.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const imoveisDir = join(root, 'src/data/imoveis');
const indexPath = join(imoveisDir, 'index.json');

const counts = Object.fromEntries(['apartamento', 'casa', 'loteamento'].map((kind) => [kind, 0]));

for (const slug of readdirSync(imoveisDir, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)) {
	const propertyPath = join(imoveisDir, slug, 'property.json');

	if (!existsSync(propertyPath)) {
		continue;
	}

	const property = JSON.parse(readFileSync(propertyPath, 'utf8'));
	const kind = resolvePropertyKind(property);
	counts[kind] += 1;

	if (property.kind !== kind) {
		property.kind = kind;
		writeFileSync(propertyPath, `${JSON.stringify(property, null, 2)}\n`, 'utf8');
	}
}

const index = JSON.parse(readFileSync(indexPath, 'utf8'));

for (const entry of index.properties) {
	const propertyPath = join(imoveisDir, entry.slug, 'property.json');
	const property = JSON.parse(readFileSync(propertyPath, 'utf8'));
	entry.kind = property.kind || inferPropertyKind(property);
}

writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');

console.log('Classificação por tipo:');
for (const [kind, total] of Object.entries(counts)) {
	console.log(`  ${kind}: ${total}`);
}

console.log(`Atualizado: ${index.properties.length} imóveis`);
