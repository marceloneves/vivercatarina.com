import { SITE_EMAIL, SITE_NAME, SITE_PHONE_DISPLAY, SITE_URL } from './site-contact.mjs';

/** @typedef {{ question: string, answer: string }} HomeFaqItem */

/** @type {HomeFaqItem[]} */
export const HOME_FAQ_ITEMS = [
	{
		question: 'O que é o Portal Viver Catarina?',
		answer: `${SITE_NAME} é o maior portal especializado em lançamentos imobiliários de Santa Catarina. Funcionamos como um agregador: reunimos num só lugar pré-lançamentos, imóveis na planta e unidades recém-entregues das 23 maiores cidades do estado, cada uma com o seu próprio portal dedicado (empreendimentos, bairros, preços e contato). A proposta é economizar o seu tempo — em vez de procurar incorporadora por incorporadora, você compara empreendimentos de várias cidades catarinenses lado a lado, com plantas, valores e condições apresentados de forma padronizada. Todo o conteúdo passa por curadoria editorial e o atendimento é feito por corretores credenciados no CRECI. Para quem busca imóvel novo em SC, a navegação e a comparação são totalmente gratuitas.`,
	},
	{
		question: 'Quais cidades de Santa Catarina o portal cobre?',
		answer:
			'Cobrimos as 23 maiores cidades de Santa Catarina, organizadas em cinco regiões para facilitar a busca: Grande Florianópolis (Florianópolis, São José, Palhoça, Biguaçu, Tijucas), Norte Catarinense (Joinville, Jaraguá do Sul, Barra Velha, Penha, Balneário Piçarras), Vale do Itajaí e Litoral (Balneário Camboriú, Itajaí, Blumenau, Brusque, Camboriú, Itapema, Navegantes, Porto Belo, Bombinhas), Sul Catarinense (Criciúma, Tubarão, Imbituba) e Oeste Catarinense (Chapecó). Cada município tem um portal próprio, acessível pelos cards na página inicial e pela lista completa no rodapé, agrupada por região. Assim você vai direto do litoral verticalizado de Balneário Camboriú aos polos industriais de Joinville e Blumenau sem se perder entre abas.',
	},
	{
		question: 'Que tipos de imóveis encontro no Viver Catarina?',
		answer:
			'O foco do portal é imóvel novo: apartamentos na planta, casas em lançamento, loteamentos e terrenos em empreendimentos recentes. Trabalhamos com três estágios de obra, para você escolher conforme o seu momento: pré-lançamento (quando o preço tende a ser mais baixo e as condições de pagamento mais longas), obras em andamento (unidade ainda na planta, com entrega prevista) e imóveis prontos para morar (chave na mão). Como cada estágio tem vantagens diferentes — investimento, valorização ou mudança imediata —, o portal apresenta essa informação de forma clara em cada empreendimento. A curadoria é sempre voltada ao mercado catarinense, do apartamento de frente para o mar no litoral aos lançamentos urbanos nos polos do interior.',
	},
	{
		question: 'As informações dos lançamentos são confiáveis?',
		answer:
			'Cada empreendimento passa por curadoria editorial antes de ser publicado: plantas, preços, destaques e localização são organizados e apresentados de forma clara e padronizada, para facilitar a comparação entre lançamentos. As imagens e os dados oficiais pertencem às respectivas incorporadoras, e o conteúdo tem caráter informativo — como reforçado no rodapé do site. Valores e disponibilidade podem mudar ao longo da obra, então a confirmação final é sempre feita com o corretor credenciado no CRECI ou diretamente com a incorporadora responsável. Em resumo: o portal serve para você descobrir, comparar e filtrar as melhores opções de Santa Catarina; a formalização da compra segue pelos canais oficiais de cada empreendimento.',
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
		answer: `Compradores e incorporadoras podem falar conosco pelo WhatsApp, telefone ${SITE_PHONE_DISPLAY} ou e-mail ${SITE_EMAIL}. Acesse também a página de contato em ${SITE_URL}/contato/ para dúvidas sobre o portal, parcerias de divulgação ou suporte ao uso do site.`,
	},
];

