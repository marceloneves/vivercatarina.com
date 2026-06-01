import { SITE_EMAIL, SITE_NAME, SITE_PHONE_DISPLAY, SITE_URL } from './site-contact.mjs';

/** @typedef {{ question: string, answer: string }} HomeFaqItem */

/** @type {HomeFaqItem[]} */
export const HOME_FAQ_ITEMS = [
	{
		question: 'O que é o Portal Viver Catarina?',
		answer: `${SITE_NAME} é o maior portal especializado em lançamentos imobiliários de Santa Catarina. Reunimos pré-lançamentos, imóveis na planta e unidades recém-entregues das principais cidades do estado, com informações completas para comparar empreendimentos e decidir com mais segurança.`,
	},
	{
		question: 'Quais cidades de Santa Catarina o portal cobre?',
		answer:
			'Cobrimos as 25 maiores cidades de SC, organizadas em seis regiões: Grande Florianópolis, Norte Catarinense, Vale do Itajaí, Sul Catarinense, Oeste Catarinense e Serra Catarinense. Na home e no rodapé você encontra links para Florianópolis, Joinville, Blumenau, Balneário Camboriú, Criciúma, Chapecó e demais cidades atendidas.',
	},
	{
		question: 'Que tipos de imóveis encontro no Viver Catarina?',
		answer:
			'O foco do portal é imóvel novo: apartamentos na planta, casas em lançamento, loteamentos e terrenos em empreendimentos recentes. Trabalhamos com pré-lançamentos, obras em andamento e unidades prontas para morar, sempre com curadoria voltada ao mercado catarinense.',
	},
	{
		question: 'As informações dos lançamentos são confiáveis?',
		answer:
			'Cada empreendimento passa por curadoria editorial antes de ser publicado. Plantas, preços, destaques e localização são verificados e apresentados de forma clara. As imagens e dados oficiais pertencem às incorporadoras; o rodapé do site reforça que o conteúdo tem caráter informativo.',
	},
	{
		question: 'O Viver Catarina vende imóveis ou intermedia a compra?',
		answer:
			'O portal não substitui a incorporadora nem o cartório: ele conecta compradores a lançamentos e a corretores credenciados registrados no CRECI. A negociação, contrato e financiamento seguem os canais oficiais de cada empreendimento, com apoio dos profissionais indicados no site.',
	},
	{
		question: 'Como falar com um corretor pelo portal?',
		answer:
			'Abra a página do empreendimento ou cidade de interesse e use WhatsApp, telefone ou formulário de contato disponíveis no site. Corretores parceiros orientam sobre disponibilidade, valores atualizados e próximos passos para visitar o lançamento escolhido.',
	},
	{
		question: 'O uso do portal é gratuito para quem busca imóvel?',
		answer:
			'Sim. Navegar, comparar lançamentos e ler o guia de termos no blog é gratuito para quem procura imóvel novo em Santa Catarina. Você só avança para negociação quando decide falar com um corretor ou incorporadora.',
	},
	{
		question: 'Como navegar entre cidades e lançamentos no site?',
		answer:
			'Na página inicial, os cards de cidades levam aos portais de cada município. Use o menu para acessar o blog, bairros de Florianópolis e contato. O rodapé também lista todas as cidades cobertas, agrupadas por região de Santa Catarina.',
	},
	{
		question: 'Para que serve o blog do Viver Catarina?',
		answer:
			'O blog reúne o guia de termos de lançamentos em Santa Catarina — incorporação, patrimônio de afetação, regiões do estado, custos locais e fases do empreendimento — para você entender o mercado antes de comparar imóveis na planta.',
	},
	{
		question: 'Como entrar em contato com a equipe do Viver Catarina?',
		answer: `Compradores e incorporadoras podem falar conosco pelo WhatsApp, telefone ${SITE_PHONE_DISPLAY} ou e-mail ${SITE_EMAIL}. Acesse também a página de contato em ${SITE_URL}/contact para dúvidas sobre o portal, parcerias de divulgação ou suporte ao uso do site.`,
	},
];

export function getHomeFaqItems() {
	return HOME_FAQ_ITEMS;
}

export function buildHomeFaqSchema() {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: HOME_FAQ_ITEMS.map(({ question, answer }) => ({
			'@type': 'Question',
			name: question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: answer,
			},
		})),
		url: `${SITE_URL}/#home-faq`,
		name: 'Perguntas frequentes sobre o Portal Viver Catarina',
	};
}
