export const BLOG_POSTS = [
	{
		slug: 'melhores-bairros-para-morar-em-florianopolis',
		title: 'Os 10 Melhores Bairros Para Viver em Florianópolis em 2026',
		excerpt:
			'Os melhores bairros para viver em Florianópolis em 2026 são Lagoa da Conceição, Jurerê Internacional, Trindade, Itacorubi, Campeche, Coqueiros, Centro, Córrego Grande, Santo Antônio de Lisboa e Ingleses.',
		imageUrl: '/assets/img/blog/blog_1_1.jpg',
		dateLabel: '30 Mai',
		datePublished: '2026-05-30',
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
