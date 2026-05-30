import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dataRoot = join(process.cwd(), 'src/data/imoveis');

function loadProperties() {
	return readdirSync(dataRoot)
		.filter((entry) => !entry.includes('.'))
		.map((slug) => {
			const filePath = join(dataRoot, slug, 'property.json');
			const property = JSON.parse(readFileSync(filePath, 'utf8'));
			return { slug, filePath, property };
		});
}

function resolveUniqueCode(property, usedCodes) {
	const current = property.overview?.code?.trim();
	const fallback = property.id != null ? String(property.id) : property.slug;

	if (current && !usedCodes.has(current)) {
		usedCodes.add(current);
		return { code: current, changed: false, reason: null };
	}

	let candidate = fallback;
	let suffix = 1;

	while (usedCodes.has(candidate)) {
		candidate = `${fallback}-${suffix}`;
		suffix += 1;
	}

	usedCodes.add(candidate);

	return {
		code: candidate,
		changed: true,
		reason: current
			? `código duplicado ou ausente (${current || 'vazio'})`
			: 'código ausente',
	};
}

function main() {
	const entries = loadProperties();
	const usedCodes = new Set();
	const changes = [];

	for (const entry of entries.sort((a, b) => a.property.id - b.property.id)) {
		const result = resolveUniqueCode(entry.property, usedCodes);

		if (!result.changed) {
			continue;
		}

		entry.property.overview = {
			...entry.property.overview,
			code: result.code,
		};

		writeFileSync(entry.filePath, `${JSON.stringify(entry.property, null, 2)}\n`, 'utf8');
		changes.push({
			slug: entry.slug,
			code: result.code,
			reason: result.reason,
		});
	}

	console.log(`Verificados ${entries.length} lançamentos.`);
	console.log(`Ajustados ${changes.length} códigos.`);

	for (const change of changes) {
		console.log(`- ${change.slug}: #${change.code} (${change.reason})`);
	}
}

main();
