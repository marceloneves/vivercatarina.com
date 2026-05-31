import intros from '../data/bairro-intros.json';

export function getBairroIntro(slug, name) {
	const entry = intros[slug];

	if (entry?.paragraphs?.length) {
		return entry.paragraphs;
	}

	return [
		`${name} é um bairro de Florianópolis com demanda por imóveis na planta, apartamentos e casas em lançamento.`,
		`Confira abaixo os empreendimentos disponíveis em ${name} ou entre em contato para receber novidades desta região.`,
	];
}

export function getBairroIntroDescription(slug, name) {
	const paragraphs = getBairroIntro(slug, name);
	return paragraphs[0]?.replace(/\s+/g, ' ').trim() ?? '';
}