/** @type {HomeFaqItem[]} */
export const HOME_FAQ_ITEMS_ES = [
	{
		question: '¿Qué es el Portal Viver Catarina?',
		answer: `${SITE_NAME} es el mayor portal especializado en lanzamientos inmobiliarios de Santa Catarina. Funcionamos como un agregador: reunimos en un solo lugar pre-lanzamientos, inmuebles sobre plano y unidades recién entregadas de las 23 mayores ciudades del estado, cada una con su propio portal dedicado (desarrollos, barrios, precios y contacto). La propuesta es ahorrarte tiempo — en lugar de buscar promotora por promotora, comparas desarrollos de varias ciudades catarinenses lado a lado, con planos, valores y condiciones presentados de forma estandarizada. Todo el contenido pasa por curaduría editorial y la atención la realizan agentes inmobiliarios acreditados en el CRECI. Para quien busca inmueble nuevo en SC, navegar y comparar es totalmente gratuito.`,
	},
	{
		question: '¿Qué ciudades de Santa Catarina cubre el portal?',
		answer:
			'Cubrimos las 23 mayores ciudades de Santa Catarina, organizadas en cinco regiones para facilitar la búsqueda: Grande Florianópolis (Florianópolis, São José, Palhoça, Biguaçu, Tijucas), Norte Catarinense (Joinville, Jaraguá do Sul, Barra Velha, Penha, Balneário Piçarras), Vale do Itajaí e Litoral (Balneário Camboriú, Itajaí, Blumenau, Brusque, Camboriú, Itapema, Navegantes, Porto Belo, Bombinhas), Sul Catarinense (Criciúma, Tubarão, Imbituba) y Oeste Catarinense (Chapecó). Cada municipio tiene su propio portal, accesible por las tarjetas en la página de inicio y por la lista completa en el pie de página, agrupada por región. Así vas directo del litoral verticalizado de Balneário Camboriú a los polos industriales de Joinville y Blumenau sin perderte entre pestañas.',
	},
	{
		question: '¿Qué tipos de inmuebles encuentro en Viver Catarina?',
		answer:
			'El foco del portal es el inmueble nuevo: apartamentos sobre plano, casas en lanzamiento, loteos y terrenos en desarrollos recientes. Trabajamos con tres etapas de obra, para que elijas según tu momento: pre-lanzamiento (cuando el precio suele ser más bajo y las condiciones de pago más largas), obras en curso (unidad todavía sobre plano, con entrega prevista) e inmuebles listos para habitar (llave en mano). Como cada etapa tiene ventajas distintas — inversión, valorización o mudanza inmediata —, el portal presenta esa información de forma clara en cada desarrollo. La curaduría siempre está orientada al mercado catarinense, desde el apartamento frente al mar en el litoral hasta los lanzamientos urbanos en los polos del interior.',
	},
	{
		question: '¿La información de los lanzamientos es confiable?',
		answer:
			'Cada desarrollo pasa por curaduría editorial antes de publicarse: planos, precios, destaques y ubicación se organizan y presentan de forma clara y estandarizada, para facilitar la comparación entre lanzamientos. Las imágenes y los datos oficiales pertenecen a las respectivas promotoras inmobiliarias, y el contenido tiene carácter informativo — como se refuerza en el pie de página del sitio. Valores y disponibilidad pueden cambiar a lo largo de la obra, así que la confirmación final siempre se hace con el agente inmobiliario acreditado en el CRECI o directamente con la promotora responsable. En resumen: el portal sirve para que descubras, compares y filtres las mejores opciones de Santa Catarina; la formalización de la compra sigue por los canales oficiales de cada desarrollo.',
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
		answer: `Compradores y promotoras pueden hablar con nosotros por WhatsApp, teléfono ${SITE_PHONE_DISPLAY} o correo ${SITE_EMAIL}. Accede también a la página de contacto en ${SITE_URL}/es/contacto/ para dudas sobre el portal, alianzas de divulgación o soporte para el uso del sitio.`,
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
