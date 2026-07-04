import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { patchSiteMenu } from './site-menu.mjs';
import { applySemanticHtml } from './semantic-html.mjs';

const templatePath = join(process.cwd(), 'src/content/template-pages/index.html');

export const HOME_HEADLINE_PREFIX = 'Viva o melhor de';
export const HOME_HEADLINE_HIGHLIGHT = 'Santa Catarina';
const HERO_END_MARKER = '<!--======== / Hero Section ========-->';

export function getHomeHeroBackgroundUrl() {
	// Imagem estática do hub (independe do inventário de imóveis).
	return '/assets/img/hero/vivercatarina-florianopolis.webp';
}

function stripHomeHeroSection(html) {
	const heroStart = html.indexOf('<section class="th-hero-wrapper');
	const heroEnd = html.indexOf(HERO_END_MARKER, heroStart);

	if (heroStart === -1 || heroEnd === -1) {
		return html;
	}

	return `${html.slice(0, heroStart)}${html.slice(heroEnd + HERO_END_MARKER.length)}`;
}

export function getHomePageShell() {
	const html = applySemanticHtml(readFileSync(templatePath, 'utf8'));
	const searchStart = html.indexOf('<section class="search-area"');
	const searchEndMarker = '<!--======== / Search Section ========-->';
	const searchEnd = html.indexOf(searchEndMarker, searchStart);
	const sectionStart = html.indexOf('<section class="popular-sec-1');
	const sectionEnd = html.indexOf('    </section><!--==============================\nGallery Area');
	const footerStart = html.indexOf('<!--==============================\n\tFooter Area');

	if (searchStart === -1 || searchEnd === -1) {
		throw new Error('Não foi possível localizar a busca na home.');
	}

	if (sectionStart === -1 || sectionEnd === -1) {
		throw new Error('Não foi possível localizar a seção de lançamentos na home.');
	}

	if (footerStart === -1) {
		throw new Error('Não foi possível localizar o rodapé na home.');
	}

	const headerAndPreSearch = stripHomeHeroSection(html.slice(0, searchStart));
	const before = patchSiteMenu(
		headerAndPreSearch + html.slice(searchEnd + searchEndMarker.length, sectionStart),
		'/',
	);

	return {
		before,
		after: html.slice(footerStart),
	};
}
