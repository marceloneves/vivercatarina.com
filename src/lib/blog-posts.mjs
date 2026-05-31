export const BLOG_POSTS = [
	{
		slug: 'melhores-bairros-para-morar-em-florianopolis',
		title: 'Os 10 melhores bairros para morar em Florianópolis',
		excerpt:
			'Conheça os bairros mais procurados da capital catarinense para quem busca qualidade de vida, infraestrutura e bons lançamentos.',
		imageUrl: '/assets/img/blog/blog_1_1.jpg',
		dateLabel: '22 Fev',
		datePublished: '2025-02-22',
		author: 'Viver Catarina',
		category: 'Bairros',
		href: '/blog/melhores-bairros-para-morar-em-florianopolis',
	},
];

export function getBlogPosts() {
	return BLOG_POSTS;
}

export function getBlogPost(slug) {
	return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}
