import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getBlogPosts } from './blog-posts.mjs';
import {
	getLancamentosListingTotal,
	PROPERTY_CATEGORIES,
	PROPERTY_KINDS,
} from './lancamentos-page.mjs';
import { listPropertySlugs } from './property-data.mjs';
import { getKindPageSlug } from './property-kind.mjs';
import {
	listActiveNeighborhoods,
	LISTINGS_PER_PAGE,
	loadNeighborhoodListing,
} from './property-listings.mjs';
import { SITE_URL } from './site-contact.mjs';

const NEIGHBORHOOD_SLUGS = JSON.parse(
	readFileSync(join(process.cwd(), 'src/data/florianopolis-neighborhoods.json'), 'utf8'),
).map(({ slug }) => slug);

const BAIRROS_PRICE_FILTERS = [
	'ate-300-mil',
	'300-a-500-mil',
	'500-mil-a-1-milhao',
	'acima-de-1-milhao',
];

const BAIRROS_MAIN_PAGINATION = 1;
const LANCAMENTOS_MAIN_PAGINATION = 3;
const BAIRROS_FILTER_PAGINATION = 3;
const LANCAMENTOS_TERRENOS_PAGINATION = 3;

const NOINDEX_ROUTE_PREFIXES = ['/property'];

const NOINDEX_ROUTE_EXACT = ['/blog-details'];

/** @typedef {{ loc: string, lastmod?: string, changefreq?: string, priority?: string }} SitemapEntry */

/**
 * @param {string} path
 * @param {Omit<SitemapEntry, 'loc'>} [options]
 * @returns {SitemapEntry}
 */
export function buildSitemapEntry(path, options = {}) {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;

	return {
		loc: `${SITE_URL}${normalizedPath}`,
		...options,
	};
}

/** @returns {SitemapEntry[]} */
export function getPagesSitemapEntries() {
	const entries = [
		buildSitemapEntry('/', { changefreq: 'daily', priority: '1.0' }),
		buildSitemapEntry('/about', { changefreq: 'monthly', priority: '0.7' }),
		buildSitemapEntry('/contact', { changefreq: 'monthly', priority: '0.6' }),
		buildSitemapEntry('/blog', { changefreq: 'weekly', priority: '0.8' }),
		buildSitemapEntry('/lancamentos', { changefreq: 'daily', priority: '0.9' }),
		buildSitemapEntry('/bairros', { changefreq: 'weekly', priority: '0.9' }),
	];

	for (let page = 2; page <= LANCAMENTOS_MAIN_PAGINATION; page += 1) {
		entries.push(
			buildSitemapEntry(`/lancamentos/pagina-${page}`, { changefreq: 'daily', priority: '0.7' }),
		);
	}

	for (let page = 2; page <= BAIRROS_MAIN_PAGINATION; page += 1) {
		entries.push(
			buildSitemapEntry(`/bairros/pagina-${page}`, { changefreq: 'weekly', priority: '0.7' }),
		);
	}

	for (const filter of BAIRROS_PRICE_FILTERS) {
		entries.push(
			buildSitemapEntry(`/bairros/${filter}`, { changefreq: 'weekly', priority: '0.7' }),
		);

		for (let page = 2; page <= BAIRROS_FILTER_PAGINATION; page += 1) {
			entries.push(
				buildSitemapEntry(`/bairros/${filter}/pagina-${page}`, {
					changefreq: 'weekly',
					priority: '0.5',
				}),
			);
		}
	}

	entries.push(buildSitemapEntry('/lancamentos/terrenos', { changefreq: 'weekly', priority: '0.6' }));

	for (let page = 2; page <= LANCAMENTOS_TERRENOS_PAGINATION; page += 1) {
		entries.push(
			buildSitemapEntry(`/lancamentos/terrenos/pagina-${page}`, {
				changefreq: 'weekly',
				priority: '0.5',
			}),
		);
	}

	entries.push(...buildLancamentosListingEntries());
	entries.push(...buildBairroListingEntries());

	return entries;
}

/** @returns {SitemapEntry[]} */
function buildLancamentosListingEntries() {
	/** @type {SitemapEntry[]} */
	const entries = [];
	const pageSlugs = [
		...PROPERTY_KINDS.map((kind) => getKindPageSlug(kind)),
		...PROPERTY_CATEGORIES,
	];

	for (const pageSlug of pageSlugs) {
		const totalPages = Math.max(
			1,
			Math.ceil(getLancamentosListingTotal(pageSlug) / LISTINGS_PER_PAGE),
		);

		entries.push(
			buildSitemapEntry(`/lancamentos/${pageSlug}`, { changefreq: 'daily', priority: '0.8' }),
		);

		for (let page = 2; page <= totalPages; page += 1) {
			entries.push(
				buildSitemapEntry(`/lancamentos/${pageSlug}/pagina-${page}`, {
					changefreq: 'daily',
					priority: '0.6',
				}),
			);
		}
	}

	return entries;
}

