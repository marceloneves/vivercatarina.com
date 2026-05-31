import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	getKindFromPageSlug,
	getKindLabel,
	getKindPageSlug,
	PROPERTY_KINDS,
} from './property-kind.mjs';
import {
	getCategoryFromPageSlug,
	getCategoryLabel,
	PROPERTY_CATEGORIES,
} from './property-category.mjs';
import { enrichProperty, paginate, sortPropertiesByPrice } from './property-listings.mjs';
import { patchCompactListingBreadcrumb } from './listing-breadcrumb.mjs';
import { filterFlorianopolisListings } from './property-data.mjs';
import { applySemanticHtml } from './semantic-html.mjs';
import { patchSiteMenu } from './site-menu.mjs';
import { buildLancamentosListingSeo } from './site-seo.mjs';
import { prepareBairroSidebarHtml } from './template-html.mjs';

const templateRoot = join(process.cwd(), 'src');
const shellTemplatePath = join(templateRoot, 'content/template-pages/lancamentos/apartamentos.html');
const LISTING_REGION = 'Florianópolis';

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
		throw new Error('Não foi possível separar o template de listagem de lançamentos.');
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

function customizeLancamentosListingShell(html, label) {
	const safeName = escapeHtml(label);
	const listingTitle = escapeHtml(`${label} em ${LISTING_REGION}`);

	return patchCompactListingBreadcrumb(html, {
		pageLabel: safeName,
		listingTitle,
		parent: { href: '/lancamentos', label: 'Lançamentos' },
	});
}

function buildListingShell(label, basePath, pageNumber, pageSlug) {
	const shell = getShellTemplate();
	const currentPath = pageNumber > 1 ? `${basePath}/pagina-${pageNumber}` : basePath;

	return {
		shellBefore: patchSiteMenu(
			customizeListingSortControl(customizeLancamentosListingShell(shell.before, label)),
			currentPath,
		),
		shellAfter: applySemanticHtml(shell.after),
		sidebarHtml: prepareBairroSidebarHtml(shell.sidebar, ''),
	};
}

export function loadLancamentosKindListing(kind) {
	const filePath = join(process.cwd(), 'src/data/lancamentos', `${kind}.json`);

	try {
		const listing = JSON.parse(readFileSync(filePath, 'utf8'));
		const properties = filterFlorianopolisListings(listing.properties || []);

		return {
			...listing,
			properties,
			total: properties.length,
		};
	} catch {
		return null;
	}
}

export function loadLancamentosCategoryListing(category) {
	if (!PROPERTY_CATEGORIES.includes(category)) {
		return null;
	}

	const properties = [];

	for (const kind of PROPERTY_KINDS) {
		const listing = loadLancamentosKindListing(kind);

		if (!listing?.properties?.length) {
			continue;
		}

		properties.push(
			...filterFlorianopolisListings(
				listing.properties.filter((property) => property.category === category),
			),
		);
	}

	return {
		category,
		name: getCategoryLabel(category),
		total: properties.length,
		properties,
	};
}

function buildListingPageContext({ listing, label, basePath, pageNumber, extra = {} }) {
	if (!listing) {
		return null;
	}

	const enriched = listing.properties.map(enrichProperty);
	const pagination = paginate(sortPropertiesByPrice(enriched, 'price'), pageNumber);
	const pageSlug = basePath.replace(/^\/lancamentos\/?/, '');
	const currentPath = pageNumber > 1 ? `${basePath}/pagina-${pageNumber}` : basePath;
	const shell = buildListingShell(label, basePath, pageNumber, pageSlug);

	return {
		listing,
		seo: buildLancamentosListingSeo(label, currentPath, pageNumber),
		allProperties: enriched,
		properties: pagination.items,
		currentPage: pagination.currentPage,
		totalPages: pagination.totalPages,
		totalItems: pagination.totalItems,
		basePath,
		...shell,
		...extra,
	};
}

export function buildLancamentosKindPageContext(pageSlug, pageNumber) {
	const kind = getKindFromPageSlug(pageSlug);

	if (!kind) {
		return null;
	}

	const listing = loadLancamentosKindListing(kind);

	return buildListingPageContext({
		listing,
		label: getKindLabel(kind),
		basePath: `/lancamentos/${getKindPageSlug(kind)}`,
		pageNumber,
		extra: { kind },
	});
}

export function buildLancamentosCategoryPageContext(pageSlug, pageNumber) {
	const category = getCategoryFromPageSlug(pageSlug);

	if (!category) {
		return null;
	}

	const listing = loadLancamentosCategoryListing(category);

	return buildListingPageContext({
		listing,
		label: getCategoryLabel(category),
		basePath: `/lancamentos/${category}`,
		pageNumber,
		extra: { category },
	});
}

export function buildLancamentosPageContext(pageSlug, pageNumber) {
	return (
		buildLancamentosKindPageContext(pageSlug, pageNumber) ||
		buildLancamentosCategoryPageContext(pageSlug, pageNumber)
	);
}

export function getLancamentosListingTotal(pageSlug) {
	const kind = getKindFromPageSlug(pageSlug);

	if (kind) {
		return loadLancamentosKindListing(kind)?.properties.length || 0;
	}

	const category = getCategoryFromPageSlug(pageSlug);

	if (category) {
		return loadLancamentosCategoryListing(category)?.total || 0;
	}

	return 0;
}

export { getCategoryFromPageSlug, getKindFromPageSlug, PROPERTY_CATEGORIES, PROPERTY_KINDS };
