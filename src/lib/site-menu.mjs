import { listActiveNeighborhoods } from './property-listings.mjs';
import { patchHeaderSocial } from './site-social.mjs';

const BAIRROS_SUBMENU_PATTERN =
	/(<li class="menu-item-has-children(?: active)?">\s*<a href="\/bairros">Bairros<\/a>\s*<ul class="sub-menu">)[\s\S]*?(<\/ul>\s*<\/li>)/g;

const LOTEAMENTO_MENU_ITEM =
	'<li><a href="/lancamentos/loteamento">Loteamento</a></li>';

const CASAS_MENU_PATTERN =
	/(<li><a href="\/lancamentos\/casas-em-condominio">Casas em condomínio<\/a><\/li>)(\s*)/g;

function isBairroPathActive(href, currentPath) {
	return currentPath === href || currentPath.startsWith(`${href}/`);
}

export function buildBairrosSubmenuHtml(currentPath, indent = '                        ') {
	return listActiveNeighborhoods()
		.map(({ name, slug }) => {
			const href = `/bairro/${slug}`;
			const activeClass = isBairroPathActive(href, currentPath) ? ' class="active"' : '';

			return `${indent}<li${activeClass}><a href="${href}">${name}</a></li>`;
		})
		.join('\n');
}

export function patchBairrosMenu(html, currentPath = '/') {
	const submenu = buildBairrosSubmenuHtml(currentPath);

	return html.replace(BAIRROS_SUBMENU_PATTERN, `$1\n${submenu}\n                    $2`);
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

export function patchSiteMenu(html, currentPath = '/') {
	return patchHeaderSocial(patchLancamentosSubmenu(patchBairrosMenu(html, currentPath)));
}
