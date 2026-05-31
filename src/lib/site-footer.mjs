import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	SITE_EMAIL,
	SITE_LOCATION,
	SITE_PHONE_DISPLAY,
	SITE_PHONE_TEL,
} from './site-contact.mjs';
import { patchGlossaryMenu } from './site-menu.mjs';
import { patchFooterNavMenus } from './footer-nav.mjs';

const dataRoot = join(process.cwd(), 'src/data');
const FOOTER_NEIGHBORHOODS_MARKER = 'footer-bairros-section';
const FOOTER_CITIES_TITLE = 'Cidades de Santa Catarina';

export const FOOTER_DISCLAIMER =
	'As informações e imagens divulgadas neste site são de caráter informativo e pertencem às respectivas incorporadoras. O atendimento é realizado por corretores credenciados e devidamente registrados no CRECI.';

export const FOOTER_COPYRIGHT_TEXT = '2025-2026 - Viver Catarina - Todos os direitos reservados';

const FOOTER_DISCLAIMER_HTML = `<p class="footer-disclaimer">${FOOTER_DISCLAIMER}</p>`;
const FOOTER_COPYRIGHT_TEXT_HTML =
	'<p class="copyright-text">2025-2026 - <a href="/">Viver Catarina</a> - Todos os direitos reservados</p>';
const FOOTER_COPYRIGHT_EMAIL_HTML = `<p class="copyright-email"><a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a></p>`;

const FOOTER_CONTACT_COLUMN_HTML = `                                <div class="footer-item">
                                    <div class="widget footer-widget footer-contact-widget" aria-labelledby="footer-nav-contato">
                                        <h3 class="widget_title" id="footer-nav-contato">Contato</h3>
                                        <address class="footer-info-wrap">
                                            <div class="footer-info">
                                                <i class="fas fa-phone"></i>
                                                <p class="info-box_link"><a href="tel:${SITE_PHONE_TEL}">${SITE_PHONE_DISPLAY}</a></p>
                                            </div>
                                            <div class="footer-info">
                                                <i class="fas fa-envelope"></i>
                                                <p class="info-box_link"><a href="mailto:${SITE_EMAIL}">${SITE_EMAIL}</a></p>
                                            </div>
                                            <div class="footer-info">
                                                <i class="fas fa-location-dot"></i>
                                                <p class="info-box_link"><span>${SITE_LOCATION}</span></p>
                                            </div>
                                        </address>
                                    </div>
                                </div>`;

export { FOOTER_CONTACT_COLUMN_HTML };

const FOOTER_ABOUT_LOGO_HTML = `<div class="about-logo">
                                    <a href="/" aria-label="Viver Catarina Imóveis na Planta - página inicial"><img src="/assets/img/logo-white.svg" alt="Viver Catarina Imóveis na Planta" width="220" height="44"></a>
                                </div>`;

