import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from './site-contact.mjs';
import { getCategoryLabel } from './property-category.mjs';
import { getKindLabel } from './property-kind.mjs';

export const SITE_AUTHOR = SITE_NAME;
export const SITE_PUBLISHER = SITE_NAME;

const BASE_KEYWORDS = [
	'imóveis na planta',
	'Florianópolis',
	'Santa Catarina',
	'lançamentos imobiliários',
	'apartamentos na planta',
	'Viver Catarina',
];

const DEMO_ROUTE_PREFIXES = [
	'/home-',
	'/shop',
	'/cart',
	'/checkout',
	'/wishlist',
	'/agency',
	'/team',
	'/service',
	'/property',
	'/blog-details',
	'/blog-grid-',
	'/typography',
	'/pricing',
	'/gallery',
	'/neighborhood-guide',
];

const DEMO_ROUTE_EXACT = ['/404', '/error'];

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

export function trimDescription(value, maxLength = 160) {
	const text = String(value || '')
		.replace(/\s+/g, ' ')
		.trim();

	if (text.length <= maxLength) {
		return text;
	}

	return `${text.slice(0, maxLength - 1).trimEnd()}…`;
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
	return DEMO_ROUTE_EXACT.includes(path) || DEMO_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix));
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
			description:
				'Compare lançamentos e imóveis na planta em Florianópolis. Apartamentos, casas e loteamentos com orientação de corretores credenciados no Viver Catarina.',
			keywords: buildKeywords('comprar imóvel na planta', 'empreendimentos Florianópolis'),
		};
	}

	if (path === '/about') {
		return {
			title: 'Quem Somos',
			description:
				'Conheça o Viver Catarina: portal especializado em imóveis na planta em Florianópolis, com curadoria de lançamentos e atendimento por corretores credenciados.',
			keywords: buildKeywords('quem somos', 'portal imobiliário Florianópolis'),
		};
	}

	if (path === '/contact') {
		return {
			title: 'Contato',
			description:
				'Fale com especialistas do Viver Catarina sobre imóveis na planta em Florianópolis. Tire dúvidas sobre lançamentos, financiamento e documentação.',
			keywords: buildKeywords('contato imobiliário', 'corretor Florianópolis'),
		};
	}

	if (path === '/blog') {
		return {
			title: 'Blog',
			description:
				'Artigos sobre mercado imobiliário, bairros e dicas para comprar imóvel na planta em Florianópolis e Santa Catarina.',
			keywords: buildKeywords('blog imobiliário', 'mercado imobiliário Florianópolis'),
		};
	}

	if (path.startsWith('/blog/')) {
		return {
			title: title || 'Blog',
			description:
				title
					? `${title}. Conteúdo do Viver Catarina sobre imóveis, bairros e mercado em Florianópolis.`
					: 'Artigo do blog Viver Catarina sobre imóveis na planta em Florianópolis.',
			keywords: buildKeywords(title, 'blog imobiliário Florianópolis'),
		};
	}

	if (path === '/glossario') {
		return {
			title: 'Glossário',
			description:
				'Glossário com termos essenciais para quem compra imóvel na planta em Florianópolis: contrato, financiamento, obra, habite-se, SPE e muito mais.',
			keywords: buildKeywords(
				'glossário imobiliário',
				'termos imóvel na planta',
				'financiamento imobiliário',
			),
		};
	}

	if (path === '/lancamentos' || path.startsWith('/lancamentos/')) {
		const { basePath, pageNumber } = parsePagination(path);

		if (basePath === '/lancamentos') {
			return {
				title: `Lançamentos${paginationSuffix(pageNumber)}`,
				description:
					'Veja lançamentos e imóveis na planta em Florianópolis. Compare apartamentos, casas, loteamentos e terrenos com preços e condições atualizados.',
				keywords: buildKeywords('lançamentos Florianópolis', 'imóveis na planta'),
			};
		}

		if (basePath === '/lancamentos/terrenos') {
			return {
				title: `Terrenos${paginationSuffix(pageNumber)}`,
				description:
					'Terrenos e oportunidades na planta em Florianópolis. Compare localização, metragem e condições de compra no Viver Catarina.',
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
				description:
					'Explore bairros de Florianópolis e encontre imóveis na planta por região. Compare lançamentos, preços e perfil de cada bairro.',
				keywords: buildKeywords('bairros Florianópolis', 'imóveis por bairro'),
			};
		}

		const filterMatch = basePath.match(/^\/bairros\/([^/]+)$/);
		const filterSlug = filterMatch?.[1];
		const filterLabel = BAIRROS_PRICE_FILTERS[filterSlug];

		if (filterLabel) {
			return {
				title: `${filterLabel}${paginationSuffix(pageNumber)}`,
				description: `Imóveis na planta em Florianópolis na faixa ${filterLabel.toLowerCase()}. Compare empreendimentos, metragens e condições de pagamento.`,
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
		return {
			title: title || 'Empreendimento',
			description:
				title
					? `${title} na planta em Florianópolis. Veja plantas, preços, condições de pagamento e fale com corretor credenciado.`
					: 'Empreendimento na planta em Florianópolis com informações de plantas, preços e disponibilidade.',
			keywords: buildKeywords(title, 'empreendimento na planta', 'apartamento Florianópolis'),
		};
	}

	if (path === '/404' || path === '/error') {
		return {
			title: path === '/404' ? 'Página não encontrada' : 'Erro',
			description: 'A página solicitada não foi encontrada no Viver Catarina.',
			keywords: buildKeywords(),
			noindex: true,
		};
	}

	if (isDemoPath(path)) {
		return {
			title: title || SITE_NAME,
			description: `${title || 'Página'} do portal Viver Catarina — imóveis na planta em Florianópolis, Santa Catarina.`,
			keywords: buildKeywords(title),
			noindex: true,
		};
	}

	return {
		title: title || SITE_NAME,
		description: title
			? `${title} — imóveis na planta em Florianópolis no portal Viver Catarina.`
			: SITE_DEFAULT_DESCRIPTION,
		keywords: buildKeywords(title),
	};
}

export function buildLancamentosListingSeo(label, pathname, pageNumber = 1) {
	const suffix = paginationSuffix(pageNumber);

	return {
		title: `${label}${suffix}`,
		description: `Confira ${label.toLowerCase()} na planta em Florianópolis. Compare preços, metragens, plantas e condições de pagamento no Viver Catarina.`,
		keywords: buildKeywords(label, 'lançamentos Florianópolis', 'comprar na planta'),
		canonicalPath: normalizePath(pathname),
	};
}

export function buildBairroListingSeo(neighborhoodName, pathname, pageNumber = 1) {
	const suffix = paginationSuffix(pageNumber);
	const listingTitle = `Imóveis na planta em ${neighborhoodName}`;

	return {
		title: `${listingTitle}${suffix}`,
		description: `Veja imóveis na planta em ${neighborhoodName}, Florianópolis. Apartamentos, casas e loteamentos com preços, plantas e condições de pagamento.`,
		keywords: buildKeywords(neighborhoodName, 'imóveis na planta', 'bairro Florianópolis'),
		canonicalPath: normalizePath(pathname),
	};
}

export function buildPropertySeo({ title, description, neighborhoodName, category, tags = [] }) {
	return {
		title,
		description: trimDescription(description),
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
	const resolvedDescription = description || inferred.description || SITE_DEFAULT_DESCRIPTION;
	const resolvedKeywords = keywords || inferred.keywords || buildKeywords();
	const resolvedNoindex = noindex ?? inferred.noindex ?? false;
	const documentTitle = buildSitePageTitle(resolvedTitle);
	const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;

	return {
		title: documentTitle,
		description: trimDescription(resolvedDescription),
		keywords: resolvedKeywords,
		author: SITE_AUTHOR,
		publisher: SITE_PUBLISHER,
		canonicalUrl,
		ogTitle: documentTitle,
		ogDescription: trimDescription(resolvedDescription),
		ogImage: absoluteUrl(ogImage),
		ogType,
		ogUrl: canonicalUrl,
		twitterCard: 'summary_large_image',
		robots: resolvedNoindex ? 'NOINDEX,NOFOLLOW' : 'INDEX,FOLLOW',
	};
}
