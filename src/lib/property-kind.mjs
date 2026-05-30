export const PROPERTY_KINDS = ['apartamento', 'casa', 'loteamento'];

export const KIND_LABELS = {
	apartamento: 'Apartamentos',
	casa: 'Casas em condomínio',
	loteamento: 'Loteamento',
};

export const KIND_PAGE_SLUGS = {
	apartamento: 'apartamentos',
	casa: 'casas-em-condominio',
	loteamento: 'loteamento',
};

const PAGE_SLUG_TO_KIND = Object.fromEntries(
	Object.entries(KIND_PAGE_SLUGS).map(([kind, slug]) => [slug, kind]),
);

export function getKindPageSlug(kind) {
	return KIND_PAGE_SLUGS[kind] || kind;
}

export function getKindFromPageSlug(pageSlug) {
	return PAGE_SLUG_TO_KIND[pageSlug] || null;
}

function buildSearchText(property) {
	const description = property.descriptionHtml?.replace(/<[^>]+>/g, ' ') || '';

	return [property.slug, property.title, description].join(' ').toLowerCase();
}

export function inferPropertyKind(property) {
	const text = buildSearchText(property);
	const typeSlugs = (property.types || []).map(({ slug }) => slug);
	const typeNames = (property.types || []).map(({ name }) => name.toLowerCase());

	if (
		/loteamento|terreno|\blote\b|lotes com|lote\s+com/.test(text) ||
		typeNames.includes('loteamentos') ||
		typeSlugs.includes('house')
	) {
		return 'loteamento';
	}

	if (
		/\bcasa\b|sobrado|casas em|condominio fechado|condomínio fechado|residencial.*casa|townhouse|geminad/.test(
			text,
		)
	) {
		return 'casa';
	}

	if (
		/apartamento|studio|edificio|edifício|torre|tower|residence|residencial|loft|flat|duplex|garden|penthouse/.test(
			text,
		) ||
		typeSlugs.includes('apartment')
	) {
		return 'apartamento';
	}

	return 'apartamento';
}

export function resolvePropertyKind(property) {
	if (PROPERTY_KINDS.includes(property.kind)) {
		return property.kind;
	}

	return inferPropertyKind(property);
}

export function getKindLabel(kind) {
	return KIND_LABELS[kind] || kind;
}

const LAUNCH_CATEGORIES = new Set(['pre-lancamento', 'lancamento']);

const CONDOMINIUM_PATTERN =
	/condom[ií]nio|condominio fechado|\breserva\b|\bresidence\b|\bresidencial\b|\bempreendimento\b/i;

const STANDALONE_HOUSE_TITLE_PATTERN =
	/\b(casa nova|casa pronta|casa financi[aá]vel|^casa a |^sobrado em|^sobrados de alto)\b/i;

function isTrueLoteamento(property, kind) {
	const title = property.title || '';

	return kind === 'loteamento' && /\bloteamento\b/i.test(title);
}

export function isStandaloneHouseProperty(property) {
	const kind = resolvePropertyKind(property);

	if (kind === 'apartamento' || isTrueLoteamento(property, kind)) {
		return false;
	}

	const title = property.title || '';
	const isHouseLike =
		kind === 'casa' ||
		STANDALONE_HOUSE_TITLE_PATTERN.test(title) ||
		(/^\s*casa\b/i.test(title) && kind === 'loteamento');

	if (!isHouseLike) {
		return false;
	}

	if (LAUNCH_CATEGORIES.has(property.category)) {
		return false;
	}

	const text = [title, property.descriptionHtml?.replace(/<[^>]+>/g, ' ') || ''].join(' ');
	return !CONDOMINIUM_PATTERN.test(text);
}
