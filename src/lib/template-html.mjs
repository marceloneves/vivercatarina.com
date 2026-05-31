const FEATURED_WIDGET_PATTERN =
	/<div class="widget\s*">\s*<h3 class="widget_title">(?:Imóveis em destaque|Featured Listings)<\/h3>[\s\S]*?(?=\s*<div class="widget sidebar-contact-form">)/;

const SIDEBAR_BANNER_PATTERN =
	/<div class="widget widget_banner[\s\S]*?<\/div>\s*<\/div>\s*(?=\s*<\/aside>)/;

export function removeSidebarFeaturedListings(html) {
	return html.replace(FEATURED_WIDGET_PATTERN, '');
}

export function removeSidebarBanner(html) {
	return html.replace(SIDEBAR_BANNER_PATTERN, '');
}

export function replaceSidebarFeaturedListings(html, featuredMarkup) {
	if (!featuredMarkup) {
		return removeSidebarFeaturedListings(html);
	}

	return html.replace(FEATURED_WIDGET_PATTERN, featuredMarkup);
}

export function prepareBairroSidebarHtml(html, featuredMarkup) {
	return removeSidebarBanner(replaceSidebarFeaturedListings(html, featuredMarkup));
}

export function injectBlogLinksSidebarWidget(html, widgetMarkup) {
	if (!widgetMarkup) {
		return html;
	}

	return html.replace(
		/<div class="widget sidebar-contact-form">/,
		`${widgetMarkup}\n                                <div class="widget sidebar-contact-form">`,
	);
}