/** @returns {SitemapEntry[]} */
function buildBairroListingEntries() {
	/** @type {SitemapEntry[]} */
	const entries = [];

	for (const slug of NEIGHBORHOOD_SLUGS) {
		const listing = loadNeighborhoodListing(slug);
		const totalItems = listing?.properties.length || 0;
		const totalPages = Math.max(1, Math.ceil(totalItems / LISTINGS_PER_PAGE));

		entries.push(
			buildSitemapEntry(`/bairro/${slug}`, { changefreq: 'weekly', priority: '0.8' }),
		);

		for (let page = 2; page <= totalPages; page += 1) {
			entries.push(
				buildSitemapEntry(`/bairro/${slug}/pagina-${page}`, {
					changefreq: 'weekly',
					priority: '0.6',
				}),
			);
		}
	}

	return entries;
}

/** @returns {SitemapEntry[]} */
export function getImoveisSitemapEntries() {
	return listPropertySlugs().map((slug) =>
		buildSitemapEntry(`/imovel/${slug}`, { changefreq: 'weekly', priority: '0.8' }),
	);
}

/** @returns {SitemapEntry[]} */
export function getBlogSitemapEntries() {
	return getBlogPosts().map((post) =>
		buildSitemapEntry(post.href, {
			changefreq: 'monthly',
			priority: '0.7',
			lastmod: post.datePublished,
		}),
	);
}

export const SITEMAP_FILES = [
	{ path: '/sitemap-pages.xml', getEntries: getPagesSitemapEntries },
	{ path: '/sitemap-imoveis.xml', getEntries: getImoveisSitemapEntries },
	{ path: '/sitemap-blog.xml', getEntries: getBlogSitemapEntries },
];

/**
 * @param {SitemapEntry[]} entries
 */
export function renderSitemapXml(entries) {
	const urls = entries
		.map(({ loc, lastmod, changefreq, priority }) => {
			const parts = [`    <loc>${escapeXml(loc)}</loc>`];

			if (lastmod) {
				parts.push(`    <lastmod>${escapeXml(lastmod)}</lastmod>`);
			}

			if (changefreq) {
				parts.push(`    <changefreq>${escapeXml(changefreq)}</changefreq>`);
			}

			if (priority) {
				parts.push(`    <priority>${escapeXml(priority)}</priority>`);
			}

			return `  <url>\n${parts.join('\n')}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function renderSitemapIndexXml() {
	const items = SITEMAP_FILES.map(
		({ path }) => `  <sitemap>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>\n  </sitemap>`,
	).join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

export function buildRobotsTxt() {
	const lines = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /api/',
		...NOINDEX_ROUTE_EXACT.map((path) => `Disallow: ${path}`),
		...NOINDEX_ROUTE_PREFIXES.map((path) => `Disallow: ${path}`),
		'',
		`Sitemap: ${SITE_URL}/sitemap-index.xml`,
	];

	return `${lines.join('\n')}\n`;
}

export function buildLlmsTxt() {
	const neighborhoods = listActiveNeighborhoods()
		.slice(0, 12)
		.map(({ name, slug }) => `- [${name}](${SITE_URL}/bairro/${slug}): imóveis na planta no bairro`)
		.join('\n');

	const blogLinks = getBlogPosts()
		.map((post) => `- [${post.title}](${SITE_URL}${post.href})`)
		.join('\n');

	return `# Viver Catarina

> Portal especializado em lançamentos imobiliários e imóveis na planta em Florianópolis, Santa Catarina.

O Viver Catarina conecta compradores a apartamentos, casas em condomínio e loteamentos em Florianópolis. Cada empreendimento tem ficha técnica, plantas, preços e contato via WhatsApp.

Contato: contato@vivercatarina.com | WhatsApp (48) 98810-5199

## Páginas principais

- [Início](${SITE_URL}/): home com lançamentos em destaque e bairros
- [Lançamentos](${SITE_URL}/lancamentos): listagem de imóveis novos em Florianópolis
- [Bairros](${SITE_URL}/bairros): imóveis por bairro e faixa de preço
- [Quem Somos](${SITE_URL}/about): missão, diferenciais e contato
- [Blog](${SITE_URL}/blog): termos e guia de lançamentos em Santa Catarina

## Lançamentos por tipo

- [Apartamentos](${SITE_URL}/lancamentos/apartamentos)
- [Casas em condomínio](${SITE_URL}/lancamentos/casas-em-condominio)
- [Loteamento](${SITE_URL}/lancamentos/loteamento)
- [Pré-lançamento](${SITE_URL}/lancamentos/pre-lancamento)
- [Em lançamento](${SITE_URL}/lancamentos/lancamento)
- [Pronto para morar](${SITE_URL}/lancamentos/pronto-para-morar)

## Bairros em destaque

${neighborhoods}

## Blog

${blogLinks}

## Optional

- [Contato](${SITE_URL}/contact): formulário e informações de contato
- [Sitemap](${SITE_URL}/sitemap-index.xml): índice de URLs públicas do site
- [Robots](${SITE_URL}/robots.txt): regras de rastreamento para buscadores
`;
}

function escapeXml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}
