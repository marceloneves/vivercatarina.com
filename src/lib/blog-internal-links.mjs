import { getBlogPost, getBlogPosts } from './blog-posts.mjs';
import { injectBlogLinksSidebarWidget } from './template-html.mjs';

/** @typedef {{ href: string, label: string }} InternalLink */

/** @type {Record<string, { relatedPosts: string[], lancamentos: InternalLink[] }>} */
const BLOG_ARTICLE_LINKS = {
	'checklist-avaliar-imovel-em-florianopolis': {
		relatedPosts: [
			'quanto-custa-morar-em-florianopolis',
			'morar-no-continente-x-na-ilha-em-florianopolis',
			'melhores-bairros-para-morar-em-florianopolis',
		],
		lancamentos: [
			{ href: '/lancamentos', label: 'Lançamentos em Florianópolis' },
			{ href: '/bairros', label: 'Imóveis por bairro' },
			{ href: '/lancamentos/pronto-para-morar', label: 'Prontos para morar' },
		],
	},
	'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande': {
		relatedPosts: [
			'quanto-custa-morar-em-florianopolis',
			'melhores-bairros-para-morar-em-florianopolis',
			'morar-no-continente-x-na-ilha-em-florianopolis',
		],
		lancamentos: [
			{ href: '/lancamentos/apartamentos', label: 'Apartamentos em lançamento' },
			{ href: '/bairro/trindade', label: 'Imóveis na Trindade' },
			{ href: '/bairro/carvoeira', label: 'Imóveis na Carvoeira' },
			{ href: '/bairro/corregogrande', label: 'Imóveis no Córrego Grande' },
		],
	},
	'campeche-em-expansao-valorizacao': {
		relatedPosts: [
			'melhores-bairros-para-morar-em-florianopolis',
			'quanto-custa-morar-em-florianopolis',
			'morar-no-continente-x-na-ilha-em-florianopolis',
		],
		lancamentos: [
			{ href: '/lancamentos', label: 'Lançamentos em Florianópolis' },
			{ href: '/bairro/campeche', label: 'Imóveis no Campeche' },
			{ href: '/lancamentos/apartamentos', label: 'Apartamentos em lançamento' },
		],
	},
	'morar-no-continente-x-na-ilha-em-florianopolis': {
		relatedPosts: [
			'quanto-custa-morar-em-florianopolis',
			'melhores-bairros-para-morar-em-florianopolis',
			'campeche-em-expansao-valorizacao',
		],
		lancamentos: [
			{ href: '/lancamentos', label: 'Lançamentos em Florianópolis' },
			{ href: '/bairros', label: 'Imóveis por bairro' },
			{ href: '/lancamentos/apartamentos', label: 'Apartamentos em lançamento' },
		],
	},
	'quanto-custa-morar-em-florianopolis': {
		relatedPosts: [
			'checklist-avaliar-imovel-em-florianopolis',
			'melhores-bairros-para-morar-em-florianopolis',
			'morar-no-continente-x-na-ilha-em-florianopolis',
		],
		lancamentos: [
			{ href: '/lancamentos', label: 'Lançamentos em Florianópolis' },
			{ href: '/bairros', label: 'Imóveis por bairro' },
			{ href: '/lancamentos/pronto-para-morar', label: 'Prontos para morar' },
		],
	},
	'melhores-bairros-para-morar-em-florianopolis': {
		relatedPosts: [
			'quanto-custa-morar-em-florianopolis',
			'campeche-em-expansao-valorizacao',
			'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		],
		lancamentos: [
			{ href: '/lancamentos', label: 'Lançamentos em Florianópolis' },
			{ href: '/bairros', label: 'Imóveis por bairro' },
			{ href: '/lancamentos/lancamento', label: 'Em lançamento' },
		],
	},
};

/** @type {Record<string, string[]>} */
const LANCAMENTOS_BLOG_POSTS = {
	'': [
		'checklist-avaliar-imovel-em-florianopolis',
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
	],
	apartamentos: [
		'campeche-em-expansao-valorizacao',
		'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		'melhores-bairros-para-morar-em-florianopolis',
	],
	'casas-em-condominio': [
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
		'morar-no-continente-x-na-ilha-em-florianopolis',
	],
	loteamento: [
		'campeche-em-expansao-valorizacao',
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
	],
	terrenos: [
		'campeche-em-expansao-valorizacao',
		'melhores-bairros-para-morar-em-florianopolis',
		'morar-no-continente-x-na-ilha-em-florianopolis',
	],
	'pre-lancamento': [
		'campeche-em-expansao-valorizacao',
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
	],
	lancamento: [
		'campeche-em-expansao-valorizacao',
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
	],
	'pronto-para-morar': [
		'checklist-avaliar-imovel-em-florianopolis',
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
	],
};

/** @type {Record<string, string[]>} */
const BAIRRO_BLOG_POSTS = {
	campeche: [
		'campeche-em-expansao-valorizacao',
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
	],
	trindade: [
		'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		'quanto-custa-morar-em-florianopolis',
		'melhores-bairros-para-morar-em-florianopolis',
	],
	carvoeira: [
		'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		'quanto-custa-morar-em-florianopolis',
		'melhores-bairros-para-morar-em-florianopolis',
	],
	'corrego-grande': [
		'morar-perto-da-ufsc-trindade-carvoeira-corrego-grande',
		'melhores-bairros-para-morar-em-florianopolis',
		'quanto-custa-morar-em-florianopolis',
	],
};

const DEFAULT_BAIRRO_POSTS = [
	'checklist-avaliar-imovel-em-florianopolis',
	'melhores-bairros-para-morar-em-florianopolis',
	'quanto-custa-morar-em-florianopolis',
];

const DEFAULT_LANCAMENTOS_POSTS = LANCAMENTOS_BLOG_POSTS[''];

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function resolvePosts(slugs) {
	return slugs.map((slug) => getBlogPost(slug)).filter(Boolean);
}

function getFallbackRelatedPosts(currentSlug, limit = 3) {
	return getBlogPosts()
		.filter((post) => post.slug !== currentSlug)
		.slice(0, limit);
}

/**
 * @param {string} slug
 * @param {number} [limit]
 */
export function getRelatedBlogPosts(slug, limit = 3) {
	const configured = BLOG_ARTICLE_LINKS[slug]?.relatedPosts ?? [];
	const posts = resolvePosts(configured);

	if (posts.length >= limit) {
		return posts.slice(0, limit);
	}

	const fallback = getFallbackRelatedPosts(slug, limit).filter(
		(post) => !posts.some((item) => item.slug === post.slug),
	);

	return [...posts, ...fallback].slice(0, limit);
}

/** @param {string} slug */
export function getBlogPostLancamentosLinks(slug) {
	return BLOG_ARTICLE_LINKS[slug]?.lancamentos ?? [
		{ href: '/lancamentos', label: 'Lançamentos em Florianópolis' },
		{ href: '/bairros', label: 'Imóveis por bairro' },
	];
}

/** @param {string} pageSlug */
export function getBlogPostsForLancamentosPage(pageSlug) {
	const slugs = LANCAMENTOS_BLOG_POSTS[pageSlug] ?? DEFAULT_LANCAMENTOS_POSTS;
	return resolvePosts(slugs);
}

/** @param {string} neighborhoodSlug */
export function getBlogPostsForBairro(neighborhoodSlug) {
	const slugs = BAIRRO_BLOG_POSTS[neighborhoodSlug] ?? DEFAULT_BAIRRO_POSTS;
	return resolvePosts(slugs);
}

/**
 * @param {import('./blog-posts.mjs').BLOG_POSTS[number][]} posts
 */
export function renderBlogLinksSidebarWidget(posts) {
	if (!posts.length) {
		return '';
	}

	const items = posts
		.map(
			(post) =>
				`<li><a href="${escapeHtml(post.href)}">${escapeHtml(post.title)}</a></li>`,
		)
		.join('\n                                                ');

	return `<div class="widget widget_nav_menu blog-links-widget">
                                    <h3 class="widget_title">Guia para morar e investir</h3>
                                    <div class="menu-all-pages-container">
                                        <ul class="menu">
                                                ${items}
                                        </ul>
                                    </div>
                                    <p class="blog-links-widget__cta"><a href="/lancamentos">Ver lançamentos em Florianópolis</a></p>
                                </div>`;
}

/** @param {string} pageSlug */
export function buildLancamentosBlogSidebarWidget(pageSlug) {
	return renderBlogLinksSidebarWidget(getBlogPostsForLancamentosPage(pageSlug));
}

/** @param {string} neighborhoodSlug */
export function buildBairroBlogSidebarWidget(neighborhoodSlug) {
	return renderBlogLinksSidebarWidget(getBlogPostsForBairro(neighborhoodSlug));
}

/** @param {string} html @param {string} [pageSlug] */
export function injectLancamentosBlogLinks(html, pageSlug = '') {
	return injectBlogLinksSidebarWidget(html, buildLancamentosBlogSidebarWidget(pageSlug));
}
