// Dicionário de UI bilíngue (PT default, ES sob /es).
// ui(lang) devolve PT ou ES com MESMA forma. Nomes próprios (Viver Catarina,
// Florianópolis, Santa Catarina, nomes de cidade/região) ficam em PT nos dois.
//
// REGRA DE OURO: os textos PT abaixo são EXATAMENTE os que já estavam nos
// componentes; renderizados com lang='pt' o HTML é idêntico ao atual.

const PT = {
	skipLink: 'Ir para o conteúdo',
	// Rótulo do seletor: mostra o OUTRO idioma. No site PT, leva ao ES.
	langSwitchLabel: 'Espanhol',
	nav: {
		home: 'Início',
		about: 'Quem Somos',
		cities: 'Cidades',
		contact: 'Contato',
		partnerBtn: 'Seja um Parceiro',
	},
	aria: {
		openMenu: 'Abrir menu',
		mainMenu: 'Menu principal',
		mobileMenu: 'Menu mobile',
		breadcrumb: 'Trilha de navegação',
		contactSocial: 'Contato e redes sociais',
		siteContacts: 'Contatos do site',
		homeLogo: 'Viver Catarina - página inicial',
		heroMain: 'Destaque principal',
		langSwitcher: 'Idioma',
	},
	breadcrumbHome: 'Início',
	hero: {
		prefix: 'Viva o melhor de',
		highlight: 'Santa Catarina',
		subtitle: 'O maior portal de lançamentos imobiliários de Santa Catarina',
	},
	bairros: {
		subTitle: 'Imóveis na planta',
		titlePrefix: 'Encontre seu Imóvel em',
		highlight: 'Santa Catarina',
		text: 'Encontre lançamentos imobiliários nas principais cidades de Santa Catarina',
		listingTitle: 'Bairros em Florianópolis',
		listingLead: 'Encontre o lançamento imobiliário em Florianópolis ideal para você',
	},
	cityImgAlt: (name) => `Vista aérea da cidade de ${name}, litoral de Santa Catarina`,
	cityImgTitle: (name) => `${name}, SC`,
	faq: {
		subTitle: 'Perguntas frequentes',
		title: 'Dúvidas sobre o Portal Viver Catarina',
		intro:
			'Entenda o que é o portal, quais cidades e imóveis cobrimos em Santa Catarina e como usar o site para comparar lançamentos e falar com corretores credenciados.',
		cta: 'Fale conosco',
	},
	footer: {
		aboutText:
			'O maior portal de lançamentos imobiliários de Santa Catarina. Encontre apartamentos na planta, pré-lançamentos e imóveis prontos para morar nas 23 maiores cidades catarinenses. De Joinville a Criciúma, de Balneário Camboriú a Chapecó — cobrimos cada lançamento, cada bairro, cada oportunidade do mercado imobiliário de SC. Aqui você compara, pesquisa e encontra o imóvel novo ideal com informações completas e atualizadas.',
		colInstitutional: 'Institucional',
		colLegal: 'Legal e Transparência',
		colContact: 'Contato',
		colCities: 'Cidades de Santa Catarina',
		linkHome: 'Início',
		linkAbout: 'Quem Somos',
		linkContact: 'Contato',
		linkSitemap: 'Mapa do Site',
		linkPrivacy: 'Política de Privacidade',
		linkTerms: 'Termos de Uso',
		linkCookies: 'Política de Cookies',
		rights: 'Todos os direitos reservados',
		socialLabel: 'Redes sociais:',
		// EXTRA: SiteFooter usa rótulo diferente do HomeFooter no PT ('Social Media:').
		socialLabelSite: 'Social Media:',
		disclaimer:
			'As informações e imagens divulgadas neste site são de caráter informativo e pertencem às respectivas incorporadoras. O atendimento é realizado por corretores credenciados e devidamente registrados no CRECI. Viver Catarina é um portal de propriedade da PMTurbo Tecnologia Ltda. ME — CNPJ 54.008.386/0001-07.',
		// EXTRA: aria-label do logo no rodapé (difere do header).
		logoAria: 'Viver Catarina Imóveis na Planta - página inicial',
	},
	consent: {
		text: 'Ao continuar navegando, você concorda com nossos',
		// EXTRA: conectivos entre os 3 links legais, para preservar a frase PT.
		textMid1: ', a',
		textMid2: ' e a',
		accept: 'Aceitar',
		aria: 'Aviso de privacidade',
	},
	whatsapp: {
		float: 'Falar no WhatsApp',
		gateTitle: 'Falar no WhatsApp',
		gateIntro: 'Informe seus dados para continuarmos no WhatsApp.',
		nameLabel: 'Nome',
		phoneLabel: 'Telefone',
		namePh: 'Seu nome',
		phonePh: '+55 48 98810-5199',
		submit: 'Continuar no WhatsApp',
		close: 'Fechar',
		errName: 'Informe seu nome.',
		errPhone: 'Informe um telefone válido com DDD.',
		msgTemplate: (name, siteName) =>
			`Olá! Meu nome é ${name}. Vim pelo site ${siteName} e gostaria de mais informações.`,
		// EXTRA: template usado quando há um imóvel/empreendimento em contexto.
		msgTemplateProperty: (name, propertyTitle) =>
			`Olá! Meu nome é ${name}. Tenho interesse no imóvel ${propertyTitle}.`,
	},
	notFound: {
		code: 'Erro 404',
		message: 'A página que você procura não existe ou foi movida.',
		back: 'Voltar ao início',
	},
};

