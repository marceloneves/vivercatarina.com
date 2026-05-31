import { linkifyHtmlContent } from './content-inline-links.mjs';
import { GLOSSARY_TERMS } from './glossary-terms.mjs';

export const GLOSSARY_LINK_CLASS = 'glossary-term-link';

const GLOSSARY_PHRASE_ALIASES = [
	{ text: 'imóveis na planta', slug: 'apartamento-na-planta' },
	{ text: 'apartamentos na planta', slug: 'apartamento-na-planta' },
	{ text: 'compra na planta', slug: 'apartamento-na-planta' },
	{ text: 'lançamentos imobiliários', slug: 'lancamento-imobiliario' },
	{ text: 'pré-lançamentos', slug: 'pre-lancamento' },
	{ text: 'corretores credenciados', slug: 'corretor-credenciado' },
	{ text: 'incorporadoras', slug: 'incorporadora' },
	{ text: 'financiamento bancário', slug: 'financiamento-imobiliario' },
	{ text: 'entrega das chaves', slug: 'entrega-das-chaves' },
	{ text: 'valorização imobiliária', slug: 'valorizacao-imobiliaria' },
	{ text: 'patrimônio de afetação', slug: 'patrimonio-de-afetacao' },
	{ text: 'unidades autônomas', slug: 'unidade-autonoma' },
	{ text: 'áreas comuns', slug: 'area-comum' },
	{ text: 'áreas privativas', slug: 'area-privativa' },
	{ text: 'vagas de garagem', slug: 'vaga-de-garagem' },
	{ text: 'plantas baixas', slug: 'planta-baixa' },
	{ text: 'memorial de incorporação', slug: 'memorial-de-incorporacao' },
	{ text: 'contrato de promessa', slug: 'contrato-de-promessa-de-compra-e-venda' },
];

function extractAcronym(term) {
	const match = term.match(/\(([A-Z0-9]{2,8})\)/);
	return match?.[1] ?? null;
}

function extractTermBeforeParenthesis(term) {
	const match = term.match(/^([^(]+)\s*\(/);
	return match?.[1]?.trim() ?? null;
}

/** @param {string[]} [excludeSlugs] */
export function buildGlossaryLinkRules(excludeSlugs = []) {
	const excluded = new Set(excludeSlugs);
	const rules = [];

	for (const { term, slug } of GLOSSARY_TERMS) {
		if (excluded.has(slug)) {
			continue;
		}

		rules.push({
			text: term,
			href: `/glossario#${slug}`,
			linkClass: GLOSSARY_LINK_CLASS,
		});

		const acronym = extractAcronym(term);
		if (acronym) {
			rules.push({
				text: acronym,
				href: `/glossario#${slug}`,
				caseSensitive: true,
				linkClass: GLOSSARY_LINK_CLASS,
			});
		}

		const shortLabel = extractTermBeforeParenthesis(term);
		if (shortLabel && shortLabel !== term) {
			rules.push({
				text: shortLabel,
				href: `/glossario#${slug}`,
				linkClass: GLOSSARY_LINK_CLASS,
			});
		}
	}

	for (const { text, slug } of GLOSSARY_PHRASE_ALIASES) {
		if (excluded.has(slug)) {
			continue;
		}

		rules.push({
			text,
			href: `/glossario#${slug}`,
			linkClass: GLOSSARY_LINK_CLASS,
		});
	}

	return rules.sort((a, b) => b.text.length - a.text.length);
}

/** @param {string} html @param {{ excludeSlugs?: string[], skipHeadings?: boolean }} [options] */
export function applyGlossaryInlineLinks(html, options = {}) {
	if (!html) {
		return html;
	}

	const { excludeSlugs = [], skipHeadings = true } = options;
	const rules = buildGlossaryLinkRules(excludeSlugs);

	return linkifyHtmlContent(html, rules, { skipHeadings });
}

export const GLOSSARY_EXTERNAL_LINK_CLASS = 'glossary-external-link';

/** @param {string} definition @param {string} [websiteUrl] */
export function linkIncorporadoraWebsite(definition, websiteUrl) {
	if (!definition || !websiteUrl || /<a\b/i.test(definition)) {
		return definition;
	}

	return definition.replace(
		/\b(incorporadora|incorporador)\b/i,
		(match) =>
			`<a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="${GLOSSARY_EXTERNAL_LINK_CLASS}">${match}</a>`,
	);
}

const MAIN_ID = 'conteudo-principal';

/** @param {string} html */
export function applyGlossaryInlineLinksInMain(html) {
	if (!html) {
		return html;
	}

	const mainOpen = `<main id="${MAIN_ID}">`;
	const mainStart = html.indexOf(mainOpen);

	if (mainStart === -1) {
		const headerEnd = html.indexOf('</header>');
		const footerStart = html.indexOf('<footer');

		if (headerEnd === -1 || footerStart === -1 || footerStart <= headerEnd) {
			return html;
		}

		const before = html.slice(0, headerEnd + '</header>'.length);
		const mainContent = html.slice(headerEnd + '</header>'.length, footerStart);
		const after = html.slice(footerStart);

		return `${before}${applyGlossaryInlineLinks(mainContent)}${after}`;
	}

	const contentStart = mainStart + mainOpen.length;
	const mainEnd = html.indexOf('</main>', contentStart);

	if (mainEnd === -1) {
		return html;
	}

	const mainContent = applyGlossaryInlineLinks(html.slice(contentStart, mainEnd));

	return `${html.slice(0, contentStart)}${mainContent}${html.slice(mainEnd)}`;
}
