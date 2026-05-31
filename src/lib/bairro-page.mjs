import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { enrichProperty, loadNeighborhoodListing, paginate, sortPropertiesByPrice } from './property-listings.mjs';
import { applySemanticHtml } from './semantic-html.mjs';
import { patchSiteMenu } from './site-menu.mjs';
import { buildBairroListingSeo } from './site-seo.mjs';
import { prepareBairroSidebarHtml } from './template-html.mjs';

const templateRoot = join(process.cwd(), 'src');
const shellTemplatePath = join(templateRoot, 'content/template-pages/bairro/centro.html');

let shellCache;

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function getShellTemplate() {
	if (shellCache) {
		return shellCache;
	}

	const template = readFileSync(shellTemplatePath, 'utf8');
	const tabContentStart = template.indexOf('<div class="tab-content" id="nav-tabContent">');
	const sectionEnd = template.indexOf('        </div>\n    </section>', tabContentStart);

	if (tabContentStart === -1 || sectionEnd === -1) {
		throw new Error('Não foi possível separar o template de listagem de bairro.');
	}

	shellCache = {
		before: template.slice(0, tabContentStart),
		after: template.slice(sectionEnd),
		sidebar: template.match(/<aside class="sidebar-area">[\s\S]*?<\/aside>/)?.[0] ?? '',
	};

	return shellCache;
}

function customizeListingSortControl(html) {
	return html.replace(
		/<select name="orderby" class="orderby"[\s\S]*?<\/select>/,
		`<select name="orderby" class="orderby" id="property-orderby" aria-label="Ordenar imóveis">
                                    <option value="price" selected="selected">Menor preço</option>
                                    <option value="price-desc">Maior preço</option>
                                </select>`,
	);
}

function stripBreadcrumbHero(html) {
	return html.replace(
		/<div class="breadcumb-wrapper[^"]*"\s*data-bg-src="[^"]*">/,
		'<div class="breadcumb-wrapper single-inventory">',
	);
}

export function getBairroListingTitle(neighborhoodName) {
	return `Imóveis na planta em ${neighborhoodName}`;
}

export function buildBairroPageContext(slug, pageNumber) {
	const listing = loadNeighborhoodListing(slug);

	if (!listing) {
		return null;
	}

	const enriched = listing.properties.map(enrichProperty);
	const pagination = paginate(sortPropertiesByPrice(enriched, 'price'), pageNumber);
	const shell = getShellTemplate();
	const safeName = escapeHtml(listing.name);
	const listingTitle = escapeHtml(getBairroListingTitle(listing.name));
	const sidebarHtml = prepareBairroSidebarHtml(shell.sidebar, '');
	const currentPath =
		pageNumber > 1 ? `/bairro/${slug}/pagina-${pageNumber}` : `/bairro/${slug}`;
	const before = patchSiteMenu(
		customizeListingSortControl(
			stripBreadcrumbHero(
				shell.before
					.replace(/<h1 class="breadcumb-title">[^<]*<\/h1>/, `<h1 class="breadcumb-title">${safeName}</h1>`)
					.replace(
						/(<ul class="breadcumb-menu">[\s\S]*?<li>)[^<]*(<\/li>)/,
						`$1${safeName}$2`,
					)
					.replace(
						/<h4 class="box-title text-start ">[^<]*<\/h4>/,
						`<h4 class="box-title text-start ">${listingTitle}</h4>`,
					),
			),
		),
		currentPath,
	);

	return {
		listing,
		listingTitle: getBairroListingTitle(listing.name),
		seo: buildBairroListingSeo(listing.name, currentPath, pageNumber),
		allProperties: enriched,
		properties: pagination.items,
		currentPage: pagination.currentPage,
		totalPages: pagination.totalPages,
		totalItems: pagination.totalItems,
		basePath: `/bairro/${slug}`,
		shellBefore: before,
		shellAfter: applySemanticHtml(shell.after),
		sidebarHtml,
	};
}
