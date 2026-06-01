import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from './site-contact.mjs';
import { getCategoryLabel } from './property-category.mjs';
import { getKindLabel } from './property-kind.mjs';

export const SITE_AUTHOR = SITE_NAME;
export const SITE_PUBLISHER = SITE_NAME;
export const META_DESCRIPTION_MAX = 160;
export const META_DESCRIPTION_TARGET = 150;

const BASE_KEYWORDS = [
	'imóveis na planta',
	'Florianópolis',
	'Santa Catarina',
	'lançamentos imobiliários',
	'apartamentos na planta',
	'Viver Catarina',
];

const NOINDEX_ROUTE_PREFIXES = ['/property'];

const NOINDEX_ROUTE_EXACT = ['/blog-details'];

const BAIRROS_PRICE_FILTERS = {
	'ate-300-mil': 'Até R$ 300 mil',
	'300-a-500-mil': 'R$ 300 a 500 mil',
	'500-mil-a-1-milhao': 'R$ 500 mil a R$ 1 milhão',
	'acima-de-1-milhao': 'Acima de R$ 1 milhão',
};

const NEIGHBORHOOD_NAMES = JSON.parse(
	readFileSync(join(process.cwd(), 'src/data/florianopolis-neighborhoods.json'), 'utf8'),
).reduce((map, { name, slug }) => {
	map[slug] = name;
	return map;
}, {});

export function buildSitePageTitle(title) {
	if (!title || title === 'Início' || title === SITE_NAME) {
		return SITE_NAME;
	}

	if (title.includes(`| ${SITE_NAME}`)) {
		return title;
	}

	return `${title} | ${SITE_NAME}`;
}

