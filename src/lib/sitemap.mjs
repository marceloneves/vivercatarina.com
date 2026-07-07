import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_URL } from './site-contact.mjs';
import { hreflangAlternates, localizedPath } from '../i18n/routes.mjs';

const NOINDEX_ROUTE_PREFIXES = [];
const NOINDEX_ROUTE_EXACT = [];

/** @typedef {{ hreflang: string, href: string }} HreflangAlternate */
/** @typedef {{ loc: string, lastmod?: string, changefreq?: string, priority?: string, alternates?: HreflangAlternate[] }} SitemapEntry */

/**
 * @param {string} path
 * @param {Omit<SitemapEntry, 'loc'>} [options]
 * @returns {SitemapEntry}
 */
export function buildSitemapEntry(path, options = {}) {
	const raw = path.startsWith('/') ? path : `/${path}`;
	// Barra final para bater com a URL servida pelo host (evita loc que dá 301).
	const normalizedPath = raw === '/' ? '/' : `${raw.replace(/\/+$/, '')}/`;

	return {
		loc: `${SITE_URL}${normalizedPath}`,
		...options,
	};
}

/** Páginas do hub (agregador de cidades). @returns {SitemapEntry[]} */
export function getPagesSitemapEntries() {
	// lastmod único da geração (build); priority/changefreq omitidos (ignorados
	// pelo Google).
	const lastmod = new Date().toISOString().slice(0, 10);

	// Rotas PT canônicas indexáveis. Cada uma gera a entrada PT + a ES
	// equivalente, ambas com os mesmos alternates hreflang (pt-BR / es /
	// x-default). Exclui os alvos de formulário (enviar-mensagem-*, noindex).
	const ptCanonicalPaths = [
		'/',
		'/quem-somos',
		'/contato',
		'/seja-um-parceiro',
		'/privacidade',
		'/termos',
		'/politica-de-cookies',
	];

	const entries = [];

	for (const ptPath of ptCanonicalPaths) {
		const alternates = hreflangAlternates(ptPath);
		entries.push(buildSitemapEntry(ptPath, { lastmod, alternates }));

		const esPath = localizedPath('es', ptPath);
		if (esPath) {
			entries.push(buildSitemapEntry(esPath, { lastmod, alternates }));
		}
	}

	return entries;
}

export const SITEMAP_FILES = [
	{ path: '/sitemap-pages.xml', getEntries: getPagesSitemapEntries },
];

/**
 * @param {SitemapEntry[]} entries
 */
export function renderSitemapXml(entries) {
	const urls = entries
		.map(({ loc, lastmod, changefreq, priority, alternates }) => {
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

			if (Array.isArray(alternates)) {
				for (const { hreflang, href } of alternates) {
					parts.push(
						`    <xhtml:link rel="alternate" hreflang="${escapeXml(hreflang)}" href="${escapeXml(href)}" />`,
					);
				}
			}

			return `  <url>\n${parts.join('\n')}\n  </url>`;
		})
		.join('\n');

	return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
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

function loadFooterCities() {
	try {
		const regions = JSON.parse(
			readFileSync(join(process.cwd(), 'src/data/footer-cities-by-region.json'), 'utf8'),
		);

		return regions.flatMap(({ cities }) => cities || []);
	} catch {
		return [];
	}
}

export function buildLlmsTxt() {
	const cities = loadFooterCities()
		.map(({ name, subdomain }) => `- [${name}](https://${subdomain}.vivercatarina.com): lançamentos e imóveis na planta em ${name}`)
		.join('\n');

	return `# Viver Catarina

> Portal agregador de lançamentos imobiliários e imóveis na planta em Santa Catarina, com um site dedicado por cidade.

O Viver Catarina reúne lançamentos e imóveis na planta nas principais cidades de Santa Catarina. Cada cidade tem seu próprio portal com empreendimentos, bairros, preços e contato via WhatsApp.

Contato: contato@vivercatarina.com | WhatsApp (48) 98810-5199

## Páginas principais

- [Início](${SITE_URL}/): hub com as cidades de Santa Catarina
- [Quem Somos](${SITE_URL}/quem-somos): missão, diferenciais e contato
- [Contato](${SITE_URL}/contato): formulário e informações de contato

## Cidades

${cities}

## Español (versión en /es)

- [Inicio](${SITE_URL}/es/): hub con las ciudades de Santa Catarina
- [Quiénes Somos](${SITE_URL}/es/quienes-somos): misión, diferenciales y contacto
- [Contacto](${SITE_URL}/es/contacto): formulario e información de contacto

## Optional

- [Política de Privacidade](${SITE_URL}/privacidade)
- [Termos de Uso](${SITE_URL}/termos)
- [Política de Cookies](${SITE_URL}/politica-de-cookies)
- [Sitemap](${SITE_URL}/sitemap-index.xml): índice de URLs públicas do site
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
