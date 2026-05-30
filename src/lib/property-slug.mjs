import { resolvePropertyCityName } from './property-data.mjs';

const SLUG_PART_PATTERN = /[^a-z0-9]+/g;

const REGIONAL_CITY_NAMES = new Set([
	'Grande Florianópolis',
	'Litoral Norte',
	'Litoral Sul',
	'Oeste',
	'Serra Catarinense',
	'Sul',
	'Vale do Itajaí',
]);

const TITLE_PREFIX_PATTERNS = [
	/^pr[oó]ximo\s+da\s+praia\s+da\s+/i,
	/^pr[oó]ximo\s+da\s+praia\s*,\s*/i,
	/^pr[oó]ximo\s+da\s+praia\s+em\s+/i,
	/^lan[cç]amento\s+spe\s*,?\s*/i,
	/^lan[cç]amento\s+spe\s+(?:a|em)\s+/i,
	/^lan[cç]amento\s+em\s+florian[oó]polis\s*[-–]?\s*/i,
	/^lan[cç]amento\s*,?\s*/i,
	/^pr[eé][\s-]?lan[cç]amento\s*,?\s*/i,
	/^em\s+lan[cç]amento\s*,?\s*/i,
	/^novo\s+e\s+pronto\s+para\s+morar[.!]?\s*/i,
	/^alto\s+padr[aã]o\s*,?\s*/i,
	/^alto\s+padr[aã]o\s+/i,
	/^constru[cç][aã]o\s+spe\s*,?\s*/i,
	/^\d+\s+passo\s+do\s+mar\s*,?\s*/i,
	/^em\s+florian[oó]polis\s*[-–]?\s*/i,
	/^lan[cç]amento\s+em\s+[^,]+[-–]\s*/i,
];

const EMPREENDIMENTO_HINT =
	/\b(edificio|ed\.|residencial|residence|tower|home|club|spot|ville|village|condominio|empreendimento|mall|park|haus|place|plaza|castello|montello|aurora|haus|haus|spot)\b/i;

const MARKETING_SEGMENT_PATTERNS = [
	/^lan[cç]amento$/i,
	/^pr[eé][\s-]?lan[cç]amento$/i,
	/^em\s+lan[cç]amento$/i,
	/^novo\s+e\s+pronto\s+para\s+morar$/i,
	/^alto\s+padr[aã]o$/i,
	/^apartamento\s+(novo|mobiliado|decorado|semimobiliado)/i,
	/^apartamentos?\s+(duplex|com|de|mobiliado|semimobiliado|alto\s+padr[aã]o|a|100)/i,
	/^apartamentos?\s+/i,
	/^casa\s+(nova|mobiliada|decorada|alto\s+padr[aã]o|financi[aá]vel|a|em|no|na|financi)/i,
	/^casa\s+no\s+condom[ií]nio/i,
	/^casa\s+em\s+condom[ií]nio/i,
	/^casa\s+no\s+empreendimento/i,
	/^casa\s+/i,
	/^loteamento\s+/i,
	/^terrenos?\s+(?:em|no|com)\s+/i,
	/^terrenos?\s+/i,
	/^sobrado\s+(?:em|no)\s+/i,
	/^sobrado\s+/i,
	/^cobertura\s+(mobiliada|decorada|residencial)/i,
	/^novo\s+e\s+pronto\s+para\s+morar$/i,
	/^luxo\s+e\s+sofistica[cç][aã]o$/i,
	/^\d+\s+passo\s+do\s+mar$/i,
	/^constru[cç][aã]o\s+spe$/i,
	/^pr[oó]ximo\s+da\s+praia(?:\s+da\s+.+)?$/i,
	/^em\s+florian[oó]polis$/i,
	/^ao\s+lado\s+do\s+/i,
	/^lan[cç]amento\s+spe$/i,
];

