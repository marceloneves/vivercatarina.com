export const FOOTER_NAV_COLUMNS = [
	{
		title: 'Institucional',
		id: 'footer-nav-institucional',
		items: [
			{ label: 'Início', href: '/' },
			{ label: 'Quem Somos', href: '/about' },
			{ label: 'Perguntas Frequentes', href: '/faq' },
			{ label: 'Contato', href: '/contact' },
			{ label: 'Política de Privacidade', href: '/privacidade' },
			{ label: 'Termos e Condições', href: '/termos' },
			{ label: 'Mapa do Site', href: '/sitemap-index.xml' },
		],
	},
	{
		title: 'Imóveis na Planta',
		id: 'footer-nav-imoveis',
		items: [
			{ label: 'Imóveis na Planta', href: '/lancamentos' },
			{ label: 'Pré-lançamentos', href: '/lancamentos/pre-lancamento' },
			{ label: 'Em lançamento', href: '/lancamentos/lancamento' },
			{ label: 'Apartamentos na Planta', href: '/lancamentos/apartamentos' },
			{ label: 'Casas em Condomínio', href: '/lancamentos/casas-em-condominio' },
			{ label: 'Loteamentos', href: '/lancamentos/loteamento' },
		],
	},
	{
		title: 'Florianópolis',
		id: 'footer-nav-florianopolis',
		items: [
			{ label: 'Florianópolis', href: '/' },
			{ label: 'Bairros', href: '/bairros' },
			{ label: 'Prontos para Morar', href: '/lancamentos/pronto-para-morar' },
			{ label: 'Blog', href: '/blog' },
			{ label: 'Glossário', href: '/glossario' },
			{
				label: 'Portal',
				href: 'https://vivercatarina.com',
				external: true,
			},
		],
	},
];

function buildFooterNavLink(item) {
	const attrs = item.external
		? ' target="_blank" rel="noopener noreferrer"'
		: '';

	return `<li><a href="${item.href}"${attrs}>${item.label}</a></li>`;
}

function buildFooterNavColumn({ title, id, items }) {
	const links = items.map(buildFooterNavLink).join('\n                                                ');

	return `                                <div class="footer-item">
                                    <nav class="widget widget_nav_menu footer-widget" aria-labelledby="${id}"><h3 class="widget_title" id="${id}">${title}</h3>
                                        <div class="menu-all-pages-container">
                                            <ul class="menu">
                                                ${links}
                                            </ul>
                                        </div>
                                    </nav>
                                </div>`;
}

export function buildFooterNavColumnsHtml() {
	return FOOTER_NAV_COLUMNS.map(buildFooterNavColumn).join('\n');
}

const FOOTER_NAV_COLUMNS_PATTERN =
	/<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-institucional">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-legal">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-suporte">[\s\S]*?<\/nav>\s*<\/div>/;

const FOOTER_NAV_PATCHED_PATTERN =
	/<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-institucional">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-imoveis">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-florianopolis">[\s\S]*?<\/nav>\s*<\/div>/;

const FOOTER_NAV_PATCHED_PATTERN_LEGACY =
	/<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-imoveis">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-florianopolis">[\s\S]*?<\/nav>\s*<\/div>\s*<div class="footer-item">\s*<nav class="widget widget_nav_menu footer-widget" aria-labelledby="footer-nav-institucional">[\s\S]*?<\/nav>\s*<\/div>/;

export function patchFooterNavMenus(html) {
	if (!html || !html.includes('footer-item-wrap')) {
		return html;
	}

	const columnsHtml = buildFooterNavColumnsHtml();

	if (FOOTER_NAV_PATCHED_PATTERN.test(html)) {
		return html.replace(FOOTER_NAV_PATCHED_PATTERN, columnsHtml);
	}

	if (FOOTER_NAV_PATCHED_PATTERN_LEGACY.test(html)) {
		return html.replace(FOOTER_NAV_PATCHED_PATTERN_LEGACY, columnsHtml);
	}

	if (FOOTER_NAV_COLUMNS_PATTERN.test(html)) {
		return html.replace(FOOTER_NAV_COLUMNS_PATTERN, columnsHtml);
	}

	return html;
}