const ES = {
	skipLink: 'Ir al contenido',
	// Rótulo do seletor: mostra o OUTRO idioma. No site ES, leva ao PT.
	langSwitchLabel: 'Português',
	nav: {
		home: 'Inicio',
		about: 'Quiénes Somos',
		cities: 'Ciudades',
		contact: 'Contacto',
		partnerBtn: 'Sé un Socio',
	},
	aria: {
		openMenu: 'Abrir menú',
		mainMenu: 'Menú principal',
		mobileMenu: 'Menú móvil',
		breadcrumb: 'Ruta de navegación',
		contactSocial: 'Contacto y redes sociales',
		siteContacts: 'Contactos del sitio',
		homeLogo: 'Viver Catarina - página de inicio',
		heroMain: 'Destacado principal',
		langSwitcher: 'Idioma',
	},
	breadcrumbHome: 'Inicio',
	hero: {
		prefix: 'Vive lo mejor de',
		highlight: 'Santa Catarina',
		subtitle: 'El mayor portal de lanzamientos inmobiliarios de Santa Catarina',
	},
	bairros: {
		subTitle: 'Inmuebles sobre plano',
		titlePrefix: 'Encuentra tu Inmueble en',
		highlight: 'Santa Catarina',
		text: 'Encuentra lanzamientos inmobiliarios en las principales ciudades de Santa Catarina',
		listingTitle: 'Barrios en Florianópolis',
		listingLead: 'Encuentra el lanzamiento inmobiliario en Florianópolis ideal para ti',
	},
	cityImgAlt: (name) => `Vista aérea de la ciudad de ${name}, litoral de Santa Catarina`,
	cityImgTitle: (name) => `${name}, SC`,
	faq: {
		subTitle: 'Preguntas frecuentes',
		title: 'Dudas sobre el Portal Viver Catarina',
		intro:
			'Entiende qué es el portal, qué ciudades e inmuebles cubrimos en Santa Catarina y cómo usar el sitio para comparar lanzamientos y hablar con agentes inmobiliarios acreditados.',
		cta: 'Habla con nosotros',
	},
	footer: {
		aboutText:
			'El mayor portal de lanzamientos inmobiliarios de Santa Catarina. Encuentra apartamentos sobre plano, pre-lanzamientos e inmuebles listos para habitar en las 23 mayores ciudades catarinenses. De Joinville a Criciúma, de Balneário Camboriú a Chapecó — cubrimos cada lanzamiento, cada barrio, cada oportunidad del mercado inmobiliario de SC. Aquí comparas, buscas y encuentras el inmueble nuevo ideal con información completa y actualizada.',
		colInstitutional: 'Institucional',
		colLegal: 'Legal y Transparencia',
		colContact: 'Contacto',
		colCities: 'Ciudades de Santa Catarina',
		linkHome: 'Inicio',
		linkAbout: 'Quiénes Somos',
		linkContact: 'Contacto',
		linkSitemap: 'Mapa del Sitio',
		linkPrivacy: 'Política de Privacidad',
		linkTerms: 'Términos de Uso',
		linkCookies: 'Política de Cookies',
		rights: 'Todos los derechos reservados',
		socialLabel: 'Redes sociales:',
		socialLabelSite: 'Redes sociales:',
		disclaimer:
			'La información e imágenes divulgadas en este sitio son de carácter informativo y pertenecen a las respectivas promotoras inmobiliarias. La atención es realizada por agentes inmobiliarios acreditados y debidamente registrados en el CRECI. Viver Catarina es un portal propiedad de PMTurbo Tecnologia Ltda. ME — CNPJ 54.008.386/0001-07.',
		logoAria: 'Viver Catarina Inmuebles sobre Plano - página de inicio',
	},
	consent: {
		text: 'Al continuar navegando, aceptas nuestros',
		textMid1: ', la',
		textMid2: ' y la',
		accept: 'Aceptar',
		aria: 'Aviso de privacidad',
	},
	whatsapp: {
		float: 'Hablar por WhatsApp',
		gateTitle: 'Hablar por WhatsApp',
		gateIntro: 'Ingresa tus datos para continuar en WhatsApp.',
		nameLabel: 'Nombre',
		phoneLabel: 'Teléfono',
		namePh: 'Tu nombre',
		phonePh: '+55 48 98810-5199',
		submit: 'Continuar en WhatsApp',
		close: 'Cerrar',
		errName: 'Ingresa tu nombre.',
		errPhone: 'Ingresa un teléfono válido con código de área.',
		msgTemplate: (name, siteName) =>
			`¡Hola! Mi nombre es ${name}. Vine por el sitio ${siteName} y me gustaría más información.`,
		msgTemplateProperty: (name, propertyTitle) =>
			`¡Hola! Mi nombre es ${name}. Tengo interés en el inmueble ${propertyTitle}.`,
	},
	notFound: {
		code: 'Error 404',
		message: 'La página que buscas no existe o fue movida.',
		back: 'Volver al inicio',
	},
};

/** Devolve o dicionário de UI para o idioma. 'es' => ES, qualquer outro => PT. */
export function ui(lang) {
	return lang === 'es' ? ES : PT;
}
