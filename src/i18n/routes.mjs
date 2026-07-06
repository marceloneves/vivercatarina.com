import { SITE_URL } from '../lib/site-contact.mjs';

// Idiomas suportados. 'pt' é o default (site na raiz); 'es' vive em /es.
export const LOCALES = ['pt', 'es'];
export const DEFAULT_LOCALE = 'pt';

// Mapa canônico de rotas equivalentes PT <-> ES. `pt` é sempre a rota servida
// na raiz; `es` é a rota traduzida sob /es. Usado por switcher de idioma,
// hreflang e navegação localizada. Caminhos SEM barra final (exceto home).
export const ROUTE_PAIRS = [
	{ pt: '/', es: '/es/' },
	{ pt: '/quem-somos', es: '/es/quienes-somos' },
	{ pt: '/contato', es: '/es/contacto' },
	{ pt: '/seja-um-parceiro', es: '/es/sea-socio' },
	{ pt: '/enviar-mensagem-parceria', es: '/es/enviar-mensaje-alianza' },
	{ pt: '/privacidade', es: '/es/privacidad' },
	{ pt: '/termos', es: '/es/terminos' },
	{ pt: '/politica-de-cookies', es: '/es/politica-de-cookies' },
];

const PT_TO_ES = new Map(ROUTE_PAIRS.map(({ pt, es }) => [normalize(pt), es]));
const ES_TO_PT = new Map(ROUTE_PAIRS.map(({ pt, es }) => [normalize(es), pt]));

function normalize(path) {
	const raw = String(path || '/').split('?')[0].split('#')[0];

	if (!raw || raw === '/') {
		return '/';
	}

	return raw.replace(/\/+$/, '') || '/';
}

/** `pt-BR` ou `es` para o atributo <html lang>. */
export function htmlLang(lang) {
	return lang === 'es' ? 'es' : 'pt-BR';
}

/** `pt_BR` ou `es_ES` para og:locale. */
export function ogLocale(lang) {
	return lang === 'es' ? 'es_ES' : 'pt_BR';
}

/** `pt-BR` ou `es` para schema.org inLanguage. */
export function schemaLang(lang) {
	return lang === 'es' ? 'es' : 'pt-BR';
}

/**
 * Dado o caminho PT canônico, devolve o caminho equivalente no idioma pedido.
 * Ex.: localizedPath('es', '/contato') => '/es/contacto'.
 */
export function localizedPath(lang, ptPath) {
	if (lang !== 'es') {
		return normalize(ptPath) === '/' ? '/' : normalize(ptPath);
	}

	return PT_TO_ES.get(normalize(ptPath)) || null;
}

/** Caminho PT equivalente a uma rota ES (para o switcher no lado ES). */
export function ptPathFromEs(esPath) {
	return ES_TO_PT.get(normalize(esPath)) || null;
}

/** URL absoluta com barra final, igual à canônica servida pelo host. */
function absoluteUrl(path) {
	const n = normalize(path);
	return `${SITE_URL}${n === '/' ? '/' : `${n}/`}`;
}

/** Caminho relativo com barra final. Independe do host (funciona em
 * localhost, staging e produção) — usado pelo switcher de idioma. */
function relativeUrl(path) {
	const n = normalize(path);
	return n === '/' ? '/' : `${n}/`;
}

/**
 * Alternates hreflang para um par de rotas, a partir do caminho PT canônico.
 * Retorna pt-BR, es e x-default (aponta para PT). Devolve [] se a rota PT não
 * tiver equivalente mapeado (ex.: 404) — nesse caso não emitir hreflang.
 */
export function hreflangAlternates(ptPath) {
	const esPath = PT_TO_ES.get(normalize(ptPath));

	if (!esPath) {
		return [];
	}

	return [
		{ hreflang: 'pt-BR', href: absoluteUrl(ptPath) },
		{ hreflang: 'es', href: absoluteUrl(esPath) },
		{ hreflang: 'x-default', href: absoluteUrl(ptPath) },
	];
}

/**
 * Dados do switcher de idioma para uma página. `ptPath` é a rota PT canônica
 * da página atual. Retorna os dois idiomas com href absoluto e flag de atual.
 */
export function languageSwitcher(currentLang, ptPath) {
	const esPath = PT_TO_ES.get(normalize(ptPath));

	return [
		{ lang: 'pt', label: 'PT', href: relativeUrl(ptPath), current: currentLang === 'pt' },
		{
			lang: 'es',
			label: 'ES',
			href: esPath ? relativeUrl(esPath) : null,
			current: currentLang === 'es',
		},
	];
}
