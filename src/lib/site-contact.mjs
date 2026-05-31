export const SITE_NAME = 'Viver Catarina';
export const SITE_URL = 'https://vivercatarina.com';
export const SITE_EMAIL = 'contato@vivercatarina.com';
export const SITE_PHONE_DISPLAY = '(48) 98810-5199';
export const SITE_PHONE_TEL = '+5548988105199';
export const SITE_WHATSAPP_NUMBER = '5548988105199';
export const SITE_LOCATION = 'Florianópolis, SC';
export const SITE_CITY = 'Florianópolis';
export const SITE_DEFAULT_DESCRIPTION =
	'Portal Viver Catarina com imóveis na planta em Florianópolis. Compare lançamentos, apartamentos e casas, veja plantas, preços e fale com corretores credenciados.';

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const EMAIL_PLACEHOLDER_PATTERN = /placeholder="[^"]*@[^"]*"/g;

export function replaceLegacySiteEmails(html) {
	if (!html || !html.includes('@')) {
		return html;
	}

	return html
		.replace(EMAIL_PLACEHOLDER_PATTERN, 'placeholder="Seu e-mail"')
		.replace(EMAIL_PATTERN, (email) => (email === SITE_EMAIL ? email : SITE_EMAIL));
}

export function buildSitePageTitle(title) {
	if (!title || title === 'Início' || title === SITE_NAME) {
		return SITE_NAME;
	}

	if (title.includes(`| ${SITE_NAME}`)) {
		return title;
	}

	return `${title} | ${SITE_NAME}`;
}
