const NOT_INFORMED = 'Não informado';

function stripHtml(html) {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;|&#8211;|&amp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function normalizePaymentLine(line) {
	if (!line) {
		return null;
	}

	return line
		.replace(/\s*valores e disponibilidade.*$/i, '')
		.replace(/\s*condi[çc][õo]es de pagamento flex[ií]veis.*$/i, '')
		.trim();
}

function extractPaymentLine(text) {
	const conditionMatch = text.match(/condi[çc][ãa]o de pagamento:\s*([^.]+)/i);
	if (conditionMatch) {
		return normalizePaymentLine(conditionMatch[1]);
	}

	const parceladaMatch = text.match(
		/(entrada parcelada[^.]{0,120})/i,
	);
	if (parceladaMatch) {
		return normalizePaymentLine(parceladaMatch[1]);
	}

	const entradaMatch = text.match(
		/(entrada(?:\s+\d{1,2}%)?(?:\s*\+[^.]{0,120})+)/i,
	);
	if (
		entradaMatch &&
		/parcelas?|financiamento|refor[çc]|%\s*\+|\(\s*at[eé]/i.test(entradaMatch[1])
	) {
		return normalizePaymentLine(entradaMatch[1]);
	}

	return null;
}

function parseCount(text, pattern) {
	const match = text.match(pattern);
	return match ? Number(match[1]) : null;
}

function parsePercent(text, pattern) {
	const match = text.match(pattern);
	return match ? Number(match[1]) : null;
}

export function parsePaymentConditions(descriptionHtml) {
	const text = stripHtml(descriptionHtml || '');
	const resumo = extractPaymentLine(text);
	const searchText = (resumo || text).toLowerCase();

	const entradaPercent =
		parsePercent(searchText, /entrada\s*(\d{1,2})\s*%/) ??
		parsePercent(searchText, /(\d{1,2})\s*%\s*\+\s*mensais/);

	const financiamentoPercent =
		parsePercent(searchText, /financiamento[^.]{0,40}?(\d{1,2})\s*%/) ??
		parsePercent(searchText, /\(\s*(\d{1,2})\s*%\s*\)/);

	const entradaParcelas = parseCount(
		searchText,
		/entrada parcelada(?:\s+em)?\s*(\d+)\s*x/i,
	);

	const parcelasMensais =
		parseCount(searchText, /(\d+)\s*parcelas?\s*mensais/i) ??
		parseCount(searchText, /parcelas?\s*\(\s*at[eé]\s*(\d+)\s*x\s*\)/i) ??
		parseCount(searchText, /parcelas?\s*\(\s*at[eé]\s*(\d+)x\s*\)/i) ??
		parseCount(searchText, /\+\s*(\d+)\s*parcelas?\s*mensais/i) ??
		parseCount(searchText, /parcelas?\s*(\d+)\s*x/i);

	const reforcos =
		parseCount(searchText, /(\d+)\s*refor[çc]os?/i) ??
		parseCount(searchText, /refor[çc]os?\s*(\d+)\s*x/i);

	const aceitaFinanciamento = /financiamento/i.test(searchText);
	const aceitaParcelas =
		/parcelas?/i.test(searchText) || /refor[çc]os?/i.test(searchText) || /mensais/i.test(searchText);

	return {
		resumo,
		entradaPercent,
		financiamentoPercent,
		entradaParcelas,
		parcelasMensais,
		reforcos,
		aceitaFinanciamento,
		aceitaParcelas,
		fgts: /fgts/i.test(text) ? 'Sim' : 'Consulte',
		mcmv: /mcmv|minha casa/i.test(text) ? 'Sim' : NOT_INFORMED,
		permuta: /parte de pagamento|permuta|estuda-se im[óo]vel|estuda-se terreno/i.test(text),
	};
}

function resolvePercentages(conditions) {
	let entradaPercent = conditions.entradaPercent;
	let financiamentoPercent = conditions.financiamentoPercent;

	if (entradaPercent == null && financiamentoPercent != null) {
		entradaPercent = Math.max(0, 100 - financiamentoPercent);
	}

	if (entradaPercent == null) {
		entradaPercent = conditions.aceitaFinanciamento ? 20 : conditions.aceitaParcelas ? 30 : 20;
	}

	if (conditions.aceitaFinanciamento && financiamentoPercent == null) {
		financiamentoPercent = Math.max(0, Math.min(80, 100 - entradaPercent));
	} else if (!conditions.aceitaFinanciamento) {
		financiamentoPercent = 0;
	}

	return { entradaPercent, financiamentoPercent: financiamentoPercent ?? 0 };
}

export function buildFinancingSimulation(property) {
	const conditions = parsePaymentConditions(property.descriptionHtml);
	const propertyValue = property.price?.amount ?? null;
	const { entradaPercent, financiamentoPercent } = resolvePercentages(conditions);

	const hasReforcos = Boolean(
		conditions.reforcos || /refor[çc]/i.test(conditions.resumo || ''),
	);

	return {
		enabled: Boolean(propertyValue),
		aceita: conditions.aceitaFinanciamento || conditions.aceitaParcelas || Boolean(conditions.resumo),
		aceitaFinanciamento: conditions.aceitaFinanciamento,
		aceitaParcelas: conditions.aceitaParcelas,
		bancos: conditions.aceitaFinanciamento
			? 'Consulte condições com nossa equipe'
			: NOT_INFORMED,
		fgts: conditions.fgts,
		mcmv: conditions.mcmv,
		permuta: conditions.permuta,
		resumo: conditions.resumo,
		defaults: {
			propertyValue,
			entradaPercent,
			financiamentoPercent,
			parcelasMensais: conditions.parcelasMensais ?? (conditions.aceitaParcelas ? 36 : 0),
			reforcos: conditions.reforcos ?? (hasReforcos ? 6 : 0),
			entradaParcelas: conditions.entradaParcelas ?? 1,
			taxaAnual: 10.5,
			prazoFinanciamento: 360,
		},
	};
}
