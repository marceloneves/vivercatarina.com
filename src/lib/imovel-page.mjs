import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadProperty, isSiteEligibleProperty } from './property-data.mjs';
import { buildPropertyPageViewModel } from './property-page-content.mjs';

const templateRoot = join(process.cwd(), 'src');
const shellTemplatePath = join(templateRoot, 'content/template-pages/property-details.html');

let shellCache;

function getShellTemplate() {
	if (shellCache) {
		return shellCache;
	}

	const template = readFileSync(shellTemplatePath, 'utf8');
	const breadcrumbStart = template.indexOf('<!--==============================\n    Breadcumb');
	const footerStart = template.indexOf('<!--==============================\n\tFooter Area');

	if (breadcrumbStart === -1 || footerStart === -1) {
		throw new Error('Não foi possível separar o template de detalhes do imóvel.');
	}

	shellCache = {
		before: template.slice(0, breadcrumbStart),
		after: template.slice(footerStart),
	};

	return shellCache;
}

function buildImovelShell() {
	const shell = getShellTemplate();

	return {
		shellBefore: shell.before,
		shellAfter: shell.after,
	};
}

export function buildImovelPageContext(slug) {
	const property = loadProperty(slug);

	if (!property || !isSiteEligibleProperty(property)) {
		return null;
	}

	const page = buildPropertyPageViewModel(property, slug);

	return {
		...page,
		...buildImovelShell(),
	};
}
