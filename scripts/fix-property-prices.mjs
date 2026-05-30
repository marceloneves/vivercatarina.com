import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolvePropertyPrice } from '../src/lib/property-price.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imoveisDir = join(root, 'src/data/imoveis');
const index = JSON.parse(readFileSync(join(imoveisDir, 'index.json'), 'utf8'));

let updated = 0;

for (const entry of index.properties) {
	const filePath = join(imoveisDir, entry.slug, 'property.json');
	const property = JSON.parse(readFileSync(filePath, 'utf8'));
	const resolved = resolvePropertyPrice({
		...property.price,
		descriptionHtml: property.descriptionHtml,
	});

	if (resolved.amount === property.price?.amount) {
		continue;
	}

	const previousAmount = property.price?.amount;
	property.price = resolved;
	writeFileSync(filePath, `${JSON.stringify(property, null, 2)}\n`, 'utf8');
	entry.price = resolved.amount;
	updated += 1;
	console.log(`${entry.slug}: ${previousAmount} -> ${resolved.amount}`);
}

writeFileSync(
	join(imoveisDir, 'index.json'),
	`${JSON.stringify(
		{
			...index,
			pricesFixedAt: new Date().toISOString(),
		},
		null,
		2,
	)}\n`,
	'utf8',
);

console.log(`Preços corrigidos: ${updated}`);
