import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { prepareBairroSidebarHtml } from '../src/lib/template-html.mjs';
import { applySemanticHtml } from '../src/lib/semantic-html.mjs';
import { buildFooterNavColumnsHtml } from '../src/lib/footer-nav.mjs';
import { FOOTER_CONTACT_COLUMN_HTML } from '../src/lib/site-footer.mjs';
import { homePageTranslations } from './home-page-translations.mjs';
import { propertyDetailsTranslations } from './property-details-translations.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = join(root, 'modelo/download-version');
const pagesDir = join(root, 'src/pages');
const contentDir = join(root, 'src/content/template-pages');

const htmlFiles = readdirSync(sourceDir).filter((file) => file.endsWith('.html'));

const homeTitles = {
	'index.html': 'Início',
	'home-2.html': 'Home Property',
	'home-3.html': 'Home Map',
	'home-4.html': 'Home Luxury',
	'home-5.html': 'Home Single Property',
	'home-6.html': 'Real Estate Company',
	'home-7.html': 'Real Estate Agency',
	'home-8.html': 'Real Estate Local Agency',
	'home-9.html': 'Home Single Property (v2)',
	'home-10.html': 'Modern House Agency',
};

function transformPaths(html) {
	let output = html;

	output = output.replace(/((?:href|src|data-bg-src|content)=")assets\//g, '$1/assets/');
	output = output.replace(/url\((['"]?)assets\//g, 'url($1/assets/');

	for (const file of htmlFiles) {
		const route = file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
		const pattern = new RegExp(`((?:href|action)=["'])${file.replace('.', '\\.')}(["'])`, 'g');
		output = output.replace(pattern, `$1${route}$2`);
	}

	return output;
}

function removePreloader(html) {
	return html.replace(
		/<!--\s*=+\s*\n\s*Preloader[\s\S]*?<div class="preloader[\s\S]*?<\/div>\s*/g,
		'',
	);
}

function removeScrollTop(html) {
	return html.replace(
		/<!-- Scroll To Top -->[\s\S]*?<div class="scroll-top">[\s\S]*?<\/div>\s*/g,
		'',
	);
}

function removeLanguageSelector(html) {
	return html.replace(/<li class="lang-wrapper">[\s\S]*?<\/li>\s*/g, '');
}

function localizeLabels(html) {
	return html
		.replace(/href="\/about">About Us<\/a>/g, 'href="/about">Quem Somos</a>')
		.replace(/breadcumb-title">About Us<\/h1>/g, 'breadcumb-title">Quem Somos</h1>')
		.replace(/<li>About Us<\/li>/g, '<li>Quem Somos</li>')
		.replace(/href="\/contact">Contact Us<\/a>/g, 'href="/contact">Contato</a>')
		.replace(/breadcumb-title">Contact<\/h1>/g, 'breadcumb-title">Contato</h1>')
		.replace(/<li>Contact with Us<\/li>/g, '<li>Contato</li>');
}

function simplifyHomeMenu(html) {
	const replaceHomeItem = (_match, activePart) => {
		const cssClass = activePart ? ' class="active"' : '';
		return `<li${cssClass}><a href="/">Início</a></li>`;
	};

	return html
		.replace(
			/<li class="menu-item-has-children(\s+active)?">\s*<a href="\/">Home<\/a>\s*<ul class="mega-menu[\s\S]*?<\/ul>\s*<\/li>/g,
			replaceHomeItem,
		)
		.replace(
			/<li class="menu-item-has-children(\s+active)?">\s*<a href="\/">Home<\/a>\s*<ul class="sub-menu[\s\S]*?<\/ul>\s*<\/li>/g,
			replaceHomeItem,
		);
}

function removeNestedMenuItem(html, label) {
	const marker = `<a href="#">${label}</a>`;
	let output = html;
	let searchIndex = 0;

	while (true) {
		const linkIndex = output.indexOf(marker, searchIndex);
		if (linkIndex === -1) break;

		const liStart = output.lastIndexOf('<li', linkIndex);
		const subMenuStart = output.indexOf('<ul class="sub-menu"', linkIndex);
		if (liStart === -1 || subMenuStart === -1 || subMenuStart - linkIndex > 200) {
			searchIndex = linkIndex + marker.length;
			continue;
		}

		let depth = 1;
		let pos = subMenuStart + 4;

		while (pos < output.length && depth > 0) {
			const nextOpen = output.indexOf('<ul', pos);
			const nextClose = output.indexOf('</ul>', pos);

			if (nextClose === -1) break;

			if (nextOpen !== -1 && nextOpen < nextClose) {
			 depth++;
			 pos = nextOpen + 3;
			 continue;
			}

			depth--;
			pos = nextClose + 5;
		}

		if (depth !== 0) {
			searchIndex = linkIndex + marker.length;
			continue;
		}

		const endMatch = output.slice(pos).match(/^\s*<\/li>/);
		const end = pos + (endMatch ? endMatch[0].length : 0);

		output = output.slice(0, liStart) + output.slice(end);
		searchIndex = liStart;
	}

	return output;
}

function removeExtraMenuItems(html) {
	return ['Property', 'Agencies', 'Pages'].reduce(
		(result, label) => removeNestedMenuItem(result, label),
		html,
	);
}

function simplifyBlogMenu(html) {
	const replaceBlogItem = (_match, activePart) => {
		const cssClass = activePart ? ' class="active"' : '';
		return `<li${cssClass}><a href="/blog">Blog</a></li>`;
	};

	return html.replace(
		/<li class="menu-item-has-children(\s+active)?">\s*<a href="#">Blog<\/a>\s*<ul class="sub-menu[\s\S]*?<\/ul>\s*<\/li>/g,
		replaceBlogItem,
	);
}

const footerCitiesByRegion = [
	{
		region: 'Grande Florianópolis',
		cities: ['Florianópolis', 'São José', 'Palhoça', 'Biguaçu'],
	},
	{
		region: 'Norte Catarinense',
		cities: ['Joinville', 'Jaraguá do Sul', 'Navegantes', 'São Bento do Sul'],
	},
	{
		region: 'Vale do Itajaí',
		cities: [
			'Blumenau',
			'Itajaí',
			'Balneário Camboriú',
			'Brusque',
			'Camboriú',
			'Itapema',
			'Rio do Sul',
			'Gaspar',
			'Indaial',
		],
	},
	{
		region: 'Sul Catarinense',
		cities: ['Criciúma', 'Tubarão', 'Araranguá', 'Içara'],
	},
	{
		region: 'Oeste Catarinense',
		cities: ['Chapecó', 'Concórdia'],
	},
	{
		region: 'Serra / Planalto',
		cities: ['Lages', 'Caçador'],
	},
];

const cityDomain = 'vivercatarina.com';

const footerDescription =
	'Viver Catarina é o portal de lançamentos imobiliários em Florianópolis. Encontre apartamentos na planta, casas em condomínio, loteamentos e imóveis prontos para morar com informações completas e atualizadas.';

const neighborhoods = JSON.parse(
	readFileSync(join(root, 'src/data/florianopolis-neighborhoods.json'), 'utf8'),
);

const lancamentosTypes = JSON.parse(
	readFileSync(join(root, 'src/data/lancamentos-types.json'), 'utf8'),
);

function citySlug(city) {
	return city
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/\s+/g, '');
}

function citySubdomainUrl(city) {
	return 'https://florianopolis.vivercatarina.com';
}

function getSiteMenu() {
	return [
		{ label: 'Início', href: '/' },
		{ label: 'Quem Somos', href: '/about' },
		{
			label: 'Lançamentos',
			href: '/lancamentos',
			children: lancamentosTypes
				.filter(({ slug }) => slug !== 'terrenos')
				.map(({ name, slug }) => ({
					label: name,
					href: `/lancamentos/${slug}`,
				})),
		},
		{
			label: 'Bairros',
			href: '/bairros',
		},
		{
			label: 'Outras cidades',
			href: '#',
			regions: footerCitiesByRegion,
		},
		{ label: 'Blog', href: '/blog' },
		{ label: 'Contato', href: '/contact' },
	];
}

const PROPERTY_LISTING_TEMPLATE = 'property.html';
const PROPERTY_LISTING_PER_PAGE = 4;

function buildPropertyListingPage({ slug, title }) {
	return {
		slug,
		title,
		template: PROPERTY_LISTING_TEMPLATE,
	};
}

const extraPages = [
	buildPropertyListingPage({ slug: 'lancamentos', title: 'Lançamentos' }),
	...lancamentosTypes.map(({ name, slug }) =>
		buildPropertyListingPage({ slug: `lancamentos/${slug}`, title: name }),
	),
	buildPropertyListingPage({ slug: 'bairros', title: 'Bairros' }),
	buildPropertyListingPage({ slug: 'bairros/ate-300-mil', title: 'Até R$ 300 mil' }),
	buildPropertyListingPage({ slug: 'bairros/300-a-500-mil', title: 'R$ 300 a 500 mil' }),
	buildPropertyListingPage({ slug: 'bairros/500-mil-a-1-milhao', title: 'R$ 500 mil a 1 milhão' }),
	buildPropertyListingPage({ slug: 'bairros/acima-de-1-milhao', title: 'Acima de R$ 1 milhão' }),
	...neighborhoods.map(({ name, slug }) =>
		buildPropertyListingPage({ slug: `bairro/${slug}`, title: name }),
	),
	{
		slug: 'blog/melhores-bairros-para-morar-em-florianopolis',
		title: 'Os 10 melhores bairros para morar em Florianópolis',
		template: 'blog-details.html',
	},
];

function isMenuItemActive(href, currentPath) {
	if (!href || href === '#') return false;
	if (href === currentPath) return true;
	if (href !== '/' && currentPath.startsWith(`${href}/`)) return true;
	return false;
}

function isMenuBranchActive(item, currentPath) {
	if (item.href && isMenuItemActive(item.href, currentPath)) return true;
	if (item.children?.some((child) => isMenuBranchActive(child, currentPath))) return true;
	return false;
}

function renderMenuItem(item, currentPath, indent) {
	if (item.regions) {
		const activeClass = isMenuBranchActive(item, currentPath) ? ' active' : '';
		const regionItems = item.regions
			.map((region) => {
				const cityItems = region.cities
					.map(
						(city) =>
							`${indent}                <li><a href="${citySubdomainUrl(city)}" target="_blank" rel="noopener noreferrer">${city}</a></li>`,
					)
					.join('\n');

				return `${indent}            <li class="menu-item-has-children">
${indent}                <a href="#">${region.region}</a>
${indent}                <ul class="sub-menu">
${cityItems}
${indent}                </ul>
${indent}            </li>`;
			})
			.join('\n');

		return `${indent}<li class="menu-item-has-children${activeClass}">
${indent}    <a href="#">${item.label}</a>
${indent}    <ul class="sub-menu">
${regionItems}
${indent}    </ul>
${indent}</li>`;
	}

	if (item.children?.length) {
		const activeClass = isMenuBranchActive(item, currentPath) ? ' active' : '';
		const children = item.children
			.map((child) => renderMenuItem(child, currentPath, `${indent}    `))
			.join('\n');

		return `${indent}<li class="menu-item-has-children${activeClass}">
${indent}    <a href="${item.href || '#'}">${item.label}</a>
${indent}    <ul class="sub-menu">
${children}
${indent}    </ul>
${indent}</li>`;
	}

	const activeClass = isMenuItemActive(item.href, currentPath) ? ' class="active"' : '';
	return `${indent}<li${activeClass}><a href="${item.href}">${item.label}</a></li>`;
}

function buildSiteMenuHtml(currentPath, indent = '                                    ') {
	return getSiteMenu()
		.map((item) => renderMenuItem(item, currentPath, indent))
		.join('\n');
}

function applyCustomMenu(html, currentPath) {
	const desktopMenu = buildSiteMenuHtml(currentPath, '                                    ');
	const mobileMenu = buildSiteMenuHtml(currentPath, '                    ');

	return html
		.replace(
			/(<div class="th-mobile-menu">\s*<ul>)[\s\S]*?(<\/ul>)/,
			`$1\n${mobileMenu}\n                $2`,
		)
		.replace(
			/(<nav class="main-menu[^"]*">\s*<ul>)[\s\S]*?(<\/ul>)/,
			`$1\n${desktopMenu}\n                                $2`,
		);
}

function buildFooterNavMenusHtml() {
	return `${buildFooterNavColumnsHtml()}\n${FOOTER_CONTACT_COLUMN_HTML}`;
}

const footerNavMenusPattern =
	/<div class="footer-item">\s*<div class="widget widget_nav_menu footer-widget">\s*<h3 class="widget_title">(?:Featured Houses|Imóveis em destaque)<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-item">\s*<div class="widget widget_nav_menu footer-widget">\s*<h3 class="widget_title">(?:Quick Links|Links rápidos)<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-item">\s*<div class="widget widget_nav_menu footer-widget">\s*<h3 class="widget_title">(?:Support|Suporte)<\/h3>[\s\S]*?<\/div>\s*<\/div>/;

function applyCustomFooterMenus(html) {
	return html.replace(footerNavMenusPattern, buildFooterNavMenusHtml());
}

function removeFooterLocationWidget(html) {
	return html.replace(
		/\s*<div class="footer-item">\s*<div class="widget widget_banner footer-widget">\s*<h3 class="widget_title">(?:Pillar Location|Localização)<\/h3>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g,
		'',
	);
}

function removeMatchingElementsByAttribute(html, attributePattern, shouldRemove) {
	let output = html;
	let bounds = getElementBoundsByAttribute(output, attributePattern);

	while (bounds) {
		if (shouldRemove(bounds.content)) {
			output = output.slice(0, bounds.start) + output.slice(bounds.end);
			bounds = getElementBoundsByAttribute(output, attributePattern);
			continue;
		}

		const nextHtml = output.slice(bounds.end);
		const nextBounds = getElementBoundsByAttribute(nextHtml, attributePattern);
		if (!nextBounds) break;

		bounds = {
			start: bounds.end + nextBounds.start,
			end: bounds.end + nextBounds.end,
			content: nextBounds.content,
		};
	}

	return output;
}

function isTrustpilotMarkup(content) {
	return /Trusti?pilot/i.test(content) || /star-icon\.svg/i.test(content);
}

function removeTrustpilotReferences(html) {
	let output = removeMatchingElementsByAttribute(
		html,
		/class="[^"]*\btrust-content\b/,
		isTrustpilotMarkup,
	);

	output = removeMatchingElementsByAttribute(
		output,
		/class="[^"]*\bwhy-right-review-wrap\b/,
		() => true,
	);

	return output.replace(/Trustipilot/gi, '').replace(/Trustpilot/gi, '');
}

function removeFooterLogoBelowDescription(html) {
	let output = html;
	let bounds = getElementBoundsByAttribute(output, /class="[^"]*\babout-logo\b/);

	while (bounds) {
		const before = output.slice(0, bounds.start);
		const widgetStart = before.lastIndexOf('<div class="th-widget-about">');
		let shouldRemove = false;

		if (widgetStart !== -1) {
			const widgetHtml = output.slice(widgetStart, bounds.end);
			const logoPos = widgetHtml.indexOf('about-logo');
			const textPos = widgetHtml.indexOf('about-text');
			shouldRemove = logoPos !== -1 && textPos !== -1 && logoPos > textPos;
		}

		if (shouldRemove) {
			output = output.slice(0, bounds.start) + output.slice(bounds.end);
			bounds = getElementBoundsByAttribute(output, /class="[^"]*\babout-logo\b/);
			continue;
		}

		const nextHtml = output.slice(bounds.end);
		const nextBounds = getElementBoundsByAttribute(nextHtml, /class="[^"]*\babout-logo\b/);
		if (!nextBounds) break;

		bounds = {
			start: bounds.end + nextBounds.start,
			end: bounds.end + nextBounds.end,
			content: nextBounds.content,
		};
	}

	return output;
}

function removeElementByClassName(html, className) {
	const openTag = `<div class="${className}">`;
	let searchFrom = 0;

	while (true) {
		const start = html.indexOf(openTag, searchFrom);
		if (start === -1) return html;

		const tagEnd = html.indexOf('>', start);
		if (tagEnd === -1) return html;

		let depth = 1;
		let pos = tagEnd + 1;

		while (pos < html.length && depth > 0) {
			const nextOpen = html.indexOf('<div', pos);
			const nextClose = html.indexOf('</div>', pos);

			if (nextClose === -1) return html;

			if (nextOpen !== -1 && nextOpen < nextClose) {
				depth++;
				pos = nextOpen + 4;
				continue;
			}

			depth--;
			pos = nextClose + 6;
		}

		html = html.slice(0, start) + html.slice(pos);
		searchFrom = start;
	}
}

function removeFooterBottomPromo(html) {
	return removeElementByClassName(html, 'footer-right-bottom-wrap');
}

function removeFooterGallery(html) {
	return removeElementByClassName(html, 'footer-bottom-community');
}

function removeElementById(html, id) {
	const bounds = getElementBoundsByAttribute(html, new RegExp(`id="${id}"`));
	if (!bounds) return html;

	return html.slice(0, bounds.start) + html.slice(bounds.end);
}

function simplifyHomeSearchFilter(html) {
	let output = html.replace(
		/\s*<div class="search-wrap-area-top">[\s\S]*?<\/div>\s*(?=<div class="tab-content" id="myTabContent">)/,
		'',
	);

	output = removeElementById(output, 'sell');
	output = removeElementById(output, 'rent');

	output = output.replace(/<div class="search-wrap">/, '<div class="search-wrap home-search-filter">');
	output = output.replace(/<div class="row"><div class="tab-content" id="myTabContent">/, '<div class="tab-content" id="myTabContent">');
	output = output.replace(
		/(<div class="tab-content" id="myTabContent">[\s\S]*?<\/div>\s*)<\/div>(\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/form>)/,
		'$1$2',
	);

	return output;
}

function updateFooterDescription(html) {
	return html.replace(
		/(<footer[\s\S]*?<div class="th-widget-about">[\s\S]*?<p class="about-text">)[^<]*(<\/p>)/,
		`$1${footerDescription}$2`,
	);
}

function getPagePathFromFile(fileName) {
	if (fileName === 'index.html') return '/';
	return `/${fileName.replace(/\.html$/, '')}`;
}

function updateBreadcrumbTitle(html, title) {
	return html
		.replace(/<h1 class="breadcumb-title">[^<]*<\/h1>/, `<h1 class="breadcumb-title">${title}</h1>`)
		.replace(/(<ul class="breadcumb-menu">[\s\S]*?<li>)[^<]*(<\/li>)/, `$1${title}$2`);
}

function removeColorScheme(html) {
	return html
		.replace(/<div class="color-scheme">[\s\S]*?<input type="color" id="thcolorpicker"[^>]*>\s*<\/div>\s*/g, '')
		.replace(/<div class="color-scheme">[\s\S]*?<\/div>\s*(?=<!--==============================\s*\n\s*Sidemenu)/g, '');
}

function updateListingTitle(html, listingTitle) {
	return html.replace(
		/<h4 class="box-title text-start[^"]*">Property Listing<\/h4>/,
		`<h4 class="box-title text-start ">${listingTitle}</h4>`,
	);
}

function stripPageEffects(html) {
	let output = removeColorScheme(html);

	output = output
		.replace(/\s*data-wow-duration="[^"]*"/gi, '')
		.replace(/\s*data-wow-delay="[^"]*"/gi, '')
		.replace(/\s+fadeinup(?:\s+wow|\b)/gi, ' ')
		.replace(/\s+wow(?:\s+fadeinup|\b)/gi, ' ');

	output = output.replace(
		/<div class="th-slider"[^>]*>\s*<div class="swiper-wrapper">\s*<div class="swiper-slide">\s*(<a[\s\S]*?<\/a>)\s*<\/div>[\s\S]*?<\/div>\s*<div class="icon-wrap">[\s\S]*?<\/div>\s*<\/div>/g,
		'$1',
	);

	output = output.replace(/\s*popular-popup-image/g, '');

	output = output.replace(/<div class="actions">\s*[\s\S]*?<\/div>\s*/g, '');
	output = output.replace(/<div class="actions-style-2-wrapper">\s*[\s\S]*?<\/div>\s*<\/div>\s*/g, '');

	output = output.replace(
		/(<div class="thumb-wrapper">\s*<a[^>]*href=")\/assets\/img\/[^"]*(")/g,
		'$1/property-details$2',
	);

	output = output.replace(
		/<div class="thumb-wrapper">\s*<a[^>]*href="\/property-details"[^>]*>(<img[^>]*>)\s*<\/a>\s*<div class="popular-badge">([\s\S]*?)<\/div>\s*<\/div>/g,
		'<div class="thumb-wrapper"><a href="/property-details" class="thumb-link">$1<div class="popular-badge">$2</div></a></div>',
	);

	return output;
}

function getElementBoundsByAttribute(html, attributePattern) {
	const matchIndex = html.search(attributePattern);
	if (matchIndex === -1) return null;

	const start = html.lastIndexOf('<div', matchIndex);
	if (start === -1) return null;

	const tagEnd = html.indexOf('>', start);
	if (tagEnd === -1) return null;

	let depth = 1;
	let pos = tagEnd + 1;

	while (pos < html.length && depth > 0) {
		const nextOpen = html.indexOf('<div', pos);
		const nextClose = html.indexOf('</div>', pos);

		if (nextClose === -1) return null;

		if (nextOpen !== -1 && nextOpen < nextClose) {
			depth++;
		 pos = nextOpen + 4;
			continue;
		}

		depth--;
		pos = nextClose + 6;
	}

	return { start, end: pos, content: html.slice(start, pos) };
}

function flattenSwiperWithId(html, id, wrapperClass = 'static-slider-content') {
	const bounds = getElementBoundsByAttribute(html, new RegExp(`id="${id}"`));
	if (!bounds) return html;

	const wrapperMatch = bounds.content.match(/<div class="swiper-wrapper">([\s\S]*?)<\/div>/);
	if (!wrapperMatch) return html;

	const slides = [...wrapperMatch[1].matchAll(/<div class="swiper-slide">\s*([\s\S]*?)<\/div>(?=\s*(?:<div class="swiper-slide">|<\/div>))/g)]
		.map((match) => match[1].trim())
		.join('\n');

	const replacement = `<div class="${wrapperClass}">\n${slides}\n</div>`;
	return html.slice(0, bounds.start) + replacement + html.slice(bounds.end);
}

function flattenHeroSlider(html) {
	const bounds = getElementBoundsByAttribute(html, /id="heroSlider1"/);
	if (!bounds) return html;

	const firstSlideMatch = bounds.content.match(
		/<div class="swiper-wrapper">\s*<div class="swiper-slide">\s*(<div class="hero-inner[\s\S]*?<\/div>)\s*<\/div>\s*<div class="swiper-slide">/,
	);
	if (!firstSlideMatch) return html;

	return html.slice(0, bounds.start) + firstSlideMatch[1] + html.slice(bounds.end);
}

function removeAnimationAttributes(html) {
	return html
		.replace(/\s*data-ani(?:-delay)?="[^"]*"/gi, '')
		.replace(/\s*data-wow-duration="[^"]*"/gi, '')
		.replace(/\s*data-wow-delay="[^"]*"/gi, '');
}

function removeAnimationClasses(html) {
	const footerShapeAnim = '___FOOTER_SHAPE_ANIM___';
	let output = html.replace(
		/(<div class="footer-bottom-top-shape)\s+animation-infinite"/g,
		`$1 ${footerShapeAnim}"`,
	);

	output = output
		.replace(/\s*text-anime-style-[123]/gi, '')
		.replace(/\s*fadein(?:up|left|right|down)?(?:\s+wow|\b)/gi, ' ')
		.replace(/\s+wow(?:\s+fadein\w*|\b)/gi, ' ')
		.replace(/\s*logo-animation/g, '')
		.replace(/\s*animation-infinite/g, '')
		.replace(/\s*popup-video/g, '');

	return output.replace(footerShapeAnim, 'animation-infinite');
}

function removeHomeTeamSection(html) {
	return html.replace(
		/<!--==============================\s*\nTeam Area[\s\S]*?<section class="team-area-1[\s\S]*?<\/section>\s*/,
		'',
	);
}

function removeHomeWhyChooseSection(html) {
	return html.replace(
		/<!--==============================\s*\nWhy choose Area[\s\S]*?<div class="why-sec-1[\s\S]*?<\/div>\s*(?=<!--==============================\s*\nFeature Area)/,
		'',
	);
}

function removeHomePropertyValuesSection(html) {
	return html.replace(
		/<!--==============================\s*\nProperty Values Area[\s\S]*?<section class="property-values-sec-1[\s\S]*?<\/section>\s*(?=<!--==============================\s*\nGallery Area)/,
		'',
	);
}

function removeHomeLuxuryPropertiesSection(html) {
	const featureAreaComment = /<!--==============================\s*\nFeature Area[\s\S]*?==============================-->/g;
	const matches = [...html.matchAll(featureAreaComment)];
	if (matches.length < 2) return html;

	const secondCommentStart = matches[1].index;
	const galleryStart = html.search(/<!--==============================\s*\nGallery Area/);
	if (galleryStart === -1) return html;

	return html.slice(0, secondCommentStart) + html.slice(galleryStart);
}

function buildNeighborhoodGalleryCard({ name, slug }, imageIndex) {
	const imageNumber = (imageIndex % 6) + 1;

	return `                <div class="col-xl-3 col-lg-4 col-md-6">
                    <div class="gallery-card h-100">
                        <div class="gallery-img">
                            <img src="/assets/img/gallery/gallery-1-${imageNumber}.jpg" alt="${name}">
                            <div class="gallery-content">
                                <div class="gallery-content-wrapper">
                                    <p class="box-text">Florianópolis, SC</p>
                                    <h2 class="box-title"><a href="/bairro/${slug}">${name}</a></h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
}

function buildNeighborhoodGalleryGrid() {
	return neighborhoods
		.map((neighborhood, index) => buildNeighborhoodGalleryCard(neighborhood, index))
		.join('\n');
}

function replaceHomeNeighborhoodsGallery(html) {
	const cardsGrid = buildNeighborhoodGalleryGrid();

	return html.replace(
		/<div class="container-fluid p-0">\s*<div class="slider-area">[\s\S]*?<\/div>\s*<\/div>(\s*<\/div><!--==============================\s*\nCites Explore Area)/,
		`<div class="container pb-5">
            <div class="row gy-30 justify-content-center">
${cardsGrid}
            </div>
        </div>$1`,
	);
}

function removeHomeExploreCitiesSection(html) {
	return html.replace(
		/<!--==============================\s*\nCites Explore Area[\s\S]*?<section class="explore-cites-sec[\s\S]*?<\/section>\s*(?=<!--==============================\s*\nTestimonial Area)/,
		'',
	);
}

function removeHomeHeroVideo(html) {
	return removeElementByAttribute(html, /class="[^"]*hero-img-shape-1/);
}

function removeElementByAttribute(html, attributePattern) {
	const bounds = getElementBoundsByAttribute(html, attributePattern);
	if (!bounds) return html;
	return html.slice(0, bounds.start) + html.slice(bounds.end);
}

function flattenPropertyHeroSlider(html) {
	const bounds = getElementBoundsByAttribute(html, /id="panoramaSlide2"/);
	if (!bounds) return html;

	const firstSlideMatch = bounds.content.match(
		/<div class="swiper-wrapper">\s*<div class="swiper-slide">\s*([\s\S]*?)<\/div>\s*(?:<div class="swiper-slide">|<\/div>\s*<\/div>)/,
	);
	if (!firstSlideMatch) {
		return flattenSwiperWithId(html, 'panoramaSlide2', 'property-static-gallery mb-4');
	}

	return (
		html.slice(0, bounds.start) +
		`<div class="property-static-gallery mb-4">\n${firstSlideMatch[1].trim()}\n</div>` +
		html.slice(bounds.end)
	);
}

function stripPropertyDetailsPageEffects(html) {
	let output = stripPageEffects(html);
	output = removeAnimationAttributes(output);
	output = removeAnimationClasses(output);
	output = flattenPropertyHeroSlider(output);
	output = removeElementByAttribute(output, /class="[^"]*property-thumb-slider/);
	output = output.replace(/<button data-slider-(?:prev|next)="[^"]*"[\s\S]*?<\/button>\s*/g, '');
	output = output.replace(/\s*popup-image/g, '');
	return output;
}

function stripHomePageEffects(html) {
	let output = stripPageEffects(html);
	output = removeAnimationAttributes(output);
	output = removeAnimationClasses(output);
	output = flattenHeroSlider(output);
	output = removeHomeHeroVideo(output);

	for (const swiperId of ['gallerySlider1', 'panoramaSlide1', 'testiSlide1', 'blogSlider1']) {
		output = flattenSwiperWithId(output, swiperId);
	}

	output = output.replace(/<div class="icon-wrap add-explore-city-icon">[\s\S]*?<\/div>\s*/g, '');
	output = output.replace(/<button data-slider-(?:prev|next)="[^"]*"[\s\S]*?<\/button>\s*/g, '');
	output = output.replace(/<div class="slider-pagination[^"]*"[\s\S]*?<\/div>\s*/g, '');
	output = output.replace(/<div class="slider-pagination-wrapper">[\s\S]*?<\/div>\s*/g, '');
	output = output.replace(/<div class="slider-pagination2"><\/div>\s*/g, '');
	output = simplifyHomeSearchFilter(output);
	output = removeHomeTeamSection(output);
	output = removeHomeWhyChooseSection(output);
	output = removeHomePropertyValuesSection(output);
	output = removeHomeLuxuryPropertiesSection(output);
	output = replaceHomeNeighborhoodsGallery(output);
	output = removeHomeExploreCitiesSection(output);

	return output;
}

function extractGridListingItems(html) {
	const gridTab = html.match(/id="tab-grid"[\s\S]*?id="tab-list"/)?.[0] ?? '';
	const pattern =
		/<div class="col-xl-4 col-lg-6 col-md-6[^"]*">\s*<div class="popular-list-1 grid-style">[\s\S]*?<div class="property-bottom">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;

	return [...gridTab.matchAll(pattern)].map((match) => match[0]);
}

function extractListListingItems(html) {
	const listTab = html.match(/id="tab-list"[\s\S]*?class="sidebar-area"/)?.[0] ?? '';
	const pattern =
		/<div class="col-xl-12[^"]*">\s*<div class="popular-list-1 list-style">[\s\S]*?<div class="property-bottom">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;

	return [...listTab.matchAll(pattern)].map((match) => match[0]);
}

function buildStaticPaginationMarkup(currentPage, totalPages, basePath) {
	const pageHref = (page) => (page === 1 ? basePath : `${basePath}/pagina-${page}`);
	const prevHref = currentPage > 1 ? pageHref(currentPage - 1) : '#';
	const nextHref = currentPage < totalPages ? pageHref(currentPage + 1) : '#';
	const prevClass = currentPage === 1 ? ' class="disabled"' : '';
	const nextClass = currentPage === totalPages ? ' class="next-page disabled"' : ' class="next-page"';

	const pageLinks = Array.from({ length: totalPages }, (_, index) => {
		const page = index + 1;
		const activeClass = page === currentPage ? ' class="active"' : '';
		return `<li><a href="${pageHref(page)}"${activeClass}>${page}</a></li>`;
	}).join('\n                                ');

	return `<div class="th-pagination text-center pt-4">
                            <ul>
                                <li><a href="${prevHref}"${prevClass}><i class="far fa-arrow-left"></i></a></li>
                                ${pageLinks}
                                <li><a href="${nextHref}"${nextClass}>Próxima <i class="far fa-arrow-right"></i></a></li>
                            </ul>
                        </div>`;
}

function buildStaticListingPageHtml(html, gridItems, listItems, paginationMarkup) {
	let output = html.replace(
		/(id="tab-grid"[\s\S]*?<div class="row gy-40"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>\s*<div class="tab-pane fade active show" id="tab-list")/,
		`$1\n\n                        ${gridItems.join('\n\n                        ')}\n                        ${paginationMarkup}\n                    $2`,
	);

	output = output.replace(
		/(id="tab-list"[\s\S]*?<div class="row gy-30"[^>]*>)[\s\S]*?(<\/div>\s*<\/div>\s*<div class="col-xl-4 col-lg-6">\s*<aside class="sidebar-area")/,
		`$1\n                                ${listItems.join('\n                                ')}\n                                ${paginationMarkup}\n                            $2`,
	);

	return output;
}

function generateStaticListingPages({ html, page, bodyClass, perPage, baseSlug }) {
	const basePath = `/${baseSlug}`;
	const gridItems = extractGridListingItems(html);
	const listItems = extractListListingItems(html);
	const totalPages = Math.max(
		1,
		Math.ceil(gridItems.length / perPage),
		Math.ceil(listItems.length / perPage),
	);

	for (let currentPage = 1; currentPage <= totalPages; currentPage += 1) {
		const start = (currentPage - 1) * perPage;
		const pageGridItems = gridItems.slice(start, start + perPage);
		const pageListItems = listItems.slice(start, start + perPage);
		const paginationMarkup = buildStaticPaginationMarkup(currentPage, totalPages, basePath);
		const pageHtml = buildStaticListingPageHtml(html, pageGridItems, pageListItems, paginationMarkup);
		const pageSlug = currentPage === 1 ? baseSlug : `${baseSlug}/pagina-${currentPage}`;
		const contentRelative = `${pageSlug}.html`;
		const contentPath = join(contentDir, contentRelative);

		mkdirSync(dirname(contentPath), { recursive: true });
		writeFileSync(contentPath, pageHtml, 'utf8');

		writeAstroPage({
			slug: pageSlug,
			title: page.title,
			bodyClass,
			contentRelative,
			disableEffects: page.stripEffects ?? false,
		});

		console.log(`Generated ${pageSlug}.astro`);
	}
}

const propertyListingTranslations = [
	['You are using an <strong>outdated</strong> browser. Please <a href="https://browsehappy.com/">upgrade your browser</a> to improve your experience and security.', 'Você está usando um navegador <strong>desatualizado</strong>. <a href="https://browsehappy.com/">Atualize seu navegador</a> para melhorar sua experiência e segurança.'],
	['Shopping cart', 'Carrinho'],
	['View cart', 'Ver carrinho'],
	['Checkout', 'Finalizar compra'],
	['Subtotal:', 'Subtotal:'],
	['Recent Posts', 'Publicações recentes'],
	['The Ever-Evolving Land cape of', 'Mercado imobiliário em evolução'],
	['Newsletter', 'Newsletter'],
	['Enter Email', 'Digite seu e-mail'],
	['Subscribe Now', 'Inscrever-se'],
	['What are you looking for?', 'O que você procura?'],
	['Add Listing', 'Anunciar imóvel'],
	['<li><a href="/">Home</a></li>', '<li><a href="/">Início</a></li>'],
	['aria-label="Shop order"', 'aria-label="Ordenar imóveis"'],
	['Default Sorting', 'Ordenação padrão'],
	['Sort by popularity', 'Mais populares'],
	['Sort by average rating', 'Melhor avaliação'],
	['Sort by latest', 'Mais recentes'],
	['Sort by price: low to high', 'Menor preço'],
	['Sort by price: high to low', 'Maior preço'],
	['Add To Favorite', 'Favoritar'],
	['View all img', 'Ver fotos'],
	['For Sale', 'À venda'],
	['For Rent', 'Para alugar'],
	['View More ', 'Ver mais '],
	['View More', 'Ver mais'],
	['Bed ', 'Quartos '],
	['Bath ', 'Banheiros '],
	[' sqft', ' m²'],
	['Next ', 'Próxima '],
	['>search<', '>Buscar<'],
	['Enter Keyword', 'Digite a palavra-chave'],
	['Featured Listings', 'Imóveis em destaque'],
	['Contact Us', 'Fale conosco'],
	['Your Name', 'Seu nome'],
	['Your Email', 'Seu e-mail'],
	['Your Phone', 'Seu telefone'],
	['Your Message', 'Sua mensagem'],
	['Your message', 'Sua mensagem'],
	['Send Us', 'Enviar'],
	['We can help you to find real estate agency', 'Podemos ajudar você a encontrar o imóvel ideal'],
	['Contact with Agent', 'Falar com corretor'],
	['Pillar is a luxury to the resilience, adaptability, Spacious modern villa living room with centrally placed swimming pool blending indooroutdoor.', 'Imóveis na planta em Florianópolis e Santa Catarina. Encontre lançamentos, apartamentos e casas com as melhores condições.'],
	['West 2nd lane, Inner circular road, New York City', 'Florianópolis, SC'],
	['39581 Rohan Estates, New York', 'Florianópolis, SC'],
	['Featured Houses', 'Imóveis em destaque'],
	['Quick Links', 'Links rápidos'],
	['Strategy Services', 'Serviços'],
	['Management', 'Gestão'],
	['Privacy & Policy', 'Privacidade'],
	['Sitemap', 'Mapa do site'],
	['Term & Conditions', 'Termos e condições'],
	['Support', 'Suporte'],
	['Help Center', 'Central de ajuda'],
	['FAQs', 'Perguntas frequentes'],
	['Ticket Support', 'Abrir chamado'],
	['Live Chat', 'Chat ao vivo'],
	['Pillar Location', 'Localização'],
	['About Pillar', 'Viver Catarina'],
	['Need to Home buy or sell?', 'Quer comprar ou vender imóvel?'],
	['Download on the', 'Baixe na'],
	['GET IT ON', 'Disponível no'],
	['. All Rights Reserved.', '. Todos os direitos reservados.'],
	['Social Media:', 'Redes sociais:'],
	['Copyright <i class="fal fa-copyright"></i> 2025 <a href="/">Piller</a>', '2025-2026 - <a href="/">Viver Catarina</a> - Todos os direitos reservados'],
	['Charming Beach House', 'Casa charmosa na praia'],
	['Contemporary Loft', 'Loft contemporâneo'],
	['Cozy Cottage', 'Chalé aconchegante'],
	['Modern Beach House', 'Casa moderna na praia'],
	['Cozy Mountain Cabin', 'Cabana aconchegante'],
	['Modern Apartment', 'Apartamento moderno'],
	['Seaside Villa 5078', 'Villa à beira-mar'],
	['Ranch Style Home', 'Casa estilo rancho'],
	['Cometes contabesco audacia aeneus tui canonicus', 'Residencial em Florianópolis'],
	['10 Dec, 2025', '10 dez, 2025'],
	['alt="Image"', 'alt="Imagem"'],
	['alt="icon"', 'alt="ícone"'],
	['alt="img"', 'alt="imagem"'],
	['alt="Viver Catarina"', 'alt="Viver Catarina"'],
	['alt="Cart Image"', 'alt="Imagem do carrinho"'],
	['Bosco Apple Fruit', 'Item de exemplo'],
	['Green Cauliflower', 'Item de exemplo'],
	['Mandarin orange', 'Item de exemplo'],
	['Shallot Red onion', 'Item de exemplo'],
	['Sour Red Cherry', 'Item de exemplo'],
	['#Commercial', '#Comercial'],
	['#Farm Houses', '#Casas de campo'],
	['#Apartments', '#Apartamentos'],
	['App Store', 'App Store'],
	['Google Play', 'Google Play'],
];

function applyTranslations(html, translations) {
	let output = html;

	for (const [from, to] of translations) {
		output = output.replaceAll(from, to);
	}

	return output;
}

function getPropertyListingTitle(title) {
	return `${title} em Florianópolis`;
}

function localizePropertyListingPage(html) {
	return applyTranslations(html, propertyListingTranslations).replace(/\$(\d)/g, 'R$ $1');
}

function localizeHomePage(html) {
	return applyTranslations(applyTranslations(html, propertyListingTranslations), homePageTranslations).replace(
		/\$(\d)/g,
		'R$ $1',
	);
}

function localizePropertyDetailsPage(html) {
	return applyTranslations(
		applyTranslations(html, propertyListingTranslations),
		propertyDetailsTranslations,
	).replace(/\$(\d)/g, 'R$ $1');
}

function preparePropertyListingHtml(bodyHtml, title) {
	let html = stripPageEffects(bodyHtml);
	html = updateListingTitle(html, getPropertyListingTitle(title));
	html = localizePropertyListingPage(html);
	return html;
}

function publishPropertyListingPages({ slug, title, bodyClass, bodyHtml }) {
	let preparedHtml = preparePropertyListingHtml(bodyHtml, title);
	preparedHtml = prepareBairroSidebarHtml(preparedHtml, '');

	generateStaticListingPages({
		html: preparedHtml,
		page: { slug, title, stripEffects: true },
		bodyClass,
		perPage: PROPERTY_LISTING_PER_PAGE,
		baseSlug: slug,
	});
}

function writeAstroPage({ slug, title, bodyClass, contentRelative, disableEffects = false }) {
	const astroPath = join(pagesDir, `${slug}.astro`);
	mkdirSync(dirname(astroPath), { recursive: true });

	const depth = slug.split('/').length;
	const prefix = '../'.repeat(depth);

	const layoutProps = disableEffects
		? ' title={title} bodyClass={bodyClass} disableEffects'
		: ' title={title} bodyClass={bodyClass}';

	const astroContent = `---
import PillerLayout from '${prefix}layouts/PillerLayout.astro';
import bodyHtml from '${prefix}content/template-pages/${contentRelative}?raw';

const title = ${JSON.stringify(title)};
const bodyClass = ${JSON.stringify(bodyClass)};
---

<PillerLayout${layoutProps}>
	<Fragment set:html={bodyHtml} />
</PillerLayout>
`;

	writeFileSync(astroPath, astroContent, 'utf8');
}

function generateExtraPages() {
	for (const page of extraPages) {
		const templateHtml = readFileSync(join(sourceDir, page.template), 'utf8');
		const pagePath = `/${page.slug}`;
		const bodyClass = extractBodyClass(templateHtml);
		let bodyHtml = transformTemplateHtml(extractBodyInnerHtml(templateHtml), pagePath);
		bodyHtml = updateBreadcrumbTitle(bodyHtml, page.title);

		if (page.template === PROPERTY_LISTING_TEMPLATE) {
			if (page.slug.startsWith('bairro/')) {
				console.log(`Skipped ${page.slug} (dynamic Astro route uses src/data/bairros/*.json)`);
				continue;
			}

			publishPropertyListingPages({
				slug: page.slug,
				title: page.title,
				bodyClass,
				bodyHtml,
			});
			continue;
		}

		const contentRelative = `${page.slug}.html`;
		const contentPath = join(contentDir, contentRelative);
		mkdirSync(dirname(contentPath), { recursive: true });
		writeFileSync(contentPath, bodyHtml, 'utf8');

		writeAstroPage({
			slug: page.slug,
			title: page.title,
			bodyClass,
			contentRelative,
		});

		console.log(`Generated ${page.slug}.astro`);
	}
}

function buildFooterCitiesSection() {
	const regions = footerCitiesByRegion
		.map(({ region, cities }) => {
			const items = cities
				.map(
					(city) =>
						`<li><a href="${citySubdomainUrl(city)}" target="_blank" rel="noopener noreferrer">${city}</a></li>`,
				)
				.join('\n                                ');

			return `                        <div class="footer-cities-region">
                            <h4 class="footer-cities-region-title">${region}</h4>
                            <ul class="footer-cities-list">
                                ${items}
                            </ul>
                        </div>`;
		})
		.join('\n');

	return `        <div class="footer-cities-section">
            <div class="container">
                <div class="footer-cities-wrap">
                    <h3 class="widget_title">Cidades</h3>
                    <div class="footer-cities-regions">
${regions}
                    </div>
                </div>
            </div>
        </div>
`;
}

function addFooterCitiesSection(html) {
	const section = buildFooterCitiesSection();

	if (html.includes('footer-cities-section')) {
		return html.replace(
			/<div class="footer-cities-section">[\s\S]*?<\/div>\s*(?=\s*<div class="copyright-wrap">)/,
			section.trimEnd(),
		);
	}

	return html.replace('<div class="copyright-wrap">', `${section}        <div class="copyright-wrap">`);
}

function transformTemplateHtml(html, currentPath = '/') {
	return applySemanticHtml(
		applyCustomMenu(
			addFooterCitiesSection(
				updateFooterDescription(
					applyCustomFooterMenus(
						removeFooterLogoBelowDescription(
							removeTrustpilotReferences(
								removeFooterGallery(
									removeFooterBottomPromo(
										removeFooterLocationWidget(
											removeScrollTop(
												removeLanguageSelector(
													localizeLabels(
														removePreloader(
															removeExtraMenuItems(
																simplifyBlogMenu(simplifyHomeMenu(transformPaths(html))),
															),
														),
													),
												),
											),
										),
									),
								),
							),
						),
					),
				),
			),
			currentPath,
		),
	);
}

function extractTitle(html, fileName) {
	if (fileName === 'about.html') return 'Quem Somos';
	if (fileName === 'contact.html') return 'Contato';
	if (fileName === 'property-details.html') return 'Detalhes do imóvel';
	if (homeTitles[fileName]) return homeTitles[fileName];

	const match = html.match(/<title>(.*?)<\/title>/i);
	if (!match) return 'Viver Catarina';

	return match[1]
		.replace(/^Piller-html - Real Estate Home HTML Template -?\s*/i, '')
		.replace(/^Piller-html - Real Estate Home HTML Template$/i, 'Início')
		.trim();
}

function extractBodyClass(html) {
	const match = html.match(/<body[^>]*class="([^"]*)"/i);
	return match?.[1] ?? '';
}

function stripScriptsFromBody(body) {
	const scriptsMarker = body.indexOf('All Js File');
	if (scriptsMarker !== -1) {
		const cutPoint = body.lastIndexOf('<!--', scriptsMarker);
		if (cutPoint !== -1) {
			body = body.slice(0, cutPoint);
		}
	}

	return body.replace(/<script[\s\S]*?<\/script>\s*/gi, '').trim();
}

function extractBodyInnerHtml(html) {
	const bodyOpen = html.match(/<body[^>]*>/i);
	if (!bodyOpen) throw new Error('Body tag not found');

	const start = bodyOpen.index + bodyOpen[0].length;
	const end = html.lastIndexOf('</body>');
	if (end === -1) throw new Error('Closing body tag not found');

	return stripScriptsFromBody(html.slice(start, end));
}

function toAstroPageName(fileName) {
	if (fileName === 'index.html') return 'index.astro';
	if (fileName === 'error.html') return '404.astro';
	return fileName.replace(/\.html$/, '.astro');
}

mkdirSync(contentDir, { recursive: true });

for (const file of htmlFiles) {
	const html = readFileSync(join(sourceDir, file), 'utf8');
	const title = extractTitle(html, file);
	const bodyClass = extractBodyClass(html);
	const pagePath = getPagePathFromFile(file);
	let bodyHtml = transformTemplateHtml(extractBodyInnerHtml(html), pagePath);

	if (file === 'index.html') {
		bodyHtml = stripHomePageEffects(localizeHomePage(bodyHtml));
	}

	if (file === 'property-details.html') {
		bodyHtml = stripPropertyDetailsPageEffects(localizePropertyDetailsPage(bodyHtml));
		bodyHtml = updateBreadcrumbTitle(bodyHtml, 'Detalhes do imóvel');
		bodyHtml = prepareBairroSidebarHtml(bodyHtml, '');
	}

	if (file === PROPERTY_LISTING_TEMPLATE) {
		const listingTitle = 'Imóveis';
		bodyHtml = updateBreadcrumbTitle(bodyHtml, listingTitle);
		publishPropertyListingPages({
			slug: 'property',
			title: listingTitle,
			bodyClass,
			bodyHtml,
		});
		console.log(`Imported ${file} -> property listing pages`);
		continue;
	}

	const contentFileName = file.replace(/\.html$/, '.html');
	const contentPath = join(contentDir, contentFileName);

	writeFileSync(contentPath, bodyHtml, 'utf8');

	const astroFileName = toAstroPageName(file);
	writeAstroPage({
		slug: astroFileName.replace(/\.astro$/, ''),
		title,
		bodyClass,
		contentRelative: contentFileName,
		disableEffects: file === 'index.html' || file === 'property-details.html',
	});

	console.log(`Imported ${file} -> ${astroFileName}`);
}

generateExtraPages();

if (!existsSync(join(pagesDir, 'error.astro'))) {
	writeFileSync(
		join(pagesDir, 'error.astro'),
		`---
import PillerLayout from '../layouts/PillerLayout.astro';
import bodyHtml from '../content/template-pages/error.html?raw';

const title = 'Erro';
const bodyClass = '';
---

<PillerLayout title={title} bodyClass={bodyClass}>
	<Fragment set:html={bodyHtml} />
</PillerLayout>
`,
		'utf8',
	);
}

console.log(`\nImported ${htmlFiles.length} pages.`);
