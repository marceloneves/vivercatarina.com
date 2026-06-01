import { patchHeaderSocial } from './site-social.mjs';

const BAIRROS_SUBMENU_PATTERN =
	/<li class="[^"]*\bmenu-item-has-children\b[^"]*">\s*<a href="\/bairros">Bairros<\/a>\s*<ul class="sub-menu">[\s\S]*?<\/ul>\s*<\/li>\s*/g;

const BAIRROS_SIMPLE_ITEM_PATTERN =
	/<li(?: class="[^"]*")?><a href="\/bairros">Bairros<\/a><\/li>\s*/g;

const LANCAMENTOS_SUBMENU_PATTERN =
	/<li class="[^"]*\bmenu-item-has-children\b[^"]*">\s*<a href="\/lancamentos">Lançamentos<\/a>\s*<ul class="sub-menu">[\s\S]*?<\/ul>\s*<\/li>\s*/g;

const LANCAMENTOS_SIMPLE_ITEM_PATTERN =
	/<li(?: class="[^"]*")?><a href="\/lancamentos">Lançamentos<\/a><\/li>\s*/g;

const HEADER_ADD_LISTING_PATTERN =
	/<a href="\/contact" class="th-btn[^"]*"><i class="fa-regular fa-house-chimney me-2"><\/i>\s*(?:Add Listing|Anunciar imóvel)\s*<\/a>\s*/gi;

const BLOG_MENU_ITEM_PATTERN = /<li(?: class="[^"]*")?><a href="\/blog">Blog<\/a><\/li>\s*/g;

export function removeHeaderAddListingButton(html) {
	if (!html || !html.includes('house-chimney')) {
		return html;
	}

	return html.replace(HEADER_ADD_LISTING_PATTERN, '');
}

function removeMainMenuLancamentosAndBairros(html) {
	if (!html) {
		return html;
	}

	return html
		.replace(LANCAMENTOS_SUBMENU_PATTERN, '')
		.replace(LANCAMENTOS_SIMPLE_ITEM_PATTERN, '')
		.replace(BAIRROS_SUBMENU_PATTERN, '')
		.replace(BAIRROS_SIMPLE_ITEM_PATTERN, '');
}

function removeBlogMenuItems(html) {
	if (!html) {
		return html;
	}

	return html.replace(BLOG_MENU_ITEM_PATTERN, '');
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
		removeBlogMenuItems(removeMainMenuLancamentosAndBairros(removeHeaderAddListingButton(html))),
	);

	output = output.replace(/Outras cidades/g, 'Cidades');

	if (!isHomePath(currentPath)) {
		output = patchListingHeaderBranding(output);
	}

	return output;
}
