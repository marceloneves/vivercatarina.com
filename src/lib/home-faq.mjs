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
			'Cobrimos as 22 maiores cidades de Santa Catarina, organizadas em cinco regiões para facilitar a busca: Grande Florianópolis (Florianópolis, São José, Palhoça, Biguaçu, Tijucas), Norte Catarinense (Joinville, Jaraguá do Sul, Barra Velha, Penha, Balneário Piçarras), Vale do Itajaí e Litoral (Balneário Camboriú, Itajaí, Blumenau, Brusque, Camboriú, Itapema, Navegantes, Porto Belo, Bombinhas), Sul Catarinense (Criciúma, Tubarão) e Oeste Catarinense (Chapecó). Cada município tem um portal próprio, acessível pelos cards na página inicial e pela lista completa no rodapé, agrupada por região. Assim você vai direto do litoral verticalizado de Balneário Camboriú aos polos industriais de Joinville e Blumenau sem se perder entre abas.',
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
			'Não — o Viver Catarina não vende imóveis nem intermedia diretamente a compra. O papel do portal é apenas reunir e divulgar os lançamentos de Santa Catarina num só lugar, para facilitar a comparação. Não substituímos a incorporadora, o corretor nem o cartório: conectamos quem procura imóvel novo aos empreendimentos e a corretores credenciados registrados no CRECI, responsáveis pelo atendimento. Toda a negociação — proposta, contrato, condições de pagamento e financiamento — segue pelos canais oficiais de cada empreendimento, com o apoio dos profissionais indicados no site. Assim você usa o portal para descobrir e filtrar opções, e fecha o negócio com segurança diretamente com quem tem autorização para vender.',
	},
	{
		question: 'Como falar com um corretor pelo portal?',
		answer:
			'Falar com um corretor é rápido e sem burocracia. Abra o card da cidade de interesse na página inicial para chegar ao portal daquele município e, na página do empreendimento, use o WhatsApp, o telefone ou o formulário de contato disponíveis no site. Todo o atendimento é feito por corretores parceiros credenciados no CRECI, que orientam sobre disponibilidade de unidades, valores atualizados, plantas, condições de pagamento e financiamento, além de agendar visitas ao decorado ou ao stand de vendas. Você não precisa se cadastrar antes de navegar: o contato acontece quando você decide, apenas para o lançamento que realmente despertou interesse.',
	},
	{
		question: 'O uso do portal é gratuito para quem busca imóvel?',
		answer:
			'Sim, totalmente gratuito. Navegar pelo portal, explorar as cidades, comparar empreendimentos e consultar plantas, preços e condições não tem nenhum custo para quem procura imóvel novo em Santa Catarina — não há assinatura, cadastro obrigatório nem taxa para usar o site. O Viver Catarina se mantém por meio de parcerias com incorporadoras e corretores que anunciam seus lançamentos, e não cobra nada do comprador. Você só avança para a etapa de negociação quando decide, por conta própria, falar com um corretor credenciado ou diretamente com a incorporadora responsável pelo empreendimento. Ou seja: pesquisar e comparar é livre, sem compromisso e sem surpresa no final.',
	},
	{
		question: 'Como navegar entre cidades e lançamentos no site?',
		answer:
			'A navegação é simples e pensada para você chegar rápido ao imóvel certo. Na página inicial, os cards de cidades levam ao portal dedicado de cada município catarinense, com os lançamentos daquela cidade. No menu do topo estão os atalhos principais — Início, Quem Somos, Cidades e Contato —, disponíveis em português e espanhol. O rodapé lista todas as 23 cidades cobertas, agrupadas por região (Grande Florianópolis, Norte Catarinense, Vale do Itajaí e Litoral, Sul e Oeste), para quem prefere ir direto ao destino. Já dentro do portal de cada cidade, você compara empreendimentos, vê plantas e preços e fala com o corretor pelo WhatsApp.',
	},
	{
		question: 'Como entrar em contato com a equipe do Viver Catarina?',
		answer: `Estamos disponíveis por vários canais, seja você comprador ou parceiro. Para dúvidas rápidas, use o WhatsApp ou o telefone ${SITE_PHONE_DISPLAY}; para mensagens mais detalhadas, escreva para ${SITE_EMAIL} ou preencha o formulário na página de contato em ${SITE_URL}/contato/. Por esses canais atendemos tanto quem procura imóvel novo em Santa Catarina — e quer ser direcionado ao corretor certo — quanto incorporadoras e imobiliárias interessadas em divulgar seus lançamentos no portal. Também respondemos pedidos de suporte sobre o uso do site, correções de informação e propostas de parceria. Procuramos responder no menor tempo possível durante o horário comercial.`,
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
			'Cubrimos las 22 mayores ciudades de Santa Catarina, organizadas en cinco regiones para facilitar la búsqueda: Grande Florianópolis (Florianópolis, São José, Palhoça, Biguaçu, Tijucas), Norte Catarinense (Joinville, Jaraguá do Sul, Barra Velha, Penha, Balneário Piçarras), Vale do Itajaí e Litoral (Balneário Camboriú, Itajaí, Blumenau, Brusque, Camboriú, Itapema, Navegantes, Porto Belo, Bombinhas), Sul Catarinense (Criciúma, Tubarão) y Oeste Catarinense (Chapecó). Cada municipio tiene su propio portal, accesible por las tarjetas en la página de inicio y por la lista completa en el pie de página, agrupada por región. Así vas directo del litoral verticalizado de Balneário Camboriú a los polos industriales de Joinville y Blumenau sin perderte entre pestañas.',
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
			'No — Viver Catarina no vende inmuebles ni intermedia directamente la compra. El papel del portal es solo reunir y divulgar los lanzamientos de Santa Catarina en un solo lugar, para facilitar la comparación. No sustituimos a la promotora, al agente inmobiliario ni al registro público: conectamos a quien busca inmueble nuevo con los desarrollos y con agentes inmobiliarios acreditados registrados en el CRECI, responsables de la atención. Toda la negociación — propuesta, contrato, condiciones de pago y financiación — sigue por los canales oficiales de cada desarrollo, con el apoyo de los profesionales indicados en el sitio. Así usas el portal para descubrir y filtrar opciones, y cierras el negocio con seguridad directamente con quien tiene autorización para vender.',
	},
	{
		question: '¿Cómo hablar con un agente inmobiliario por el portal?',
		answer:
			'Hablar con un agente inmobiliario es rápido y sin burocracia. Abre la tarjeta de la ciudad de interés en la página de inicio para llegar al portal de ese municipio y, en la página del desarrollo, usa el WhatsApp, el teléfono o el formulario de contacto disponibles en el sitio. Toda la atención la realizan agentes inmobiliarios socios acreditados en el CRECI, que orientan sobre disponibilidad de unidades, valores actualizados, planos, condiciones de pago y financiación, además de agendar visitas al piso piloto o al stand de ventas. No necesitas registrarte antes de navegar: el contacto ocurre cuando tú decides, solo para el lanzamiento que realmente despertó tu interés.',
	},
	{
		question: '¿El uso del portal es gratuito para quien busca inmueble?',
		answer:
			'Sí, totalmente gratuito. Navegar por el portal, explorar las ciudades, comparar desarrollos y consultar planos, precios y condiciones no tiene ningún costo para quien busca inmueble nuevo en Santa Catarina — no hay suscripción, registro obligatorio ni tarifa para usar el sitio. Viver Catarina se mantiene mediante alianzas con promotoras y agentes inmobiliarios que anuncian sus lanzamientos, y no cobra nada al comprador. Solo avanzas hacia la etapa de negociación cuando decides, por cuenta propia, hablar con un agente inmobiliario acreditado o directamente con la promotora responsable del desarrollo. Es decir: buscar y comparar es libre, sin compromiso y sin sorpresas al final.',
	},
	{
		question: '¿Cómo navegar entre ciudades y lanzamientos en el sitio?',
		answer:
			'La navegación es simple y pensada para que llegues rápido al inmueble correcto. En la página de inicio, las tarjetas de ciudades llevan al portal dedicado de cada municipio catarinense, con los lanzamientos de esa ciudad. En el menú superior están los accesos principales — Inicio, Quiénes Somos, Ciudades y Contacto —, disponibles en portugués y español. El pie de página lista todas las 23 ciudades cubiertas, agrupadas por región (Grande Florianópolis, Norte Catarinense, Vale do Itajaí e Litoral, Sur y Oeste), para quien prefiere ir directo al destino. Ya dentro del portal de cada ciudad, comparas desarrollos, ves planos y precios y hablas con el agente inmobiliario por WhatsApp.',
	},
	{
		question: '¿Cómo ponerme en contacto con el equipo de Viver Catarina?',
		answer: `Estamos disponibles por varios canales, seas comprador o socio. Para dudas rápidas, usa el WhatsApp o el teléfono ${SITE_PHONE_DISPLAY}; para mensajes más detallados, escribe a ${SITE_EMAIL} o completa el formulario en la página de contacto en ${SITE_URL}/es/contacto/. Por estos canales atendemos tanto a quien busca inmueble nuevo en Santa Catarina — y quiere ser dirigido al agente inmobiliario correcto — como a promotoras e inmobiliarias interesadas en divulgar sus lanzamientos en el portal. También respondemos solicitudes de soporte sobre el uso del sitio, correcciones de información y propuestas de alianza. Procuramos responder en el menor tiempo posible durante el horario comercial.`,
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
