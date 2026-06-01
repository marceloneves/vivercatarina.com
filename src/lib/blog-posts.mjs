import { buildMetaDescription } from './site-seo.mjs';

/** Card na home e listagens que apontam para o guia em /blog */
export const BLOG_POSTS = [
	{
		slug: 'termos-lancamentos-santa-catarina',
		title: 'Termos de lançamentos imobiliários em Santa Catarina',
		excerpt:
			'Guia com os principais termos do mercado de lançamentos em SC: Grande Florianópolis, Vale do Itajaí, incorporação, patrimônio de afetação, Imposto de Marinha e fases do empreendimento.',
		metaDescription:
			'Termos de lançamentos em Santa Catarina: guia do mercado catarinense com regiões, documentação, custos locais e fases do empreendimento na planta.',
		imageUrl: '/assets/img/blog/blog_1_1.jpg',
		dateLabel: '31 Mai',
		datePublished: '2026-05-31',
		author: 'Viver Catarina',
		category: 'Mercado',
		tags: ['Santa Catarina', 'Lançamentos', 'Termos', 'Imóveis na planta'],
		href: '/blog',
	},
];

export function getBlogPosts() {
	return BLOG_POSTS;
}

export function getBlogPost(slug) {
	return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getBlogPostMetaDescription(post) {
	if (!post) {
		return '';
	}

	if (post.metaDescription) {
		return buildMetaDescription('', post.metaDescription);
	}

	const keyword = getBlogPostSeoKeyword(post);

	return buildMetaDescription(keyword, post.excerpt);
}

function getBlogPostSeoKeyword(post) {
	const shortTitle = post.title.includes(':')
		? post.title.split(':')[0].trim()
		: post.title.trim();

	if (shortTitle.length <= 72) {
		return shortTitle;
	}

	return post.category ? `${post.category} Santa Catarina` : 'lançamentos imobiliários Santa Catarina';
}
