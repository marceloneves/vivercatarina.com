import {
	SITE_EMAIL,
	SITE_LOCATION,
	SITE_PHONE_DISPLAY,
	SITE_PHONE_TEL,
} from './site-contact.mjs';

export const FOOTER_DISCLAIMER =
	'As informações e imagens divulgadas neste site são de caráter informativo e pertencem às respectivas incorporadoras. O atendimento é realizado por corretores credenciados e devidamente registrados no CRECI.';

export const FOOTER_COPYRIGHT_TEXT = '2025-2026 - Viver Catarina - Todos os direitos reservados';

const FOOTER_DISCLAIMER_HTML = `<p class="footer-disclaimer">${FOOTER_DISCLAIMER}</p>`;
const FOOTER_COPYRIGHT_HTML =
	'<p class="copyright-text">2025-2026 - <a href="/">Viver Catarina</a> - Todos os direitos reservados</p>';

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

const FOOTER_SUPORTE_COLUMN_PATTERN =
	/(<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-suporte">[\s\S]*?<\/nav>\s*<\/div>)(?=\s*<\/div>\s*<\/div>)/;

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

function injectFooterContactColumn(html) {
	if (!html.includes('footer-nav-suporte') || html.includes('footer-nav-contato')) {
		return html;
	}

	return html.replace(FOOTER_SUPORTE_COLUMN_PATTERN, `$1\n${FOOTER_CONTACT_COLUMN_HTML}`);
}

function patchCopyrightText(html) {
	return html.replace(
		/(<div class="copyright-wrap">[\s\S]*?)<p class="copyright-text">[\s\S]*?<\/p>/,
		`$1${FOOTER_COPYRIGHT_HTML}`,
	);
}

export function patchSiteFooter(html) {
	if (!html || !html.includes('copyright-wrap')) {
		return html;
	}

	let output = injectFooterContactColumn(html);
	output = removeAboutWidgetContactInfo(output);
	output = patchCopyrightText(output);

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
