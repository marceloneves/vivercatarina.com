import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { linkifyHtmlContent } from './content-inline-links.mjs';
import { buildGlossaryLinkRules } from './glossary-content-links.mjs';

const NEIGHBORHOODS = JSON.parse(
	readFileSync(join(process.cwd(), 'src/data/florianopolis-neighborhoods.json'), 'utf8'),
);

/** @typedef {{ text: string, href: string, slug?: string, caseSensitive?: boolean }} LinkRule */

/** @type {LinkRule[]} */
const BLOG_PHRASE_RULES = [
	{
		text: 'Checklist Definitivo',
		href: '/blog/checklist-avaliar-imovel-em-florianopolis',
		slug: 'checklist-avaliar-imovel-em-florianopolis',
	},
	{
		text: 'checklist com 15 itens',
		href: '/blog/checklist-avaliar-imovel-em-florianopolis',
		slug: 'checklist-avaliar-imovel-em-florianopolis',
	},
	{
		text: 'Quanto Custa Morar em Florianópolis',
		href: '/blog/quanto-custa-morar-em-florianopolis',
		slug: 'quanto-custa-morar-em-florianopolis',
	},
	{
		text: 'quanto custa morar em Florianópolis',
		href: '/blog/quanto-custa-morar-em-florianopolis',
		slug: 'quanto-custa-morar-em-florianopolis',
	},
	{
		text: 'Morar no Continente x na Ilha',
		href: '/blog/morar-no-continente-x-na-ilha-em-florianopolis',
		slug: 'morar-no-continente-x-na-ilha-em-florianopolis',
	},
	{
		text: 'continente e na ilha',
		href: '/blog/morar-no-continente-x-na-ilha-em-florianopolis',
		slug: 'morar-no-continente-x-na-ilha-em-florianopolis',
	},
	{
		text: 'Morar Perto da UFSC',
		href: '/blog/morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		slug: 'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
	},
	{
		text: 'região universitária',
		href: '/blog/morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		slug: 'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
	},
	{
		text: 'UFSC',
		href: '/blog/morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		slug: 'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
	},
	{
		text: 'Campeche em Expansão',
		href: '/blog/campeche-em-expansao-valorizacao',
		slug: 'campeche-em-expansao-valorizacao',
	},
	{
		text: 'valorização do Campeche',
		href: '/blog/campeche-em-expansao-valorizacao',
		slug: 'campeche-em-expansao-valorizacao',
	},
	{
		text: 'Os 10 Melhores Bairros',
		href: '/blog/melhores-bairros-para-morar-em-florianopolis',
		slug: 'melhores-bairros-para-morar-em-florianopolis',
	},
	{
		text: 'melhores bairros para morar',
		href: '/blog/melhores-bairros-para-morar-em-florianopolis',
		slug: 'melhores-bairros-para-morar-em-florianopolis',
	},
];

/** @type {LinkRule[]} */
const LANCAMENTOS_PHRASE_RULES = [
	{ text: 'apartamentos em lançamento', href: '/lancamentos/apartamentos' },
	{ text: 'prontos para morar', href: '/lancamentos/pronto-para-morar' },
	{ text: 'pronto para morar', href: '/lancamentos/pronto-para-morar' },
	{ text: 'imóveis por bairro', href: '/bairros' },
	{ text: 'lançamentos em Florianópolis', href: '/lancamentos' },
	{ text: 'lançamentos imobiliários', href: '/lancamentos' },
	{ text: 'imóveis na planta', href: '/lancamentos' },
];

function buildNeighborhoodRules() {
	return [...NEIGHBORHOODS]
		.sort((a, b) => b.name.length - a.name.length)
		.map(({ name, slug }) => ({
			text: name,
			href: `/bairro/${slug}`,
			caseSensitive: true,
		}));
}

function buildArticleLinkRules(currentSlug) {
	const rules = [
		...BLOG_PHRASE_RULES.filter((rule) => rule.slug !== currentSlug),
		...LANCAMENTOS_PHRASE_RULES,
		...buildNeighborhoodRules(),
		...buildGlossaryLinkRules(),
	];

	return rules.sort((a, b) => b.text.length - a.text.length);
}

/** @param {string} html @param {string} [currentSlug] */
export function applyArticleInlineLinks(html, currentSlug = '') {
	const rules = buildArticleLinkRules(currentSlug);

	return linkifyHtmlContent(html, rules, { skipHeadings: true });
}