const EMPREENDIMENTO_PREFIX_PATTERNS = [
	/^loteamento\s+/i,
	/^terreno\s+no\s+loteamento\s+/i,
	/^casa\s+alto\s+padr[aã]o\s+no\s+condom[ií]nio\s+/i,
	/^casa\s+decorada\s+e\s+mobiliada\s+no\s+/i,
	/^casa\s+no\s+condom[ií]nio\s+(?:fechado\s+)?/i,
	/^casa\s+em\s+condom[ií]nio\s+(?:fechado\s+)?/i,
	/^condom[ií]nio\s+/i,
	/^casa\s+no\s+empreendimento\s+/i,
	/^casa\s+(?:nova|mobiliada|decorada|financi[aá]vel|alto\s+padr[aã]o)\s+(?:no|em|e\s+)?/i,
	/^casa\s+/i,
	/^casas\s+no\s+/i,
	/^apartamentos?\s+(?:duplex,?\s+)?/i,
	/^apartamentos?\s+(?:com|de|mobiliado|semimobiliado|alto\s+padr[aã]o|a|100)/i,
	/^apartamentos?\s+/i,
	/^terrenos?\s+em\s+condom[ií]nio\s+(?:fechado\s+)?/i,
	/^terrenos?\s+(?:em|no)\s+/i,
	/^terrenos?\s+/i,
	/^sobrado\s+em\s+condom[ií]nio\s*,?\s*/i,
	/^sobrado\s+(?:em|no)\s+/i,
	/^sobrado\s+/i,
	/^cobertura\s+/i,
];

const SLUG_STOP_WORDS = new Set([
	'lancamento',
	'pre',
	'lancamentos',
	'construtura',
	'construcao',
	'apto',
	'spe',
	'loteamento',
	'loteamentos',
	'casa',
	'casas',
	'apartamento',
	'apartamentos',
	'terreno',
	'terrenos',
	'sobrado',
	'sobrados',
	'cobertura',
	'studio',
	'duplex',
	'mobiliado',
	'mobiliada',
	'decorado',
	'decorada',
	'semimobiliado',
	'financiavel',
	'novo',
	'novos',
	'empreendimento',
]);

