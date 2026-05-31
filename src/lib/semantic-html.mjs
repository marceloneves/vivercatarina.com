const MAIN_ID = 'conteudo-principal';

function slugifyLabel(value) {
	return String(value || '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function replaceDivWithClass(html, classPrefix, newTag, ariaLabel) {
	const openNeedle = `<div class="${classPrefix}`;
	let result = '';
	let index = 0;

	while (index < html.length) {
		const openIndex = html.indexOf(openNeedle, index);

		if (openIndex === -1) {
			result += html.slice(index);
		 break;
		}

		result += html.slice(index, openIndex);
		const tagEnd = html.indexOf('>', openIndex);

		if (tagEnd === -1) {
			result += html.slice(openIndex);
			break;
		}

		let openTag = html.slice(openIndex, tagEnd + 1);
		openTag = openTag.replace(/^<div /, `<${newTag} `);

		if (ariaLabel && !openTag.includes('aria-label=')) {
			openTag = openTag.replace('>', ` aria-label="${ariaLabel}">`);
		}

		result += openTag;

		let depth = 1;
		let cursor = tagEnd + 1;

		while (cursor < html.length && depth > 0) {
			const nextOpen = html.indexOf('<div', cursor);
			const nextClose = html.indexOf('</div>', cursor);

			if (nextClose === -1) {
				result += html.slice(tagEnd + 1);
				return result;
			}

			if (nextOpen !== -1 && nextOpen < nextClose) {
				depth += 1;
				cursor = nextOpen + 4;
				continue;
			}

			depth -= 1;

			if (depth === 0) {
				result += html.slice(tagEnd + 1, nextClose);
				result += `</${newTag}>`;
				index = nextClose + 6;
				break;
			}

			cursor = nextClose + 6;
		}
	}

	return result;
}

function insertAfterFirstHeader(html, snippet) {
	const headerEnd = html.indexOf('</header>');

	if (headerEnd === -1) {
		return `${snippet}${html}`;
	}

	const insertAt = headerEnd + '</header>'.length;
	return `${html.slice(0, insertAt)}${snippet}${html.slice(insertAt)}`;
}

export function wrapMainOpening(html) {
	if (!html || html.includes(`id="${MAIN_ID}"`)) {
		return html;
	}

	return insertAfterFirstHeader(html, `\n    <main id="${MAIN_ID}">`);
}

export function wrapMainClosing(html) {
	if (!html || html.trimStart().startsWith('</main>')) {
		return html;
	}

	return `</main>\n${html}`;
}

export function wrapSplitPageContent(beforeHtml, afterHtml) {
	return {
		before: wrapMainOpening(beforeHtml),
		after: wrapMainClosing(afterHtml),
	};
}

export function wrapMainLandmark(html) {
	if (!html || html.includes(`id="${MAIN_ID}"`)) {
		return html;
	}

	const headerEnd = html.indexOf('</header>');
	const footerStart = html.indexOf('<footer');

	if (headerEnd === -1 || footerStart === -1 || footerStart <= headerEnd) {
		return html;
	}

	const before = html.slice(0, headerEnd + '</header>'.length);
	const mainContent = html.slice(headerEnd + '</header>'.length, footerStart);
	const after = html.slice(footerStart);

	return `${before}\n    <main id="${MAIN_ID}">${mainContent}</main>\n    ${after}`;
}

function enhanceNavigation(html) {
	return html
		.replace(
			/<nav class="main-menu"\s+aria-label="Menu principal"\s+d-none d-lg-inline-block">/g,
			'<nav class="main-menu d-none d-lg-inline-block" aria-label="Menu principal">',
		)
		.replace(
			/<nav class="main-menu([^"]*)"(?![^>]*aria-label)([^>]*)>/g,
			'<nav class="main-menu$1" aria-label="Menu principal"$2>',
		)
		.replace(
			/<ul class="breadcumb-menu">([\s\S]*?)<\/ul>/g,
			'<ol class="breadcumb-menu">$1</ol>',
		)
		.replace(
			/<ol class="breadcumb-menu">([\s\S]*?)<\/ol>/g,
			(match, inner) => {
				if (inner.includes('aria-current="page"')) {
					return match;
				}

				const updated = inner.replace(
					/<li>(?!\s*<a)([\s\S]*?)<\/li>\s*$/,
					'<li><span aria-current="page">$1</span></li>',
				);

				return `<ol class="breadcumb-menu">${updated}</ol>`;
			},
		)
		.replace(
			/<aside class="sidebar-area"(?![^>]*aria-label)/g,
			'<aside class="sidebar-area" aria-label="Barra lateral"',
		);
}

