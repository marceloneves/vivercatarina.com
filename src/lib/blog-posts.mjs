export const BLOG_POSTS = [
	{
		slug: 'campeche-em-expansao-valorizacao',
		title:
			'Campeche em Expansão: Até Onde Vai a Valorização do Bairro Mais Promissor do Sul da Ilha',
		excerpt:
			'O Campeche é o bairro de maior potencial de valorização de Florianópolis em 2026, com m² entre R$ 11.500 e R$ 18.751 e projeção de alta de 5% a 8%. Veja números, motores e limites do crescimento.',
		imageUrl: '/assets/img/blog/blog_1_4.jpg',
		dateLabel: '30 Mai',
		datePublished: '2026-05-30',
		author: 'Viver Catarina',
		category: 'Bairros',
		tags: ['Florianópolis', 'Campeche', 'Bairros', 'Mercado imobiliário'],
		href: '/blog/campeche-em-expansao-valorizacao',
	},
	{
		slug: 'morar-no-continente-x-na-ilha-em-florianopolis',
		title:
			'Morar no Continente x na Ilha em Florianópolis: Comparativo de Custo, Trânsito e Qualidade de Vida',
		excerpt:
			'Morar na ilha custa de 30% a 40% mais caro que no continente, mas reduz o trânsito para quem trabalha do lado insular. Compare custo, mobilidade e qualidade de vida para escolher o lado certo das pontes.',
		imageUrl: '/assets/img/blog/blog_1_3.jpg',
		dateLabel: '30 Mai',
		datePublished: '2026-05-30',
		author: 'Viver Catarina',
		category: 'Moradia',
		tags: ['Florianópolis', 'Ilha', 'Continente', 'Moradia'],
		href: '/blog/morar-no-continente-x-na-ilha-em-florianopolis',
	},
	{
		slug: 'quanto-custa-morar-em-florianopolis',
		title:
			'Quanto Custa Morar em Florianópolis em 2026: Tabela Completa de Aluguel e Compra por Bairro',
		excerpt:
			'Morar em Florianópolis em 2026 custa, em média, R$ 3.409 de aluguel mensal e R$ 13.208 por metro quadrado na compra. Veja tabelas por bairro, custos extras e cenários práticos.',
		imageUrl: '/assets/img/blog/blog_1_2.jpg',
		dateLabel: '30 Mai',
		datePublished: '2026-05-30',
		author: 'Viver Catarina',
		category: 'Custo de vida',
		tags: ['Florianópolis', 'Custo de vida', 'Aluguel', 'Mercado imobiliário'],
		href: '/blog/quanto-custa-morar-em-florianopolis',
	},
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
		tags: ['Florianópolis', 'Bairros', 'Moradia', 'Mercado imobiliário'],
		href: '/blog/melhores-bairros-para-morar-em-florianopolis',
	},
];

export function getBlogPosts() {
	return BLOG_POSTS;
}

export function getBlogPost(slug) {
	return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}