export function slugifyText(value) {
	if (!value) {
		return '';
	}

	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/&/g, ' e ')
		.replace(SLUG_PART_PATTERN, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

function normalizeForMatch(value) {
	return slugifyText(value).replace(/-/g, '');
}

function stripTrailingSlugPart(nameSlug, partSlug) {
	if (!nameSlug || !partSlug) {
		return nameSlug;
	}

	const suffix = `-${partSlug}`;

	while (nameSlug.endsWith(suffix)) {
		nameSlug = nameSlug.slice(0, -suffix.length);
	}

	return nameSlug.replace(/-+$/g, '');
}

export function removeSlugStopWords(slug) {
	if (!slug) {
		return '';
	}

	return slug
		.split('-')
		.filter((part) => part && !SLUG_STOP_WORDS.has(part))
		.join('-')
		.replace(/-{2,}/g, '-')
		.replace(/^-+|-+$/g, '');
}

function cleanTitle(title) {
	return String(title || '')
		.replace(/\s*[–—]\s*/g, ', ')
		.replace(/;\s*/g, ', ')
		.replace(/\/\s*sc\s*-/gi, ', ')
		.replace(/\/\s*sc\s+/gi, ', ')
		.replace(/\.\s+(?=[A-ZÁÉÍÓÚÀÂÊÔÃÕÇ0-9])/g, ', ')
		.replace(/\s*\/\s*sc\b/gi, '')
		.replace(/\s*\/\s*$/g, '')
		.replace(/\.\s*$/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function cleanSegment(segment) {
	let output = segment.trim();

	for (const pattern of TITLE_PREFIX_PATTERNS) {
		output = output.replace(pattern, '');
	}

	return output.trim();
}

function stripTitlePrefixes(title) {
	let output = cleanTitle(title);

	for (const pattern of TITLE_PREFIX_PATTERNS) {
		output = output.replace(pattern, '');
	}

	return output.trim();
}

function getSignificantLocationWords(text) {
	return String(text || '')
		.split(/\s+/)
		.map((word) => normalizeForMatch(word))
		.filter(
			(word) =>
				word.length >= 3 &&
				!['da', 'de', 'do', 'dos', 'das', 'em', 'no', 'na', 'ao', 'a'].includes(word),
		);
}

function isLocationPartOfEmpreendimentoName(locationName, empreendimentoName) {
	const empKey = normalizeForMatch(empreendimentoName);
	const locKey = normalizeForMatch(locationName);

	if (!empKey || !locKey) {
		return false;
	}

	if (empKey.includes(locKey) || locKey.includes(empKey)) {
		return true;
	}

	const locWords = getSignificantLocationWords(locationName);
	const matchingWords = locWords.filter((word) => empKey.includes(word));

	if (matchingWords.length === 0) {
		return false;
	}

	return matchingWords.some((word) => word.length >= 4) || (locWords.length === 1 && matchingWords.length === 1);
}

function resolveNeighborhoodForTitle(property) {
	let neighborhoodName = property.address?.neighborhood?.name || '';

	if (property.address?.city?.slug === 'florianopolis' && neighborhoodName) {
		return neighborhoodName.split(',')[0].trim();
	}

	if (neighborhoodName.includes(',')) {
		return neighborhoodName.split(',')[0].trim();
	}

	return neighborhoodName;
}

function isPureLocationComplementSegment(segment, cityName, neighborhoodName) {
	const trimmed = segment.trim();

	if (!trimmed || isMarketingSegment(trimmed) || isGenericPropertyDescription(trimmed)) {
		return false;
	}

	if (!segmentIsLocationComplement(trimmed, cityName, neighborhoodName)) {
		return false;
	}

	const wordCount = trimmed.split(/\s+/).length;

	if (wordCount > 4) {
		return false;
	}

	const segmentKey = normalizeForMatch(trimmed);
	const neighborhoodKey = normalizeForMatch(neighborhoodName);
	const cityKey = normalizeForMatch(cityName);

	if (neighborhoodKey && (segmentKey === neighborhoodKey || segmentKey.endsWith(neighborhoodKey))) {
		return true;
	}

	if (cityKey && (segmentKey === cityKey || segmentKey.endsWith(cityKey))) {
		return wordCount <= 3;
	}

	return wordCount <= 2;
}

function segmentIsLocationComplement(segment, cityName, neighborhoodName) {
	if (matchesLocation(segment, cityName, neighborhoodName)) {
		return true;
	}

	const segmentKey = normalizeForMatch(segment);
	const neighborhoodKey = normalizeForMatch(neighborhoodName);
	const cityKey = normalizeForMatch(cityName);

	if (neighborhoodKey && (segmentKey === neighborhoodKey || segmentKey.includes(neighborhoodKey))) {
		return true;
	}

	if (cityKey && (segmentKey === cityKey || segmentKey.includes(cityKey))) {
		return true;
	}

	return false;
}

function stripLocationComplementsFromTitle(title, property) {
	if (!property) {
		return title;
	}

	const cityName = resolveCityName(property);
	const neighborhoodName = resolveNeighborhoodForTitle(property);
	const empreendimentoName = extractEmpreendimentoName(property, cityName, neighborhoodName);
	const segments = parseTitleSegments(title);

	if (segments.length <= 1) {
		return title;
	}

	while (segments.length > 1) {
		const lastSegment = segments[segments.length - 1];

		if (!isPureLocationComplementSegment(lastSegment, cityName, neighborhoodName)) {
			break;
		}

		const locationName = matchesLocation(lastSegment, cityName, '')
			? cityName
			: neighborhoodName || lastSegment;

		if (isLocationPartOfEmpreendimentoName(locationName, empreendimentoName)) {
			break;
		}

		segments.pop();
	}

	return segments.join(', ').replace(/\s+/g, ' ').trim();
}

export function cleanPropertyTitle(title, property = null) {
	let output = stripTitlePrefixes(title)
		.replace(/,?\s*pr[oó]ximo\s+da\s+praia(?:\s+da\s+[^,]+)?\s*,?\s*/gi, ', ')
		.replace(/\s*,\s*,+/g, ', ')
		.replace(/^,\s*/, '')
		.replace(/^(?:a|em)\s+/i, '')
		.replace(/\s{2,}/g, ' ')
		.trim();

	if (property) {
		output = stripLocationComplementsFromTitle(output, { ...property, title: output });
	}

	return output.trim();
}

function parseTitleSegments(title) {
	const cleaned = stripTitlePrefixes(title);

	return cleaned
		.split(',')
		.map((segment) => cleanSegment(segment.replace(/!+$/g, '')))
		.filter(Boolean);
}

function isMarketingSegment(segment) {
	const normalized = segment.trim();

	if (!normalized) {
		return true;
	}

	return MARKETING_SEGMENT_PATTERNS.some((pattern) => pattern.test(normalized));
}

function matchesLocation(segment, cityName, neighborhoodName) {
	const segmentKey = normalizeForMatch(segment);
	const cityKey = normalizeForMatch(cityName);
	const neighborhoodKey = normalizeForMatch(neighborhoodName);

	if (cityKey && segmentKey === cityKey) {
		return true;
	}

	if (neighborhoodKey && segmentKey === neighborhoodKey) {
		return true;
	}

	if (cityName && new RegExp(`\\b${cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(segment)) {
		return true;
	}

	return false;
}

function resolveCityName(property) {
	const neighborhoodName = property.address?.neighborhood?.name || '';

	if (neighborhoodName.includes(',')) {
		return neighborhoodName.split(',').pop().trim();
	}

	const resolved = resolvePropertyCityName(property) || property.address?.city?.name || '';

	if (REGIONAL_CITY_NAMES.has(resolved) && neighborhoodName) {
		return neighborhoodName;
	}

	if (property.address?.city?.slug === 'florianopolis') {
		return 'Florianópolis';
	}

	return resolved;
}

function stripLocationFromText(text, cityName, neighborhoodName) {
	let output = String(text || '').trim();

	if (cityName) {
		const cityPattern = cityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		output = output.replace(new RegExp(`\\s*,?\\s*${cityPattern}\\s*$`, 'i'), '');
		output = output.replace(new RegExp(`\\s+em\\s+${cityPattern}\\s*$`, 'i'), '');
		output = output.replace(new RegExp(`\\s+de\\s+${cityPattern}\\s*$`, 'i'), '');
	}

	if (neighborhoodName && neighborhoodName !== cityName) {
		const neighborhoodPattern = neighborhoodName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		output = output.replace(new RegExp(`\\s*,?\\s*${neighborhoodPattern}\\s*$`, 'i'), '');
	}

	return output.replace(/\s+/g, ' ').trim();
}

function stripEmpreendimentoPrefixes(name) {
	let output = String(name || '').trim();

	for (const pattern of EMPREENDIMENTO_PREFIX_PATTERNS) {
		output = output.replace(pattern, '');
	}

	return output.replace(/\s+/g, ' ').trim();
}

function isGenericPropertyDescription(segment) {
	const normalized = segment.trim();

	if (!normalized) {
		return true;
	}

	return (
		isMarketingSegment(normalized) ||
		MARKETING_SEGMENT_PATTERNS.some((pattern) => pattern.test(normalized))
	);
}

const WEAK_EMPREENDIMENTO_NAME_PATTERNS = [
	/^e$/i,
	/^no$/i,
	/^na$/i,
	/^em$/i,
	/^de$/i,
	/^com$/i,
	/^a$/i,
	/^100$/i,
	/^novo$/i,
	/^nova$/i,
	/^no\s+/i,
	/^na\s+/i,
	/^em\s+/i,
	/^e\s+/i,
	/^sacada\b/i,
	/^finamente\b/i,
	/^\d+\s+na\s+/i,
	/^condominio\b/i,
	/^alto\s+padr[aã]o\b/i,
	/^nova\s+pronta\s+para\s+morar\b/i,
	/mobiliad/i,
	/decorad/i,
	/semimobiliad/i,
	/financi[aá]vel/i,
	/\d+\s*%\s*mobiliad/i,
	/\d+\s+su[ií]tes/i,
	/\d+\s+quartos/i,
	/\d+\s+metros/i,
	/^praia\s+de\s+/i,
];

function isWeakEmpreendimentoName(name) {
	const normalized = String(name || '').trim();

	if (!normalized || normalized.length < 3) {
		return true;
	}

	if (isGenericPropertyDescription(normalized)) {
		return true;
	}

	return WEAK_EMPREENDIMENTO_NAME_PATTERNS.some((pattern) => pattern.test(normalized));
}

function buildFallbackEmpreendimentoName(property, neighborhoodName, cityName) {
	const code = property.overview?.code?.trim();

	if (code && !/^\d+$/.test(code)) {
		return code;
	}

	return neighborhoodName || cityName || 'Imovel';
}

function extractCentroNeighborhood(title) {
	if (/\bno\s+centro\b/i.test(title)) {
		return 'Centro';
	}

	return null;
}

function extractNeighborhoodFromTitle(title, cityName, empreendimentoName) {
	const centro = extractCentroNeighborhood(title);

	if (centro) {
		return centro;
	}

	const segments = parseTitleSegments(title);
	const empreendimentoKey = normalizeForMatch(empreendimentoName);

	for (let index = segments.length - 1; index >= 0; index -= 1) {
		const segment = segments[index];

		if (isMarketingSegment(segment)) {
			continue;
		}

		if (normalizeForMatch(segment) === empreendimentoKey) {
			continue;
		}

		if (matchesLocation(segment, cityName, '')) {
			continue;
		}

		return segment;
	}

	return null;
}

function resolveNeighborhoodName(property, cityName, empreendimentoName) {
	let neighborhoodName = property.address?.neighborhood?.name || '';

	if (property.address?.city?.slug === 'florianopolis' && neighborhoodName) {
		return neighborhoodName.split(',')[0].trim();
	}

	if (neighborhoodName.includes(',')) {
		neighborhoodName = neighborhoodName.split(',')[0].trim();
	}

	const fromTitle = extractNeighborhoodFromTitle(property.title, cityName, empreendimentoName);

	if (fromTitle) {
		return fromTitle;
	}

	if (
		neighborhoodName &&
		normalizeForMatch(neighborhoodName) !== normalizeForMatch(cityName) &&
		!REGIONAL_CITY_NAMES.has(neighborhoodName)
	) {
		return neighborhoodName;
	}

	return cityName;
}

function extractEmpreendimentoName(property, cityName, neighborhoodName) {
	const segments = parseTitleSegments(property.title);
	const candidates = segments.filter(
		(segment) => !isMarketingSegment(segment) && !matchesLocation(segment, cityName, neighborhoodName),
	);

	let empreendimentoName = '';

	if (candidates.length) {
		const cleanedCandidates = candidates
			.map((segment) => stripEmpreendimentoPrefixes(segment))
			.filter((segment) => segment && !isGenericPropertyDescription(segment));

		const hinted = cleanedCandidates.find((segment) => EMPREENDIMENTO_HINT.test(segment));

		if (hinted) {
			empreendimentoName = hinted;
		} else if (cleanedCandidates.length === 1) {
			empreendimentoName = cleanedCandidates[0];
		} else if (cleanedCandidates.length > 1) {
			const withoutLeadingNumbers = cleanedCandidates.find((segment) => !/^\d+\s/.test(segment));
			empreendimentoName = withoutLeadingNumbers || cleanedCandidates[0];
		}
	}

	if (!empreendimentoName || isWeakEmpreendimentoName(empreendimentoName)) {
		for (const segment of segments) {
			const stripped = stripEmpreendimentoPrefixes(
				stripLocationFromText(segment, cityName, neighborhoodName),
			);

			if (
				stripped &&
				!isWeakEmpreendimentoName(stripped) &&
				!matchesLocation(stripped, cityName, neighborhoodName)
			) {
				empreendimentoName = stripped;
				break;
			}
		}
	}

	if (!empreendimentoName || isWeakEmpreendimentoName(empreendimentoName)) {
		empreendimentoName = stripEmpreendimentoPrefixes(
			stripLocationFromText(stripTitlePrefixes(property.title), cityName, neighborhoodName)
				.replace(/\s+no\s+centro(\s+de)?\s*$/i, '')
				.replace(/\s+em\s*$/i, ''),
		);
	}

	if (isWeakEmpreendimentoName(empreendimentoName)) {
		empreendimentoName = buildFallbackEmpreendimentoName(property, neighborhoodName, cityName);
	}

	return empreendimentoName;
}

function buildNameSlug(empreendimentoName, neighborhoodSlug, citySlug, stateSlug) {
	let nameSlug = slugifyText(empreendimentoName);
	nameSlug = stripTrailingSlugPart(nameSlug, neighborhoodSlug);
	nameSlug = stripTrailingSlugPart(nameSlug, citySlug);
	nameSlug = stripTrailingSlugPart(nameSlug, 'santa-catarina');
	nameSlug = stripTrailingSlugPart(nameSlug, stateSlug);
	nameSlug = nameSlug.replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');

	return removeSlugStopWords(nameSlug) || removeSlugStopWords(slugifyText(empreendimentoName));
}

function dedupeSlugParts(parts) {
	const result = [];

	for (const part of parts) {
		if (!part) {
			continue;
		}

		if (result.length && result[result.length - 1] === part) {
			continue;
		}

		result.push(part);
	}

	return result;
}

function removeRepeatedSlugSequence(slug) {
	const tokens = slug.split('-');

	for (let size = Math.floor(tokens.length / 2); size >= 2; size -= 1) {
		for (let index = 0; index <= tokens.length - size * 2; index += 1) {
			const first = tokens.slice(index, index + size).join('-');
			const second = tokens.slice(index + size, index + size * 2).join('-');

			if (first === second) {
				tokens.splice(index + size, size);
				return removeRepeatedSlugSequence(tokens.join('-'));
			}
		}
	}

	return tokens.join('-');
}

export function buildPropertySlug(property) {
	const cityName = resolveCityName(property);
	const empreendimentoName = extractEmpreendimentoName(property, cityName, '');
	const neighborhoodName = resolveNeighborhoodName(property, cityName, empreendimentoName);

	const citySlug = slugifyText(cityName);
	const neighborhoodSlug = slugifyText(neighborhoodName);
	const stateSlug = 'sc';
	const nameSlug = buildNameSlug(empreendimentoName, neighborhoodSlug, citySlug, stateSlug);

	const parts = dedupeSlugParts([nameSlug, neighborhoodSlug, citySlug, stateSlug].filter(Boolean));

	return removeRepeatedSlugSequence(parts.join('-').replace(/-{2,}/g, '-'));
}

export function ensureUniquePropertySlug(baseSlug, usedSlugs, propertyId) {
	let candidate = baseSlug;

	if (!usedSlugs.has(candidate)) {
		return candidate;
	}

	if (propertyId != null) {
		candidate = `${baseSlug}-${propertyId}`;
		if (!usedSlugs.has(candidate)) {
			return candidate;
		}
	}

	let suffix = 2;
	while (usedSlugs.has(`${baseSlug}-${suffix}`)) {
		suffix += 1;
	}

	return `${baseSlug}-${suffix}`;
}
