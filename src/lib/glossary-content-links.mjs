export const GLOSSARY_LINK_CLASS = 'glossary-term-link';
export const GLOSSARY_EXTERNAL_LINK_CLASS = 'glossary-external-link';

/** @param {string[]} [_excludeSlugs] */
export function buildGlossaryLinkRules(_excludeSlugs = []) {
	return [];
}

/** @param {string} html */
export function applyGlossaryInlineLinks(html) {
	return html ?? '';
}

/** @param {string} definition @param {string} [websiteUrl] */
export function linkIncorporadoraWebsite(definition, websiteUrl) {
	if (!definition || !websiteUrl || /<a\b/i.test(definition)) {
		return definition;
	}

	return definition.replace(
		/\b(incorporadora|incorporador)\b/i,
		(match) =>
			`<a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="${GLOSSARY_EXTERNAL_LINK_CLASS}">${match}</a>`,
	);
}

const MAIN_ID = 'conteudo-principal';

/** @param {string} html */
export function applyGlossaryInlineLinksInMain(html) {
	if (!html) {
		return html;
	}

	const mainOpen = `<main id="${MAIN_ID}">`;
	const mainStart = html.indexOf(mainOpen);

	if (mainStart === -1) {
		const headerEnd = html.indexOf('</header>');
		const footerStart = html.indexOf('<footer');

		if (headerEnd === -1 || footerStart === -1 || footerStart <= headerEnd) {
			return html;
		}

		const before = html.slice(0, headerEnd + '</header>'.length);
		const mainContent = html.slice(headerEnd + '</header>'.length, footerStart);
		const after = html.slice(footerStart);

		return `${before}${applyGlossaryInlineLinks(mainContent)}${after}`;
	}

	const contentStart = mainStart + mainOpen.length;
	const mainEnd = html.indexOf('</main>', contentStart);

	if (mainEnd === -1) {
		return html;
	}

	const mainContent = applyGlossaryInlineLinks(html.slice(contentStart, mainEnd));

	return `${html.slice(0, contentStart)}${mainContent}${html.slice(mainEnd)}`;
}