function enhanceLandmarks(html) {
	let output = html;
	output = replaceDivWithClass(output, 'th-mobile-menu', 'nav', 'Menu mobile');
	output = replaceDivWithClass(output, 'breadcumb-wrapper', 'nav', 'Trilha de navegação');
	output = replaceDivWithClass(output, 'th-hero-wrapper', 'section', 'Destaque principal');
	output = replaceDivWithClass(output, 'search-area', 'section', 'Busca de imóveis');
	output = replaceDivWithClass(output, 'footer-cities-section', 'section', 'Cidades atendidas');
	output = replaceDivWithClass(output, 'gallery-sec-1', 'section', 'Galeria de bairros');
	output = replaceDivWithClass(output, 'why-sec-2', 'section', 'Diferenciais');
	output = replaceDivWithClass(output, 'counter-sec1', 'section', 'Indicadores');
	output = replaceDivWithClass(output, 'testi-card-area-1', 'section', 'Depoimentos');
	output = replaceDivWithClass(output, 'testi-card-area-2', 'section', 'Depoimentos');
	output = replaceDivWithClass(output, 'th-blog-wrapper', 'section', 'Artigos do blog');
	output = replaceDivWithClass(output, 'header-links', 'nav', 'Contato e redes sociais');
	return output;
}

function enhanceArticles(html) {
	let output = html;
	const articleClasses = ['blog-card', 'gallery-card', 'popular-list-1', 'th-blog blog-single'];

	for (const className of articleClasses) {
		output = replaceDivWithClass(output, className, 'article');
	}

	return output;
}

function enhanceForms(html) {
	return html
		.replace(
			/<section class="search-area" aria-label="Busca de imóveis">\s*<form(?![^>]*\brole=)/g,
			'<section class="search-area" aria-label="Busca de imóveis"><form role="search"',
		)
		.replace(
			/<form action="\/submit-form"(?![^>]*\brole=)/g,
			'<form role="search" action="/submit-form"',
		);
}

function enhanceFooter(html) {
	let output = replaceDivWithClass(html, 'widget widget_nav_menu footer-widget', 'nav');
	output = replaceDivWithClass(output, 'footer-info-wrap', 'address');

	return output.replace(
		/<nav class="widget widget_nav_menu footer-widget">\s*<h3 class="widget_title">([^<]+)<\/h3>/g,
		(match, title) => {
			const id = `footer-nav-${slugifyLabel(title)}`;
			return `<nav class="widget widget_nav_menu footer-widget" aria-labelledby="${id}"><h3 class="widget_title" id="${id}">${title}</h3>`;
		},
	);
}

function enhanceBranding(html) {
	return html
		.replace(
			/<a href="\/"><img src="\/assets\/img\/logo-white\.svg" alt="Viver Catarina"><\/a>/g,
			'<a href="/" aria-label="Viver Catarina - página inicial"><img src="/assets/img/logo-white.svg" alt=""></a>',
		)
		.replace(
			/<a href="\/"><img src="\/assets\/img\/logo\.svg" alt="Viver Catarina"><\/a>/g,
			'<a href="/" aria-label="Viver Catarina - página inicial"><img src="/assets/img/logo.svg" alt=""></a>',
		);
}

function enhanceDecorativeIcons(html) {
	return html.replace(
		/<img src="\/assets\/img\/icon\/(sell_rent_icon|popular-location|bed|bath|sqft)\.svg" alt="[^"]*">/g,
		'<img src="/assets/img/icon/$1.svg" alt="" aria-hidden="true">',
	);
}

export function applySemanticHtml(html) {
	if (!html) {
		return html;
	}

	let output = html;
	output = enhanceBranding(output);
	output = enhanceNavigation(output);
	output = enhanceLandmarks(output);
	output = enhanceArticles(output);
	output = enhanceForms(output);
	output = enhanceFooter(output);
	output = enhanceDecorativeIcons(output);
	output = wrapMainLandmark(output);

	return output;
}
