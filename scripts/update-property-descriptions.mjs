import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const root = join(process.cwd());
const defaultSource = join(
	'/Users/marceloneves/Downloads/us.sitesucker.mac.sitesucker-pro/sitereferencia/site',
);
const sourceSiteDir = process.env.REFERENCE_SITE_PATH || defaultSource;
const propertySourceDir = join(sourceSiteDir, 'property');
const imoveisDir = join(root, 'src/data/imoveis');

function firstMatch(html, pattern) {
	if (!html) {
		return '';
	}
	const match = html.match(pattern);
	return match ? match[1] ?? match[0] : '';
}

function extractDescription(bodyHtml) {
	return firstMatch(
		bodyHtml,
		/g5ere__property-block-description[\s\S]*?<div class="card-body">\s*([\s\S]*?)\s*<\/div>\s*<\/div><\/div>\s*<div class="g5ere__single-block g5ere__property-block g5ere__property-block-overview/,
	).trim();
}

function main() {
	let updated = 0;
	let missing = 0;

	for (const entry of readdirSync(imoveisDir, { withFileTypes: true })) {
		if (!entry.isDirectory()) {
			continue;
		}

		const slug = entry.name;
		const propertyPath = join(imoveisDir, slug, 'property.json');
		const sourceHtmlPath = join(propertySourceDir, slug, 'index.html');

		if (!existsSync(propertyPath) || !existsSync(sourceHtmlPath)) {
			missing += 1;
			continue;
		}

		const property = JSON.parse(readFileSync(propertyPath, 'utf8'));
		const html = readFileSync(sourceHtmlPath, 'utf8');
		const similarIndex = html.indexOf('g5ere__property-block-similar');
		const propertyMatch = html.match(
			/<div id="property-\d+" class="([^"]*g5ere__single-property[^"]*)"/,
		);

		if (!propertyMatch) {
			missing += 1;
			continue;
		}

		const bodyStart = html.indexOf(propertyMatch[0]);
		const bodyHtml =
			similarIndex > bodyStart ? html.slice(bodyStart, similarIndex) : html.slice(bodyStart);
		const descriptionHtml = extractDescription(bodyHtml);

		if (descriptionHtml === property.descriptionHtml) {
			continue;
		}

		property.descriptionHtml = descriptionHtml;
		writeFileSync(propertyPath, `${JSON.stringify(property, null, 2)}\n`, 'utf8');
		updated += 1;
	}

	console.log(`Descrições atualizadas: ${updated}`);
	console.log(`Sem origem/descrição: ${missing}`);
}

main();
