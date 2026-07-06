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
			'Cobrimos as 23 maiores cidades de SC, organizadas em seis regiões: Grande Florianópolis, Norte Catarinense, Vale do Itajaí, Sul Catarinense, Oeste Catarinense e Serra Catarinense. Na home e no rodapé você encontra links para Florianópolis, Joinville, Blumenau, Balneário Camboriú, Criciúma, Chapecó e demais cidades atendidas.',
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
			'Não. O portal tem como objetivo APENAS divulgar os lançamentos. Não substitui a incorporadora nem o cartório: ele conecta compradores a lançamentos e a corretores credenciados registrados no CRECI. A negociação, contrato e financiamento seguem os canais oficiais de cada empreendimento, com apoio dos profissionais indicados no site.',
	},
	{
		question: 'Como falar com um corretor pelo portal?',
		answer:
			'Abra a página do empreendimento ou cidade de interesse e use WhatsApp, telefone ou formulário de contato disponíveis no site. Corretores parceiros orientam sobre disponibilidade, valores atualizados e próximos passos para visitar o lançamento escolhido.',
	},
	{
		question: 'O uso do portal é gratuito para quem busca imóvel?',
		answer:
			'Sim. Navegar e comparar lançamentos é gratuito para quem procura imóvel novo em Santa Catarina. Você só avança para negociação quando decide falar com um corretor ou incorporadora.',
	},
	{
		question: 'Como navegar entre cidades e lançamentos no site?',
		answer:
			'Na página inicial, os cards de cidades levam aos portais de cada município. Use o menu para acessar lançamentos, bairros de Florianópolis e contato. O rodapé também lista todas as cidades cobertas, agrupadas por região de Santa Catarina.',
	},
	{
		question: 'Como entrar em contato com a equipe do Viver Catarina?',
		answer: `Compradores e incorporadoras podem falar conosco pelo WhatsApp, telefone ${SITE_PHONE_DISPLAY} ou e-mail ${SITE_EMAIL}. Acesse também a página de contato em ${SITE_URL}/contact para dúvidas sobre o portal, parcerias de divulgação ou suporte ao uso do site.`,
	},
];

/** @type {HomeFaqItem[]} */
export const HOME_FAQ_ITEMS_ES = [
	{
		question: '¿Qué es el Portal Viver Catarina?',
		answer: `${SITE_NAME} es el mayor portal especializado en lanzamientos inmobiliarios de Santa Catarina. Reunimos pre-lanzamientos, inmuebles sobre plano y unidades recién entregadas de las principales ciudades del estado, con información completa para comparar desarrollos y decidir con más seguridad.`,
	},
	{
		question: '¿Qué ciudades de Santa Catarina cubre el portal?',
		answer:
			'Cubrimos las 23 mayores ciudades de SC, organizadas en seis regiones: Grande Florianópolis, Norte Catarinense, Vale do Itajaí, Sul Catarinense, Oeste Catarinense y Serra Catarinense. En la home y en el pie de página encuentras enlaces a Florianópolis, Joinville, Blumenau, Balneário Camboriú, Criciúma, Chapecó y demás ciudades atendidas.',
	},
	{
		question: '¿Qué tipos de inmuebles encuentro en Viver Catarina?',
		answer:
			'El foco del portal es el inmueble nuevo: apartamentos sobre plano, casas en lanzamiento, loteos y terrenos en desarrollos recientes. Trabajamos con pre-lanzamientos, obras en curso y unidades listas para habitar, siempre con curaduría orientada al mercado catarinense.',
	},
	{
		question: '¿La información de los lanzamientos es confiable?',
		answer:
			'Cada desarrollo pasa por curaduría editorial antes de publicarse. Planos, precios, destaques y ubicación son verificados y presentados de forma clara. Las imágenes y datos oficiales pertenecen a las promotoras inmobiliarias; el pie de página del sitio refuerza que el contenido tiene carácter informativo.',
	},
	{
		question: '¿Viver Catarina vende inmuebles o intermedia la compra?',
		answer:
			'No. El portal tiene como objetivo SOLO divulgar los lanzamientos. No sustituye a la promotora inmobiliaria ni al registro público: conecta compradores con lanzamientos y con agentes inmobiliarios acreditados registrados en el CRECI. La negociación, contrato y financiación siguen los canales oficiales de cada desarrollo, con apoyo de los profesionales indicados en el sitio.',
	},
	{
		question: '¿Cómo hablar con un agente inmobiliario por el portal?',
		answer:
			'Abre la página del desarrollo o ciudad de interés y usa WhatsApp, teléfono o formulario de contacto disponibles en el sitio. Los agentes inmobiliarios socios orientan sobre disponibilidad, valores actualizados y próximos pasos para visitar el lanzamiento elegido.',
	},
	{
		question: '¿El uso del portal es gratuito para quien busca inmueble?',
		answer:
			'Sí. Navegar y comparar lanzamientos es gratuito para quien busca inmueble nuevo en Santa Catarina. Solo avanzas hacia la negociación cuando decides hablar con un agente inmobiliario o promotora.',
	},
	{
		question: '¿Cómo navegar entre ciudades y lanzamientos en el sitio?',
		answer:
			'En la página de inicio, las tarjetas de ciudades llevan a los portales de cada municipio. Usa el menú para acceder a lanzamientos, barrios de Florianópolis y contacto. El pie de página también lista todas las ciudades cubiertas, agrupadas por región de Santa Catarina.',
	},
	{
		question: '¿Cómo ponerme en contacto con el equipo de Viver Catarina?',
		answer: `Compradores y promotoras pueden hablar con nosotros por WhatsApp, teléfono ${SITE_PHONE_DISPLAY} o correo ${SITE_EMAIL}. Accede también a la página de contacto en ${SITE_URL}/es/contacto para dudas sobre el portal, alianzas de divulgación o soporte para el uso del sitio.`,
	},
];

export function getHomeFaqItems(lang = 'pt') {
	return lang === 'es' ? HOME_FAQ_ITEMS_ES : HOME_FAQ_ITEMS;
}

export function buildHomeFaqSchema(lang = 'pt') {
	const items = lang === 'es' ? HOME_FAQ_ITEMS_ES : HOME_FAQ_ITEMS;

	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: items.map(({ question, answer }) => ({
			'@type': 'Question',
			name: question,
			acceptedAnswer: {
				'@type': 'Answer',
				text: answer,
			},
		})),
		url: lang === 'es' ? `${SITE_URL}/es/#home-faq` : `${SITE_URL}/#home-faq`,
		name:
			lang === 'es'
				? 'Preguntas frecuentes sobre el Portal Viver Catarina'
				: 'Perguntas frequentes sobre o Portal Viver Catarina',
	};
}
