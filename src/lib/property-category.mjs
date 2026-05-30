export const PROPERTY_CATEGORIES = ['pre-lancamento', 'lancamento', 'pronto-para-morar'];

export const CATEGORY_LABELS = {
	'pre-lancamento': 'Pré-lançamento',
	lancamento: 'Em lançamento',
	'pronto-para-morar': 'Pronto para morar',
};

export function getCategoryFromPageSlug(pageSlug) {
	return PROPERTY_CATEGORIES.includes(pageSlug) ? pageSlug : null;
}

export function getCategoryLabel(category) {
	return CATEGORY_LABELS[category] || 'Lançamento';
}
