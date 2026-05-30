import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getKindLabel, PROPERTY_KINDS } from '../src/lib/property-kind.mjs';
import {
	FLORIANOPOLIS_CITY_SLUG,
	isSiteEligibleProperty,
	loadProperty,
} from '../src/lib/property-data.mjs';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const imoveisIndexPath = join(root, 'src/data/imoveis/index.json');
const imoveisDir = join(root, 'src/data/imoveis');
const outputDir = join(root, 'src/data/lancamentos');

function loadPropertySummary(slug, indexEntry) {
	const propertyPath = join(imoveisDir, slug, 'property.json');
	let thumbnail = null;

	if (existsSync(propertyPath)) {
		const property = JSON.parse(readFileSync(propertyPath, 'utf8'));
		thumbnail = property.images?.[0]?.file || null;
	}

	return {
		slug,
		id: indexEntry.id,
		title: indexEntry.title,
		category: indexEntry.category,
		kind: indexEntry.kind,
		city: indexEntry.city,
		price: indexEntry.price,
		dataPath: `imoveis/${slug}/property.json`,
		thumbnail: thumbnail ? `imoveis/${slug}/${thumbnail}` : null,
	};
}

function main() {
	mkdirSync(outputDir, { recursive: true });

	const imoveisIndex = JSON.parse(readFileSync(imoveisIndexPath, 'utf8'));
	const grouped = Object.fromEntries(PROPERTY_KINDS.map((kind) => [kind, []]));

	for (const entry of imoveisIndex.properties) {
		if (entry.city !== FLORIANOPOLIS_CITY_SLUG || !entry.kind || !grouped[entry.kind]) {
			continue;
		}

		const property = loadProperty(entry.slug);

		if (!property || !isSiteEligibleProperty(property)) {
			continue;
		}

		grouped[entry.kind].push(loadPropertySummary(entry.slug, entry));
	}

	const summary = [];

	for (const kind of PROPERTY_KINDS) {
		const properties = grouped[kind].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
		const payload = {
			kind,
			name: getKindLabel(kind),
			generatedAt: new Date().toISOString(),
			total: properties.length,
			properties,
		};

		writeFileSync(join(outputDir, `${kind}.json`), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

		summary.push({
			kind,
			name: payload.name,
			total: properties.length,
		});
	}

	writeFileSync(
		join(outputDir, 'index.json'),
		`${JSON.stringify(
			{
				generatedAt: new Date().toISOString(),
				totalProperties: summary.reduce((acc, item) => acc + item.total, 0),
				kinds: summary,
			},
			null,
			2,
		)}\n`,
		'utf8',
	);

	console.log(`Listagens por tipo geradas: ${PROPERTY_KINDS.length}`);
	for (const item of summary) {
		console.log(`  ${item.name}: ${item.total}`);
	}
}

main();