const FOOTER_SUPORTE_COLUMN_PATTERN =
	/(<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-suporte">[\s\S]*?<\/nav>\s*<\/div>)/;

const FOOTER_ABOUT_CLOSE_PATTERN =
	/<\/div>\s*<\/div>\s*<\/div>\s*<div class="footer-all-widget-item">/;

function stripContactFromAboutContent(content) {
	return content
		.replace(/\s*<address class="footer-info-wrap">[\s\S]*?<\/address>\s*/gi, '')
		.replace(/\s*<p class="footer-info">[\s\S]*?<\/p>\s*/gi, '')
		.replace(/\s*<div class="footer-info">[\s\S]*?<\/div>\s*/gi, '')
		.replace(/\s*<\/address>\s*/gi, '');
}

function removeAboutWidgetContactInfo(html) {
	if (!html.includes('<footer') || !html.includes('th-widget-about')) {
		return html;
	}

	const footerStart = html.indexOf('<footer');
	const footerEnd = html.indexOf('</footer>', footerStart);
	if (footerStart === -1 || footerEnd === -1) {
		return html;
	}

	const footer = html.slice(footerStart, footerEnd + '</footer>'.length);
	const aboutStart = footer.indexOf('<div class="th-widget-about">');
	if (aboutStart === -1) {
		return html;
	}

	const closeMatch = footer.slice(aboutStart).match(FOOTER_ABOUT_CLOSE_PATTERN);
	if (!closeMatch || closeMatch.index === undefined) {
		return html;
	}

	const aboutBlockStart = footerStart + aboutStart;
	const aboutBlockEnd = footerStart + aboutStart + closeMatch.index;
	const aboutContentStart = aboutBlockStart + '<div class="th-widget-about">'.length;
	const cleanedContent = stripContactFromAboutContent(html.slice(aboutContentStart, aboutBlockEnd));

	return `${html.slice(0, aboutContentStart)}${cleanedContent}${html.slice(aboutBlockEnd)}`;
}

function patchFooterAboutBranding(html) {
	if (!html.includes('<footer') || !html.includes('th-widget-about')) {
		return html;
	}

	let output = html.replace(
		/(<div class="footer-all-widget-item">\s*<div class="widget footer-widget">\s*)<h3 class="widget_title">Viver Catarina<\/h3>\s*(?=<div class="th-widget-about">)/,
		'$1',
	);

	const footerStart = output.indexOf('<footer');
	const footerEnd = output.indexOf('</footer>', footerStart);
	if (footerStart === -1 || footerEnd === -1) {
		return output;
	}

	const footer = output.slice(footerStart, footerEnd + '</footer>'.length);
	const aboutStart = footer.indexOf('<div class="th-widget-about">');
	if (aboutStart === -1) {
		return output;
	}

	const closeMatch = footer.slice(aboutStart).match(FOOTER_ABOUT_CLOSE_PATTERN);
	if (!closeMatch || closeMatch.index === undefined) {
		return output;
	}

	const aboutBlockStart = footerStart + aboutStart;
	const aboutBlockEnd = footerStart + aboutStart + closeMatch.index;
	const aboutContentStart = aboutBlockStart + '<div class="th-widget-about">'.length;
	let aboutContent = output.slice(aboutContentStart, aboutBlockEnd);

	aboutContent = aboutContent.replace(
		/(<p class="about-text">[\s\S]*?<\/p>)\s*<div class="about-logo">[\s\S]*?<\/div>\s*/i,
		'$1\n                                ',
	);

	const hasLogoBeforeText = /<div class="about-logo">[\s\S]*?<\/div>\s*<p class="about-text">/.test(
		aboutContent,
	);

	if (hasLogoBeforeText) {
		aboutContent = aboutContent.replace(
			/<div class="about-logo">[\s\S]*?<\/div>\s*(?=<p class="about-text">)/,
			`${FOOTER_ABOUT_LOGO_HTML}\n                                `,
		);
	} else {
		aboutContent = aboutContent.replace(
			/(<p class="about-text">)/,
			`${FOOTER_ABOUT_LOGO_HTML}\n                                $1`,
		);
	}

	return `${output.slice(0, aboutContentStart)}${aboutContent}${output.slice(aboutBlockEnd)}`;
}

function injectFooterContactColumn(html) {
	if (html.includes('footer-nav-contato') || !html.includes('footer-nav-suporte')) {
		return html;
	}

	return html.replace(FOOTER_SUPORTE_COLUMN_PATTERN, `$1\n${FOOTER_CONTACT_COLUMN_HTML}`);
}

function hasFooterContactColumn(html) {
	return html.includes('footer-nav-contato') || html.includes('footer-contact-widget');
}

function buildFooterCopyrightRow(socialContent) {
	return `                <div class="row gy-3 justify-content-lg-between justify-content-center align-items-center footer-copyright-row">
                    <div class="col-auto footer-copyright-email">
                        ${FOOTER_COPYRIGHT_EMAIL_HTML}
                    </div>
                    <div class="col-lg-7 footer-copyright-center">
                        ${FOOTER_COPYRIGHT_TEXT_HTML}
                    </div>
                    <div class="col-auto footer-copyright-social">
${socialContent}                    </div>
                </div>`;
}

function patchCopyrightText(html) {
	if (html.includes('footer-copyright-email')) {
		return html
			.replace(/<p class="copyright-text">[\s\S]*?<\/p>/, FOOTER_COPYRIGHT_TEXT_HTML)
			.replace(/<p class="copyright-email">[\s\S]*?<\/p>/, FOOTER_COPYRIGHT_EMAIL_HTML);
	}

	return html.replace(
		/<div class="row gy-3 justify-content-lg-between justify-content-center align-items-center">\s*<div class="col-lg-7">\s*<p class="copyright-text">[\s\S]*?<\/p>\s*<\/div>\s*<div class="col-auto">([\s\S]*?)<\/div>\s*<\/div>/,
		buildFooterCopyrightRow('$1'),
	);
}

export function buildFooterNeighborhoodsSectionHtml() {
	const neighborhoods = JSON.parse(
		readFileSync(join(dataRoot, 'florianopolis-neighborhoods.json'), 'utf8'),
	);
	const regions = JSON.parse(
		readFileSync(join(dataRoot, 'footer-neighborhoods-by-region.json'), 'utf8'),
	);
	const neighborhoodBySlug = new Map(neighborhoods.map((neighborhood) => [neighborhood.slug, neighborhood]));

	const regionsHtml = regions
		.map(({ region, slugs }) => {
			const items = slugs
				.map((slug) => neighborhoodBySlug.get(slug))
				.filter(Boolean)
				.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
				.map(
					({ slug, name }) =>
						`<li><a href="/bairro/${slug}">${name}</a></li>`,
				)
				.join('\n                                ');

			return `                        <div class="footer-bairros-region">
                            <h4 class="footer-bairros-region-title">${region}</h4>
                            <ul class="footer-bairros-list">
                                ${items}
                            </ul>
                        </div>`;
		})
		.join('\n');

	return `        <section class="footer-bairros-section" aria-label="Bairros de Florianópolis">
            <div class="container">
                <div class="footer-bairros-wrap">
                    <h3 class="widget_title">Bairros de Florianópolis</h3>
                    <div class="footer-bairros-regions">
${regionsHtml}
                    </div>
                </div>
            </div>
        </section>
`;
}

function removeFooterNeighborhoodsSection(html) {
	return html
		.replace(
			/<section class="footer-cities-section footer-neighborhoods-section"[\s\S]*?<\/section>\s*/g,
			'',
		)
		.replace(
			/<section class="footer-bairros-section footer-bairros-section"[\s\S]*?<\/section>\s*/g,
			'',
		)
		.replace(
			/<section class="footer-bairros-section[\s\S]*?<\/section>\s*/g,
			'',
		);
}

function patchFooterCitiesTitle(html) {
	return html.replace(
		/(<(?:section|div) class="footer-cities-section"[\s\S]*?<div class="footer-cities-wrap">\s*)<h3 class="widget_title">Cidades(?: em Santa Catarina)?<\/h3>/,
		`$1<h3 class="widget_title">${FOOTER_CITIES_TITLE}</h3>`,
	);
}

function patchFooterNeighborhoodsSection(html) {
	return removeFooterNeighborhoodsSection(html);
}

export function patchSiteFooter(html) {
	if (!html || !html.includes('copyright-wrap')) {
		return html;
	}

	let output = injectFooterContactColumn(html);

	if (hasFooterContactColumn(output)) {
		output = removeAboutWidgetContactInfo(output);
	}

	output = patchFooterAboutBranding(output);
	output = patchCopyrightText(output);
	output = patchGlossaryMenu(output);
	output = patchFooterNavMenus(output);
	output = patchFooterNeighborhoodsSection(output);
	output = patchFooterCitiesTitle(output);

	if (output.includes('footer-disclaimer')) {
		output = output.replace(/<p class="footer-disclaimer">[\s\S]*?<\/p>/, FOOTER_DISCLAIMER_HTML);
	} else {
		output = output.replace(
			/(<div class="copyright-wrap">[\s\S]*?<div class="container">\s*)/,
			`$1${FOOTER_DISCLAIMER_HTML}\n                `,
		);
	}

	return output;
}
