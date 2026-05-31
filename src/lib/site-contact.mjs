export const SITE_NAME = 'Viver Catarina';
export const SITE_URL = 'https://florianopolis.vivercatarina.com';
export const SITE_EMAIL = 'contato@vivercatarina.com';
export const SITE_PHONE_DISPLAY = '(48) 98810-5199';
export const SITE_PHONE_TEL = '+5548988105199';
export const SITE_WHATSAPP_NUMBER = '5548988105199';
export const SITE_LOCATION = 'Florianópolis, SC';
export const SITE_DEFAULT_DESCRIPTION = `${SITE_NAME} — imóveis na planta em Florianópolis, Santa Catarina.`;

export function buildSitePageTitle(title) {
	if (!title || title === 'Início' || title === SITE_NAME) {
		return SITE_NAME;
	}

	return `${title} | ${SITE_NAME}`;
}
