import { patchHeaderSocial } from './site-social.mjs';

const BAIRROS_SUBMENU_PATTERN =
	/<li class="menu-item-has-children(?: active)?">\s*<a href="\/bairros">Bairros<\/a>\s*<ul class="sub-menu">[\s\S]*?<\/ul>\s*<\/li>/g;

const LOTEAMENTO_MENU_ITEM =
	'<li><a href="/lancamentos/loteamento">Loteamento</a></li>';

const CASAS_MENU_PATTERN =
	/(<li><a href="\/lancamentos\/casas-em-condominio">Casas em condomínio<\/a><\/li>)(\s*)/g;

const GLOSSARY_MENU_PATTERN =
	/(<li(?:\s+class="active")?><a href="\/blog">Blog<\/a><\/li>)(\s*)(<li(?:\s+class="active")?><a href="\/contact">Contato<\/a><\/li>)/g;

const HEADER_ADD_LISTING_PATTERN =
	/<a href="\/contact" class="th-btn[^"]*"><i class="fa-regular fa-house-chimney me-2"><\/i>\s*(?:Add Listing|Anunciar imóvel)\s*<\/a>\s*/gi;

export function removeHeaderAddListingButton(html) {
	if (!html || !html.includes('house-chimney')) {
		return html;
	}

	return html.replace(HEADER_ADD_LISTING_PATTERN, '');
}

function isGlossaryPathActive(currentPath) {
	return currentPath === '/glossario' || currentPath.startsWith('/glossario/');
}

function isBairrosPathActive(currentPath) {
	return (
		currentPath === '/bairros' ||
		currentPath.startsWith('/bairros/') ||
		currentPath.startsWith('/bairro/')
	);
}

export function patchBairrosMenu(html, currentPath = '/') {
	if (!html || !html.includes('href="/bairros">Bairros</a>')) {
		return html;
	}

	const activeClass = isBairrosPathActive(currentPath) ? ' class="active"' : '';
	const item = `<li${activeClass}><a href="/bairros">Bairros</a></li>`;

	return html.replace(BAIRROS_SUBMENU_PATTERN, item);
}

export function patchLancamentosSubmenu(html) {
	if (html.includes('/lancamentos/loteamento')) {
		return html;
	}

	return html.replace(
		CASAS_MENU_PATTERN,
		`$1$2${LOTEAMENTO_MENU_ITEM}$2`,
	);
}

export function patchGlossaryMenu(html, currentPath = '/') {
	if (html.includes('href="/glossario"')) {
		return html;
	}

	const activeClass = isGlossaryPathActive(currentPath) ? ' class="active"' : '';
	const item = `<li${activeClass}><a href="/glossario">Glossário</a></li>`;

	return html.replace(GLOSSARY_MENU_PATTERN, `$1$2${item}$2$3`);
}

function isHomePath(currentPath) {
	const path = String(currentPath || '/').split('?')[0];
	return path === '/' || path === '/index.html';
}

export function patchListingHeaderBranding(html) {
	if (!html || !html.includes('header-logo')) {
		return html;
	}

	return html.replace(
		/(<div class="header-logo">\s*<a href="\/"[^>]*><img src=")\/assets\/img\/logo\.svg"/,
		'$1/assets/img/logo-white.svg"',
	);
}

export function patchSiteMenu(html, currentPath = '/') {
	let output = patchHeaderSocial(
		patchGlossaryMenu(
			patchLancamentosSubmenu(patchBairrosMenu(removeHeaderAddListingButton(html), currentPath)),
			currentPath,
		),
	);

	if (!isHomePath(currentPath)) {
		output = patchListingHeaderBranding(output);
	}

	return output;
}
