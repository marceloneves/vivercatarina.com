import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getBlogPostsForBairro, getBlogPostsForLancamentosPage } from './blog-internal-links.mjs';

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

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildNeighborhoodRules() {
	return [...NEIGHBORHOODS]
		.sort((a, b) => b.name.length - a.name.length)
		.map(({ name, slug }) => ({
			text: name,
			href: `/bairro/${slug}`,
			caseSensitive: true,
		}));
}

function buildLinkRegex(rule) {
	const escaped = escapeRegex(rule.text);

	if (rule.caseSensitive) {
		return new RegExp(`\\b(${escaped})\\b`);
	}

	return new RegExp(`\\b(${escaped})\\b`, 'i');
}

function buildArticleLinkRules(currentSlug) {
	const rules = [
		...BLOG_PHRASE_RULES.filter((rule) => rule.slug !== currentSlug),
		...LANCAMENTOS_PHRASE_RULES,
		...buildNeighborhoodRules(),
	];

	return rules.sort((a, b) => b.text.length - a.text.length);
}

function splitOutsideAnchors(html) {
	return html.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi).map((part) => ({
		linked: /^<a\b/i.test(part),
		content: part,
	}));
}

function applyRuleOutsideAnchors(html, rule) {
	const regex = buildLinkRegex(rule);

	return splitOutsideAnchors(html)
		.map(({ linked, content }) => {
			if (linked || !regex.test(content)) {
				return content;
			}

			return content.replace(regex, `<a href="${rule.href}">$1</a>`);
		})
		.join('');
}

function linkifyTextNode(text, rules) {
	if (!text.trim()) {
		return text;
	}

	let result = text;

	for (const rule of rules) {
		result = applyRuleOutsideAnchors(result, rule);
	}

	return result;
}

const HEADING_OPEN = /^<h[1-6]\b/i;
const HEADING_CLOSE = /^<\/h[1-6]>/i;
const SKIP_LINK_CLASSES = ['blog-inner-title', 'blog-subsection-title'];

function opensNoLinkZone(tag) {
	if (!tag.startsWith('<') || tag.startsWith('</')) {
		return false;
	}

	if (HEADING_OPEN.test(tag)) {
		return true;
	}

	return SKIP_LINK_CLASSES.some((className) =>
		new RegExp(`class="[^"]*\\b${className}\\b`, 'i').test(tag),
	);
}

function closesNoLinkZone(tag) {
	if (!tag.startsWith('</')) {
		return false;
	}

	if (HEADING_CLOSE.test(tag)) {
		return true;
	}

	const match = tag.match(/^<\/(\w+)/);
	if (!match) {
		return false;
	}

	return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(match[1].toLowerCase());
}

/** @param {string} html @param {string} [currentSlug] */
export function applyArticleInlineLinks(html, currentSlug = '') {
	const rules = buildArticleLinkRules(currentSlug);
	const parts = html.split(/(<[^>]+>)/);
	let skipLinkifyDepth = 0;

	return parts
		.map((part) => {
			if (part.startsWith('<')) {
				if (opensNoLinkZone(part)) {
					skipLinkifyDepth += 1;
				} else if (closesNoLinkZone(part) && skipLinkifyDepth > 0) {
					skipLinkifyDepth -= 1;
				}

				return part;
			}

			if (skipLinkifyDepth > 0) {
				return part;
			}

			return linkifyTextNode(part, rules);
		})
		.join('');
}

function formatPostLink(post, label) {
	return `<a href="${post.href}">${label ?? post.title}</a>`;
}

function joinPortugueseList(items) {
	if (items.length === 0) {
		return '';
	}

	if (items.length === 1) {
		return items[0];
	}

	if (items.length === 2) {
		return `${items[0]} e ${items[1]}`;
	}

	return `${items.slice(0, -1).join(', ')} e ${items.at(-1)}`;
}

/** @param {string} pageSlug */
export function buildLancamentosIntroHtml(pageSlug) {
	const posts = getBlogPostsForLancamentosPage(pageSlug);
	const articleLinks = posts.slice(0, 3).map((post) => formatPostLink(post));

	return `<div class="listing-context-links">
<p>Antes de fechar negócio, leia ${joinPortugueseList(articleLinks)}. Depois, compare os empreendimentos abaixo ou explore <a href="/bairros">imóveis por bairro</a> e <a href="/lancamentos/apartamentos">apartamentos em lançamento</a>.</p>
</div>`;
}

/** @param {string} neighborhoodSlug @param {string} neighborhoodName */
export function buildBairroIntroHtml(neighborhoodSlug, neighborhoodName) {
	const posts = getBlogPostsForBairro(neighborhoodSlug);
	const articleLinks = posts.slice(0, 3).map((post) => formatPostLink(post));

	return `<div class="listing-context-links">
<p>Interessado em ${neighborhoodName}? Confira ${joinPortugueseList(articleLinks)} e veja os <a href="/lancamentos">lançamentos em Florianópolis</a> disponíveis neste bairro.</p>
</div>`;
}

/** @param {string} html @param {string} introHtml */
export function injectListingIntroInHtml(html, introHtml) {
	if (!introHtml) {
		return html;
	}

	const marker = '<div class="tab-content" id="nav-tabContent">';
	const injection = `${marker}
            <div class="row listing-context-links-row">
                <div class="col-12">
                    ${introHtml}
                </div>
            </div>`;

	return html.includes(marker) ? html.replace(marker, injection) : html;
}
