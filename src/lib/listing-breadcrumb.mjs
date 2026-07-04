export function stripBreadcrumbHero(html) {
	return html.replace(
		/<(?:nav|div)\s+class="breadcumb-wrapper[^"]*"[^>]*>/,
		'<nav class="breadcumb-wrapper single-inventory" aria-label="Trilha de navegação">',
	);
}

export function removeBreadcrumbTitle(html) {
	return html.replace(/<h1 class="breadcumb-title">[\s\S]*?<\/h1>\s*/i, '');
}

export function setListingSortTitle(html, listingTitle) {
	return html.replace(
		/<h4 class="box-title text-start ">[^<]*<\/h4>/,
		`<h1 class="box-title text-start bairro-listing-title">${listingTitle}</h1>`,
	);
}

export function setBreadcrumbTrail(html, itemsHtml) {
	return html.replace(/<ol class="breadcumb-menu">[\s\S]*?<\/ol>/, `<ol class="breadcumb-menu">${itemsHtml}</ol>`);
}

export function patchCompactListingBreadcrumb(html, { pageLabel, listingTitle, parent }) {
	let output = stripBreadcrumbHero(removeBreadcrumbTitle(html));

	if (parent) {
		output = setBreadcrumbTrail(
			output,
			`<li><a href="/">Início</a></li>
                    <li><a href="${parent.href}">${parent.label}</a></li>
                    <li><span aria-current="page">${pageLabel}</span></li>`,
		);
	} else {
		output = setBreadcrumbTrail(
			output,
			`<li><a href="/">Início</a></li>
                    <li><span aria-current="page">${pageLabel}</span></li>`,
		);
	}

	if (listingTitle) {
		output = setListingSortTitle(output, listingTitle);
	}

	return output;
}

export function patchLancamentosTemplateHtml(html, label = 'Lançamentos', region = 'Florianópolis') {
	const isIndex = label === 'Lançamentos';

	return patchCompactListingBreadcrumb(html, {
		pageLabel: label,
		listingTitle: `${label} em ${region}`,
		parent: isIndex ? null : { href: '/lancamentos', label: 'Lançamentos' },
	});
}
