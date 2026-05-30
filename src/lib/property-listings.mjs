import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCategoryLabel as getPropertyCategoryLabel } from './property-category.mjs';
import { filterFlorianopolisListings } from './property-data.mjs';
import { cleanPropertyTitle } from './property-slug.mjs';

const dataRoot = join(process.cwd(), 'src/data');

export const LISTINGS_PER_PAGE = 10;

export function formatPrice(amount) {
	if (!amount) {
		return 'Consulte';
	}

	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(amount);
}

export function getCategoryLabel(category) {
	return getPropertyCategoryLabel(category);
}

export function getPropertyUrl(slug) {
	return `/imovel/${slug}`;
}

export function getThumbnailUrl(thumbnail) {
	if (!thumbnail) {
		return '/assets/img/popular/popular-1-1.jpg';
	}

	return `/data/${thumbnail}`;
}

export function loadNeighborhoodListing(slug) {
	const filePath = join(dataRoot, 'bairros', `${slug}.json`);

	if (!existsSync(filePath)) {
		return null;
	}

	const listing = JSON.parse(readFileSync(filePath, 'utf8'));
	const properties = filterFlorianopolisListings(listing.properties || []);

	return {
		...listing,
		properties,
		total: properties.length,
	};
}

export function listActiveNeighborhoods() {
	const index = JSON.parse(readFileSync(join(dataRoot, 'bairros/index.json'), 'utf8'));

	return index.neighborhoods
		.filter(({ total }) => total > 0)
		.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function enrichProperty(entry) {
	const propertyPath = join(dataRoot, entry.dataPath);
	let overview = {};
	let property = null;

	if (existsSync(propertyPath)) {
		property = JSON.parse(readFileSync(propertyPath, 'utf8'));
		overview = property.overview || {};
	}

	return {
		...entry,
		title: cleanPropertyTitle(entry.title, property),
		bedrooms: overview.bedrooms ?? null,
		bathrooms: overview.bathrooms ?? null,
		sizeSqm: overview.sizeSqm ?? null,
		priceLabel: formatPrice(entry.price),
		categoryLabel: getCategoryLabel(entry.category),
		detailUrl: getPropertyUrl(entry.slug),
		imageUrl: getThumbnailUrl(entry.thumbnail),
		locationLabel: 'Florianópolis, SC',
	};
}

function buildFeaturedFeatureItem(icon, label) {
	return `<div class="property-features-item">
                                                        <div class="thumb">
                                                            <img src="${icon}" alt="ícone">
                                                        </div>
                                                        <h5 class="feature-title">${label}</h5>
                                                    </div>`;
}

function buildFeaturedSidebarItem(property) {
	const title = escapeHtml(property.title);
	const detailUrl = escapeHtml(property.detailUrl);
	const imageUrl = escapeHtml(property.imageUrl);
	const priceLabel = escapeHtml(property.priceLabel);
	const features = [];

	if (property.bedrooms != null) {
		features.push(buildFeaturedFeatureItem('/assets/img/icon/bed.svg', `Quartos ${property.bedrooms}`));
	}

	if (property.bathrooms != null) {
		features.push(buildFeaturedFeatureItem('/assets/img/icon/bath.svg', `Banheiros ${property.bathrooms}`));
	}

	if (property.sizeSqm != null) {
		features.push(
			buildFeaturedFeatureItem('/assets/img/icon/sqft.svg', `${property.sizeSqm} m²`),
		);
	}

	const featuresMarkup = features
		.map((feature, index) => {
			if (index === 0) {
				return feature;
			}

			return `<div class="divider"></div>
                                                    ${feature}`;
		})
		.join('\n                                                    ');

	return `<div class="recent-post">
                                            <div class="media-img">
                                                <a href="${detailUrl}"><img src="${imageUrl}" alt="${title}"></a>
                                            </div>
                                            <div class="media-body">
                                                <h4 class="post-title"><a class="text-inherit" href="${detailUrl}">${title}</a></h4>
                                                ${
													featuresMarkup
														? `<div class="property-features-wrap">
                                                    ${featuresMarkup}
                                                </div>`
														: ''
												}
                                                <div class="recent-post-meta">
                                                    <a href="${detailUrl}">${priceLabel}</a>
                                                </div>
                                            </div>
                                        </div>`;
}

export function buildFeaturedSidebarMarkup(properties, maxItems = 4) {
	const items = properties.slice(0, maxItems);

	if (!items.length) {
		return '';
	}

	return `<div class="widget  ">
                                    <h3 class="widget_title">Imóveis em destaque</h3>
                                    <div class="recent-post-wrap featured-listing">
                                        ${items.map(buildFeaturedSidebarItem).join('\n                                        ')}
                                    </div>
                                </div>`;
}

export function sortPropertiesByPrice(properties, orderBy = 'price') {
	return [...properties].sort((a, b) => {
		const priceA = a.price > 0 ? a.price : null;
		const priceB = b.price > 0 ? b.price : null;

		if (priceA == null && priceB == null) {
			return a.title.localeCompare(b.title, 'pt-BR');
		}

		if (priceA == null) {
			return 1;
		}

		if (priceB == null) {
			return -1;
		}

		if (orderBy === 'price-desc') {
			return priceB - priceA || a.title.localeCompare(b.title, 'pt-BR');
		}

		return priceA - priceB || a.title.localeCompare(b.title, 'pt-BR');
	});
}

export function paginate(items, page, perPage = LISTINGS_PER_PAGE) {
	const totalPages = Math.max(1, Math.ceil(items.length / perPage));
	const currentPage = Math.min(Math.max(page, 1), totalPages);
	const start = (currentPage - 1) * perPage;

	return {
		items: items.slice(start, start + perPage),
		currentPage,
		totalPages,
		totalItems: items.length,
		perPage,
	};
}

export function buildPaginationMarkup(currentPage, totalPages, basePath) {
	if (totalPages <= 1) {
		return '';
	}

	const pageHref = (page) => (page === 1 ? basePath : `${basePath}/pagina-${page}`);
	const prevHref = currentPage > 1 ? pageHref(currentPage - 1) : '#';
	const nextHref = currentPage < totalPages ? pageHref(currentPage + 1) : '#';
	const prevClass = currentPage === 1 ? ' class="disabled"' : '';
	const nextClass =
		currentPage === totalPages ? ' class="next-page disabled"' : ' class="next-page"';

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