export function trimDescription(value, maxLength = META_DESCRIPTION_MAX) {
	const text = String(value || '')
		.replace(/\s+/g, ' ')
		.trim();

	if (text.length <= maxLength) {
		return text;
	}

	return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

function trimToLength(value, maxLength) {
	const text = String(value || '')
		.replace(/\s+/g, ' ')
		.trim();

	if (text.length <= maxLength) {
		return text;
	}

	const slice = text.slice(0, maxLength);
	const lastSpace = slice.lastIndexOf(' ');
	let result =
		lastSpace > maxLength * 0.55
			? slice
					.slice(0, lastSpace)
					.replace(/[,;:]$/, '')
					.trimEnd()
			: slice.trimEnd();

	const badEnding =
		/(?:^|\s)(e|de|o|a|em|no|na|com|para|ou|do|da|dos|das|que|um|uma|se|até|por)$/i;

	while (badEnding.test(result) && result.includes(' ')) {
		result = result.slice(0, result.lastIndexOf(' ')).replace(/[,;:]$/, '').trimEnd();
	}

	return result;
}

/** @param {string} keyword @param {string} body */
export function buildMetaDescription(keyword, body) {
	const normalizedKeyword = String(keyword || '').trim();
	let description = String(body || '')
		.replace(/\s+/g, ' ')
		.trim();

	const needsKeyword =
		normalizedKeyword &&
		!description.toLowerCase().includes(normalizedKeyword.toLowerCase());
	const keywordPrefix = needsKeyword ? `${normalizedKeyword}. ` : '';
	const maxBodyLength = META_DESCRIPTION_TARGET - keywordPrefix.length - 1;

	description = trimToLength(description, maxBodyLength);
	description = `${keywordPrefix}${description}`.replace(/\s+/g, ' ').trim();

	if (description && !description.endsWith('.')) {
		description = `${description}.`;
	}

	return trimToLength(description, META_DESCRIPTION_MAX);
}

function withPagination(description, pageNumber) {
	if (pageNumber <= 1) {
		return description;
	}

	return trimDescription(`${description.replace(/\.$/, '')} — Página ${pageNumber}.`);
}

export function buildKeywords(...parts) {
	const values = parts
		.flatMap((part) => {
			if (!part) {
				return [];
			}

			if (Array.isArray(part)) {
				return part;
			}

			return String(part)
				.split(',')
				.map((item) => item.trim());
		})
		.filter(Boolean);

	return [...new Set([...values, ...BASE_KEYWORDS])].join(', ');
}

function normalizePath(pathname) {
	const path = String(pathname || '/').split('?')[0].split('#')[0];

	if (!path || path === '/') {
		return '/';
	}

	return path.replace(/\/+$/, '') || '/';
}

function absoluteUrl(value) {
	if (!value) {
		return `${SITE_URL}/assets/img/logo.svg`;
	}

	if (/^https?:\/\//i.test(value)) {
		return value;
	}

	return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

function isDemoPath(path) {
	return NOINDEX_ROUTE_EXACT.includes(path) || NOINDEX_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function parsePagination(path) {
	const match = path.match(/\/pagina-(\d+)$/);

	if (!match) {
		return { basePath: path, pageNumber: 1 };
	}

	return {
		basePath: path.slice(0, -match[0].length) || '/',
		pageNumber: Number.parseInt(match[1], 10) || 1,
	};
}

function paginationSuffix(pageNumber) {
	return pageNumber > 1 ? ` — Página ${pageNumber}` : '';
}

function inferSeoFromPath(path, title = '') {
	if (path === '/') {
		return {
			title: 'Início',
			description: buildMetaDescription(
				'imóveis na planta em Florianópolis',
				'Compare lançamentos e apartamentos na planta. Veja preços, plantas, condições de pagamento e fale com corretores credenciados',
			),
			keywords: buildKeywords('comprar imóvel na planta', 'empreendimentos Florianópolis'),
		};
	}

	if (path === '/about') {
		return {
			title: 'Quem Somos',
			description: buildMetaDescription(
				'Viver Catarina',
				'Portal especializado em imóveis na planta em Florianópolis, com curadoria de lançamentos e atendimento por corretores credenciados',
			),
			keywords: buildKeywords('quem somos', 'portal imobiliário Florianópolis'),
		};
	}

	if (path === '/contact') {
		return {
			title: 'Contato',
			description: buildMetaDescription(
				'contato imobiliário Florianópolis',
				'Fale com especialistas sobre lançamentos na planta. Tire dúvidas sobre financiamento, documentação e receba atendimento personalizado',
			),
			keywords: buildKeywords('contato imobiliário', 'corretor Florianópolis'),
		};
	}

	if (path === '/blog') {
		return {
			title: 'Termos de lançamentos em Santa Catarina',
			description: buildMetaDescription(
				'lançamentos imobiliários Santa Catarina',
				'Guia com os principais termos de lançamentos em SC: regiões, incorporação, patrimônio de afetação, litoral, Vale do Itajaí e particularidades do mercado catarinense',
			),
			keywords: buildKeywords(
				'lançamentos Santa Catarina',
				'termos imobiliários SC',
				'imóveis na planta',
			),
		};
	}

	if (path.startsWith('/blog/')) {
		const keyword = title || 'imóveis na planta em Florianópolis';

		return {
			title: title || 'Blog',
			description: buildMetaDescription(
				keyword,
				title
					? `${title}. Conteúdo do Viver Catarina sobre bairros, mercado imobiliário e dicas para comprar na planta em Florianópolis`
					: 'Artigo do blog Viver Catarina sobre imóveis na planta, bairros e mercado imobiliário em Florianópolis',
			),
			keywords: buildKeywords(title, 'blog imobiliário Florianópolis'),
		};
	}

	if (path === '/lancamentos' || path.startsWith('/lancamentos/')) {
		const { basePath, pageNumber } = parsePagination(path);

		if (basePath === '/lancamentos') {
			return {
				title: `Lançamentos${paginationSuffix(pageNumber)}`,
				description: withPagination(
					buildMetaDescription(
						'lançamentos imobiliários Florianópolis',
						'Compare apartamentos, casas, loteamentos e terrenos na planta. Veja preços, metragens e condições atualizadas no Viver Catarina',
					),
					pageNumber,
				),
				keywords: buildKeywords('lançamentos Florianópolis', 'imóveis na planta'),
			};
		}

		if (basePath === '/lancamentos/terrenos') {
			return {
				title: `Terrenos${paginationSuffix(pageNumber)}`,
				description: withPagination(
					buildMetaDescription(
						'terrenos Florianópolis',
						'Encontre terrenos e lotes na planta em Florianópolis. Compare localização, metragem, preços e condições de compra no Viver Catarina',
					),
					pageNumber,
				),
				keywords: buildKeywords('terrenos Florianópolis', 'lotes na planta'),
			};
		}

		const kindMatch = basePath.match(/^\/lancamentos\/([^/]+)$/);
		const slug = kindMatch?.[1];

		if (slug === 'apartamentos') {
			return buildLancamentosListingSeo(getKindLabel('apartamento'), path, pageNumber);
		}

		if (slug === 'casas-em-condominio') {
			return buildLancamentosListingSeo(getKindLabel('casa'), path, pageNumber);
		}

		if (slug === 'loteamento') {
			return buildLancamentosListingSeo(getKindLabel('loteamento'), path, pageNumber);
		}

		if (slug && ['pre-lancamento', 'lancamento', 'pronto-para-morar'].includes(slug)) {
			return buildLancamentosListingSeo(getCategoryLabel(slug), path, pageNumber);
		}
	}

	if (path === '/bairros' || path.startsWith('/bairros/')) {
		const { basePath, pageNumber } = parsePagination(path);

		if (basePath === '/bairros') {
			return {
				title: `Bairros${paginationSuffix(pageNumber)}`,
				description: withPagination(
					buildMetaDescription(
						'bairros Florianópolis',
						'Explore bairros e encontre imóveis na planta por região. Compare lançamentos, preços, perfil de cada bairro e oportunidades de investimento',
					),
					pageNumber,
				),
				keywords: buildKeywords('bairros Florianópolis', 'imóveis por bairro'),
			};
		}

		const filterMatch = basePath.match(/^\/bairros\/([^/]+)$/);
		const filterSlug = filterMatch?.[1];
		const filterLabel = BAIRROS_PRICE_FILTERS[filterSlug];

		if (filterLabel) {
			return {
				title: `${filterLabel}${paginationSuffix(pageNumber)}`,
				description: withPagination(
					buildMetaDescription(
						`imóveis na planta ${filterLabel.toLowerCase()}`,
						`Compare empreendimentos na faixa ${filterLabel.toLowerCase()}. Veja metragens, plantas e condições de pagamento em Florianópolis`,
					),
					pageNumber,
				),
				keywords: buildKeywords(filterLabel, 'imóveis na planta Florianópolis', 'preço imóvel'),
			};
		}
	}

	if (path.startsWith('/bairro/')) {
		const match = path.match(/^\/bairro\/([^/]+)/);
		const slug = match?.[1];
		const neighborhoodName = slug ? NEIGHBORHOOD_NAMES[slug] : null;

		if (neighborhoodName) {
			return buildBairroListingSeo(neighborhoodName, path);
		}
	}

	if (path.startsWith('/imovel/')) {
		const keyword = title ? `${title} Florianópolis` : 'imóveis na planta em Florianópolis';

		return {
			title: title || 'Empreendimento',
			description: buildMetaDescription(
				keyword,
				title
					? `${title} na planta em Florianópolis. Veja plantas, preços, fotos, condições de pagamento e fale com corretor credenciado no Viver Catarina`
					: 'Empreendimento na planta em Florianópolis com plantas, preços, condições de pagamento e atendimento de corretores credenciados no Viver Catarina',
			),
			keywords: buildKeywords(title, 'empreendimento na planta', 'apartamento Florianópolis'),
		};
	}

	if (path === '/404' || path === '/error') {
		return {
			title: path === '/404' ? 'Página não encontrada' : 'Erro',
			description: buildMetaDescription(
				'Viver Catarina',
				'A página solicitada não foi encontrada no portal Viver Catarina. Volte ao início e continue buscando imóveis na planta em Florianópolis',
			),
			keywords: buildKeywords(),
			noindex: true,
		};
	}

	if (isDemoPath(path)) {
		const pageTitle = title || 'Página';

		return {
			title: pageTitle,
			description: buildMetaDescription(
				pageTitle,
				`${pageTitle} do portal Viver Catarina. Explore imóveis na planta, lançamentos e apartamentos em Florianópolis com curadoria e atendimento especializado`,
			),
			keywords: buildKeywords(title),
			noindex: true,
		};
	}

	return {
		title: title || SITE_NAME,
		description: buildMetaDescription(
			title || 'imóveis na planta em Florianópolis',
			title
				? `${title} no portal Viver Catarina. Compare lançamentos, plantas, preços e condições para comprar imóvel na planta em Florianópolis`
				: SITE_DEFAULT_DESCRIPTION,
		),
		keywords: buildKeywords(title),
	};
}

export function buildLancamentosListingSeo(label, pathname, pageNumber = 1) {
	const suffix = paginationSuffix(pageNumber);
	const keyword = `${label.toLowerCase()} na planta Florianópolis`;

	return {
		title: `${label}${suffix}`,
		description: withPagination(
			buildMetaDescription(
				keyword,
				`Confira opções na planta. Compare preços, metragens, plantas, localização e condições de pagamento no Viver Catarina`,
			),
			pageNumber,
		),
		keywords: buildKeywords(label, 'lançamentos Florianópolis', 'comprar na planta'),
		canonicalPath: normalizePath(pathname),
	};
}

export function buildBairroListingSeo(neighborhoodName, pathname, pageNumber = 1, options = {}) {
	const suffix = paginationSuffix(pageNumber);
	const listingTitle = `Imóveis na planta em ${neighborhoodName}`;
	const keyword = `imóveis na planta em ${neighborhoodName}`;
	const description = withPagination(
		options.description
			? buildMetaDescription(keyword, options.description)
			: buildMetaDescription(
					keyword,
					`Compare apartamentos, casas, preços, plantas, metragens e condições de pagamento de lançamentos no Viver Catarina`,
				),
		pageNumber,
	);

	return {
		title: `${listingTitle}${suffix}`,
		description,
		keywords: buildKeywords(neighborhoodName, 'imóveis na planta', 'bairro Florianópolis'),
		canonicalPath: normalizePath(pathname),
	};
}

export function buildPropertySeo({ title, description, neighborhoodName, category, tags = [] }) {
	const keyword = neighborhoodName
		? `imóveis na planta em ${neighborhoodName}`
		: 'imóveis na planta em Florianópolis';

	return {
		title,
		description: buildMetaDescription(keyword, description),
		keywords: buildKeywords(
			title,
			neighborhoodName,
			getCategoryLabel(category),
			'empreendimento na planta',
			tags,
		),
	};
}

export function resolvePageSeo(options = {}) {
	const {
		title,
		description,
		keywords,
		pathname = '/',
		ogImage,
		ogType = 'website',
		canonicalPath,
		noindex,
	} = options;

	const path = normalizePath(canonicalPath || pathname);
	const inferred = inferSeoFromPath(path, title);
	const resolvedTitle = title || inferred.title;
	const resolvedDescription =
		description || inferred.description || buildMetaDescription('imóveis na planta em Florianópolis', SITE_DEFAULT_DESCRIPTION);
	const resolvedKeywords = keywords || inferred.keywords || buildKeywords();
	const resolvedNoindex = noindex ?? inferred.noindex ?? false;
	const documentTitle = buildSitePageTitle(resolvedTitle);
	const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;

	return {
		title: documentTitle,
		description: trimToLength(resolvedDescription, META_DESCRIPTION_MAX),
		keywords: resolvedKeywords,
		author: SITE_AUTHOR,
		publisher: SITE_PUBLISHER,
		canonicalUrl,
		ogTitle: documentTitle,
		ogDescription: trimToLength(resolvedDescription, META_DESCRIPTION_MAX),
		ogImage: absoluteUrl(ogImage),
		ogType,
		ogUrl: canonicalUrl,
		twitterCard: 'summary_large_image',
		robots: resolvedNoindex ? 'NOINDEX,NOFOLLOW' : 'INDEX,FOLLOW',
	};
}
