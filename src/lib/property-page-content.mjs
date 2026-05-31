import {
	buildLocationLabel,
	buildMapEmbedUrl,
	buildPriceLabel,
	getPropertyCode,
	getPropertyImageUrl,
	getPropertyVideoUrl,
	resolvePropertyCityName,
} from './property-data.mjs';
import { getCategoryLabel } from './property-listings.mjs';
import { buildFinancingSimulation } from './property-financing.mjs';
import { buildPropertyRealEstateListingJsonLd } from './property-schema.mjs';
import { cleanPropertyTitle } from './property-slug.mjs';
import { applyGlossaryInlineLinks } from './glossary-content-links.mjs';
import { buildPropertySeo } from './site-seo.mjs';
import { SITE_NAME, SITE_WHATSAPP_NUMBER } from './site-contact.mjs';

const WHATSAPP_NUMBER = SITE_WHATSAPP_NUMBER;
const NOT_INFORMED = 'Não informado';

function linkifyGlossaryContent(value) {
	return value ? applyGlossaryInlineLinks(value) : value;
}

function linkifyGlossaryList(items) {
	return items.map((item) => linkifyGlossaryContent(item));
}

function linkifyFaqItems(items) {
	return items.map((item) => ({
		pergunta: item.pergunta,
		resposta: linkifyGlossaryContent(item.resposta),
	}));
}

const FEATURE_ICON_MAP = {
	bicicletario: 'fa-solid fa-bicycle',
	elevador: 'fa-solid fa-building',
	piscina: 'fa-solid fa-person-swimming',
	academia: 'fa-solid fa-dumbbell',
	churrasqueira: 'fa-solid fa-fire',
	garagem: 'fa-solid fa-car',
	portaria: 'fa-solid fa-shield-halved',
	sauna: 'fa-solid fa-hot-tub-person',
	wifi: 'fa-solid fa-wifi',
};

function stripHtml(html) {
	return html
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;|&#8211;|&amp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function parseBrMoney(value) {
	if (!value) {
		return null;
	}

	return Number(value.replace(/\./g, '').replace(',', '.'));
}

function formatBrMoney(amount) {
	if (amount == null || Number.isNaN(amount)) {
		return 'Sob consulta';
	}

	return new Intl.NumberFormat('pt-BR', {
		style: 'currency',
		currency: 'BRL',
		maximumFractionDigits: 0,
	}).format(amount);
}

function parseArea(text) {
	const match = text.match(/(\d+(?:[.,]\d+)?)\s*m(?:²|2)/i);
	return match ? Number(match[1].replace(',', '.')) : null;
}

function parseAreaRange(text) {
	const range = text.match(
		/(\d+(?:[.,]\d+)?)\s*m(?:²|2)\s*a\s*(\d+(?:[.,]\d+)?)\s*m(?:²|2)/i,
	);

	if (range) {
		return {
			min: Number(range[1].replace(',', '.')),
			max: Number(range[2].replace(',', '.')),
		};
	}

	const single = parseArea(text);
	return { min: single, max: single };
}

function parseUnitDetails(text) {
	const normalized = text || '';
	const suites = normalized.match(/(\d+)\s*su[ií]tes?/i);
	const bedrooms = normalized.match(/(\d+)\s*(?:quartos?|dormit[oó]rios?)/i);
	const vagas = normalized.match(/(\d+)\s*vagas?/i);
	const banheiros = normalized.match(/(\d+)\s*banheiros?/i);

	let quartos = null;
	if (/studio/i.test(normalized)) {
		quartos = 0;
	} else if (suites) {
		quartos = Number(suites[1]);
	} else if (bedrooms) {
		quartos = Number(bedrooms[1]);
	}

	return {
		quartos,
		suites: suites ? Number(suites[1]) : null,
		vagas: vagas ? Number(vagas[1]) : null,
		banheiros: banheiros ? Number(banheiros[1]) : null,
		lavabo: /lavabo/i.test(normalized),
		varanda: /varanda|sacada/i.test(normalized),
	};
}

function parseExtendedPlantaDetails(text) {
	const normalized = text || '';
	const areaTotal = normalized.match(
		/(\d+(?:[.,]\d+)?)\s*m(?:²|2)\s*(?:de\s*)?(?:área\s*)?total/i,
	);
	const varandaArea = normalized.match(
		/(?:varanda|sacada)[^.\d\n]{0,50}(\d+(?:[.,]\d+)?)\s*m(?:²|2)/i,
	);
	const andares = normalized.match(
		/(\d+)[º°]?\s*(?:ao|a)\s*(\d+)[º°]?(?:\s*(?:andar|pavimento))?/i,
	);
	const unidadesDisponiveis = normalized.match(/(\d+)\s*unidades?\s*dispon[ií]ve(is|l)/i);

	let vagaTipo = null;
	if (/vagas?\s*(?:de\s*garagem\s*)?cobertas?/i.test(normalized) || /(\d+)\s*vagas?\s*cobertas?/i.test(normalized)) {
		vagaTipo = 'coberta';
	} else if (/vagas?\s*(?:de\s*garagem\s*)?rotativas?/i.test(normalized)) {
		vagaTipo = 'rotativa';
	} else if (/vaga\s*(?:de\s*garagem\s*)?descoberta/i.test(normalized)) {
		vagaTipo = 'descoberta';
	}

	return {
		areaTotal: areaTotal ? Number(areaTotal[1].replace(',', '.')) : null,
		varandaArea: varandaArea ? Number(varandaArea[1].replace(',', '.')) : null,
		vagaTipo,
		andares: andares ? `${andares[1]}º ao ${andares[2]}º` : null,
		unidadesDisponiveis: unidadesDisponiveis ? Number(unidadesDisponiveis[1]) : null,
	};
}

function formatAreaValue(value) {
	if (value == null || Number.isNaN(value)) {
		return null;
	}

	const formatted = Number(value).toLocaleString('pt-BR', {
		minimumFractionDigits: Number(value) % 1 === 0 ? 0 : 2,
		maximumFractionDigits: 2,
	});

	return `${formatted} m²`;
}

function formatAreaPrivativaLabel(planta) {
	const { areaPrivativaMin, areaPrivativaMax } = planta;

	if (areaPrivativaMin && areaPrivativaMax && areaPrivativaMin !== areaPrivativaMax) {
		return `${formatAreaValue(areaPrivativaMin)} a ${formatAreaValue(areaPrivativaMax)}`;
	}

	return formatAreaValue(areaPrivativaMin ?? areaPrivativaMax);
}

function formatPlantaTitulo(planta) {
	if (planta.suites === 1) {
		return '1 Suíte';
	}

	if (planta.suites > 1) {
		return `${planta.suites} Suítes`;
	}

	if (planta.quartos === 0) {
		return 'Studio';
	}

	if (planta.quartos === 1) {
		return '1 Quarto';
	}

	if (planta.quartos) {
		return `${planta.quartos} Quartos`;
	}

	return planta.tipo || 'Unidade';
}

function formatQuartosLabel(planta) {
	if (planta.suites === 1) {
		return '1 suíte';
	}

	if (planta.suites > 1) {
		return `${planta.suites} suítes`;
	}

	if (planta.quartos === 0) {
		return 'Studio';
	}

	if (planta.quartos === 1) {
		return '1 quarto';
	}

	if (planta.quartos) {
		return `${planta.quartos} quartos`;
	}

	return NOT_INFORMED;
}

function formatVarandaLabel(planta) {
	if (!planta.varanda) {
		return NOT_INFORMED;
	}

	if (planta.varandaArea) {
		return `Sim · ${formatAreaValue(planta.varandaArea)}`;
	}

	return 'Sim';
}

function formatVagaLabel(planta) {
	if (planta.vagas == null) {
		return NOT_INFORMED;
	}

	if (planta.vagaTipo) {
		return planta.vagas === 1
			? `1 ${planta.vagaTipo}`
			: `${planta.vagas} ${planta.vagaTipo}s`;
	}

	return planta.vagas === 1 ? '1 vaga' : `${planta.vagas} vagas`;
}

function buildPlantaHighlights(planta) {
	const highlights = [];
	const quartos = formatQuartosLabel(planta);

	if (quartos !== NOT_INFORMED) {
		highlights.push(quartos);
	}

	if (planta.banheiros != null) {
		highlights.push(
			planta.banheiros === 1 ? '1 banheiro' : `${planta.banheiros} banheiros`,
		);
	}

	if (planta.vagas != null) {
		highlights.push(planta.vagas === 1 ? '1 vaga' : `${planta.vagas} vagas`);
	}

	const areaPrivativa = formatAreaPrivativaLabel(planta);
	if (areaPrivativa) {
		highlights.push(`${areaPrivativa} privativo`);
	}

	if (planta.areaTotal) {
		highlights.push(`${formatAreaValue(planta.areaTotal)} total`);
	}

	return highlights;
}

function mergePlantaExtendedFields(planta, text) {
	const extended = parseExtendedPlantaDetails(text);

	return {
		...planta,
		areaTotal: planta.areaTotal ?? extended.areaTotal,
		varandaArea: planta.varandaArea ?? extended.varandaArea,
		vagaTipo: planta.vagaTipo ?? extended.vagaTipo,
		andares: planta.andares ?? extended.andares,
		unidadesDisponiveis: planta.unidadesDisponiveis ?? extended.unidadesDisponiveis,
	};
}

function normalizePlantaDisplay(planta, property) {
	const merged = mergePlantaExtendedFields(planta, planta.rawText || planta.tipo || '');
	const titulo = formatPlantaTitulo(merged);
	const unidadesDisponiveis = merged.unidadesDisponiveis;

	return {
		...merged,
		titulo,
		highlights: buildPlantaHighlights(merged),
		unidadesResumo: unidadesDisponiveis
			? `${unidadesDisponiveis} ${unidadesDisponiveis === 1 ? 'unidade disponível' : 'unidades disponíveis'}`
			: null,
		dadosUnidade: {
			areaPrivativa: formatAreaPrivativaLabel(merged) || NOT_INFORMED,
			areaTotal: formatAreaValue(merged.areaTotal) || NOT_INFORMED,
			quartos: formatQuartosLabel(merged),
			banheiros:
				merged.banheiros != null ? String(merged.banheiros) : NOT_INFORMED,
			varanda: formatVarandaLabel(merged),
		},
		disponibilidade: {
			preco: merged.precoAPartir || NOT_INFORMED,
			vaga: formatVagaLabel(merged),
			andares: merged.andares || NOT_INFORMED,
			unidades: unidadesDisponiveis
				? `${unidadesDisponiveis} disponíveis`
				: NOT_INFORMED,
			status: merged.status || 'Disponível',
		},
	};
}

function inferTipo(rawText, details) {
	if (/studio/i.test(rawText)) {
		return 'Studio';
	}

	if (/garden/i.test(rawText)) {
		return 'Garden';
	}

	if (/cobertura/i.test(rawText)) {
		return 'Cobertura';
	}

	if (/loft/i.test(rawText)) {
		return 'Loft';
	}

	if (/sala comercial/i.test(rawText)) {
		return 'Sala comercial';
	}

	if (/terreno|lote/i.test(rawText)) {
		return 'Terreno';
	}

	if (details.quartos === 0) {
		return 'Studio';
	}

	if (details.quartos) {
		return `${details.quartos} ${details.quartos === 1 ? 'Quarto' : 'Quartos'}`;
	}

	return rawText.split(/ a partir de /i)[0]?.trim().slice(0, 80) || 'Unidade';
}

function parseBaseUnitPrice(descriptionHtml) {
	const match = stripHtml(descriptionHtml || '').match(
		/unidades?\s+a partir de\s*R\$\s*([\d.\s]+(?:,\d{2})?)/i,
	);

	return match ? parseBrMoney(match[1].replace(/\s/g, '')) : null;
}

export function parsePlantasFromDescription(descriptionHtml) {
	if (!descriptionHtml) {
		return [];
	}

	const plantas = [];
	const seen = new Set();
	const blockPattern = /<(p|h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;

	for (const match of descriptionHtml.matchAll(blockPattern)) {
		const text = stripHtml(match[2]);

		if (!/a partir de/i.test(text) || /^entrada\s/i.test(text)) {
			continue;
		}

		const priceMatch = text.match(/a partir de\s*R\$\s*([\d.\s]+(?:,\d{2})?)/i);
		if (!priceMatch) {
			continue;
		}

		const price = parseBrMoney(priceMatch[1].replace(/\s/g, ''));
		const beforePrice = text.split(/a partir de/i)[0].trim();
		const rawText =
			beforePrice.length > 3 ? beforePrice : text.replace(/a partir de[\s\S]*$/i, '').trim();

		if (/^unidades?$/i.test(rawText)) {
			continue;
		}

		const key = `${rawText}|${price}`;
		if (seen.has(key)) {
			continue;
		}

		seen.add(key);

		const area = parseAreaRange(`${rawText} ${text}`);
		const details = parseUnitDetails(rawText);
		const extended = parseExtendedPlantaDetails(rawText);

		plantas.push({
			tipo: inferTipo(rawText, details),
			areaPrivativaMin: area.min,
			areaPrivativaMax: area.max,
			areaTotal: extended.areaTotal,
			quartos: details.quartos,
			suites: details.suites,
			banheiros: details.banheiros,
			vagas: details.vagas,
			lavabo: details.lavabo,
			varanda: details.varanda,
			varandaArea: extended.varandaArea,
			vagaTipo: extended.vagaTipo,
			andares: extended.andares,
			unidadesDisponiveis: extended.unidadesDisponiveis,
			precoAPartir: formatBrMoney(price),
			precoAmount: price,
			status: 'Disponível',
			badge: plantas.length === 0 ? 'Lançamento' : null,
			rawText,
			imageUrl: null,
		});
	}

	return plantas;
}

function extractPlantaSignature(text) {
	const details = parseUnitDetails(text || '');
	const area = parseArea(text || '');

	return {
		...details,
		area,
		isStudio: /studio/i.test(text || ''),
	};
}

function scorePlantaMatch(floorPlan, descPlanta) {
	const fpText = `${floorPlan.title} ${floorPlan.image || ''}`;
	const fpSig = extractPlantaSignature(fpText);
	const descSig = extractPlantaSignature(descPlanta.rawText);
	let score = 0;

	if (fpSig.isStudio && descSig.quartos === 0) {
		score += 10;
	}

	if (fpSig.quartos != null && descSig.quartos != null && fpSig.quartos === descSig.quartos) {
		score += 8;
	}

	if (fpSig.suites != null && descSig.suites != null && fpSig.suites === descSig.suites) {
		score += 8;
	}

	const fpSuites = fpText.match(/(\d+)[-\s]su[ií]tes?/i);
	if (fpSuites && descSig.suites === Number(fpSuites[1])) {
		score += 6;
	}

	if (fpSig.area && descSig.area && Math.abs(fpSig.area - descSig.area) < 8) {
		score += 4;
	}

	return score;
}

function findMatchingDescriptionPlanta(floorPlan, descriptionPlantas) {
	if (!descriptionPlantas.length) {
		return null;
	}

	let best = null;
	let bestScore = 0;

	for (const planta of descriptionPlantas) {
		const score = scorePlantaMatch(floorPlan, planta);
		if (score > bestScore) {
			bestScore = score;
			best = planta;
		}
	}

	return bestScore > 0 ? best : null;
}

function buildPlantaFromFloorPlan(floorPlan, descPlanta, property, slug, index, basePrice) {
	const fpText = `${floorPlan.title} ${floorPlan.image || ''}`;
	const fpDetails = parseUnitDetails(fpText);
	const fpArea = parseAreaRange(fpText);

	return {
		tipo: floorPlan.title,
		areaPrivativaMin: descPlanta?.areaPrivativaMin ?? fpArea.min ?? property.overview?.sizeSqm,
		areaPrivativaMax:
			descPlanta?.areaPrivativaMax ?? fpArea.max ?? descPlanta?.areaPrivativaMin ?? property.overview?.sizeSqm,
		areaTotal: descPlanta?.areaTotal ?? null,
		quartos: descPlanta?.quartos ?? fpDetails.quartos ?? property.overview?.bedrooms,
		suites: descPlanta?.suites ?? fpDetails.suites,
		banheiros: descPlanta?.banheiros ?? fpDetails.banheiros ?? property.overview?.bathrooms,
		vagas: descPlanta?.vagas ?? fpDetails.vagas ?? property.overview?.garages,
		lavabo: descPlanta?.lavabo ?? fpDetails.lavabo,
		varanda: descPlanta?.varanda ?? fpDetails.varanda,
		varandaArea: descPlanta?.varandaArea ?? null,
		vagaTipo: descPlanta?.vagaTipo ?? null,
		andares: descPlanta?.andares ?? null,
		unidadesDisponiveis: descPlanta?.unidadesDisponiveis ?? null,
		precoAPartir: formatBrMoney(descPlanta?.precoAmount ?? basePrice ?? property.price?.amount),
		precoAmount: descPlanta?.precoAmount ?? basePrice ?? property.price?.amount,
		status: 'Disponível',
		badge: index === 0 ? 'Lançamento' : null,
		rawText: descPlanta?.rawText || floorPlan.title,
		imageUrl: floorPlan.image ? getPropertyImageUrl(slug, floorPlan.image) : null,
	};
}

function finalizePlantas(plantas, property) {
	return plantas.map((planta) => normalizePlantaDisplay(planta, property));
}

export function buildPlantas(property, slug) {
	const descriptionPlantas = parsePlantasFromDescription(property.descriptionHtml);
	const floorPlans = (property.floorPlans || []).filter((plan) => plan?.title);
	const basePrice = parseBaseUnitPrice(property.descriptionHtml) ?? property.price?.amount;

	if (floorPlans.length > 0) {
		const usedDescriptions = new Set();

		return finalizePlantas(
			floorPlans.map((floorPlan, index) => {
				const availableDescriptions = descriptionPlantas.filter((_, i) => !usedDescriptions.has(i));
				let matched = findMatchingDescriptionPlanta(floorPlan, availableDescriptions);

				if (matched) {
					usedDescriptions.add(descriptionPlantas.indexOf(matched));
				} else if (descriptionPlantas.length === 1) {
					matched = descriptionPlantas[0];
				} else if (descriptionPlantas[index]) {
					matched = descriptionPlantas[index];
				}

				return buildPlantaFromFloorPlan(floorPlan, matched, property, slug, index, basePrice);
			}),
			property,
		);
	}

	if (descriptionPlantas.length > 0) {
		return finalizePlantas(descriptionPlantas, property);
	}

	if (basePrice || property.overview?.sizeSqm || property.price?.amount) {
		const details = parseUnitDetails(
			`${property.title} ${stripHtml(property.descriptionHtml || '').slice(0, 500)}`,
		);

		return finalizePlantas(
			[
				{
					tipo: property.labels?.[0]?.name || property.types?.[0]?.name || 'Unidade',
					areaPrivativaMin: property.overview?.sizeSqm,
					areaPrivativaMax: property.overview?.sizeSqm,
					quartos: details.quartos ?? property.overview?.bedrooms,
					suites: details.suites,
					banheiros: details.banheiros ?? property.overview?.bathrooms,
					vagas: details.vagas ?? property.overview?.garages,
					lavabo: details.lavabo,
					varanda: details.varanda,
					precoAPartir: formatBrMoney(basePrice ?? property.price?.amount),
					precoAmount: basePrice ?? property.price?.amount,
					status: 'Disponível',
					badge: 'Lançamento',
					rawText: property.title,
					imageUrl: null,
				},
			],
			property,
		);
	}

	return [];
}

function mapFeatureIcon(feature, featureSlug) {
	if (featureSlug && FEATURE_ICON_MAP[featureSlug]) {
		return FEATURE_ICON_MAP[featureSlug];
	}

	const normalized = feature.toLowerCase();
	for (const [key, icon] of Object.entries(FEATURE_ICON_MAP)) {
		if (normalized.includes(key)) {
			return icon;
		}
	}

	return 'fa-solid fa-building';
}

function extractListItemTexts(html) {
	if (!html) {
		return [];
	}

	return [...html.matchAll(/<li[^>]*>(.*?)<\/li>/gis)].map((match) => stripHtml(match[1]));
}

function formatTodayDate() {
	return new Intl.DateTimeFormat('pt-BR', {
		timeZone: 'America/Sao_Paulo',
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(new Date());
}

function formatFichaCodigo(code) {
	if (!code) {
		return NOT_INFORMED;
	}

	return `#${String(code).replace(/^#/, '').trim()}`;
}

function extractConstrutora(property) {
	const explicit =
		property.ficha?.construtora || property.overview?.construtora || null;
	if (explicit) {
		return explicit;
	}

	const title = property.title || '';
	const description = stripHtml(property.descriptionHtml || '');

	const fromDescription = description.match(
		/Construtora\s+(?!EM\b|em\b|ATÉ\b|até\b)([A-ZÁÉÍÓÚ][A-Za-zÁÉÍÓÚáéíóú0-9'’`.&-\s]{2,50}?)(?:\s*S\/A|\s*S\.A\.|\s*[|–—]|$)/i,
	);
	if (fromDescription) {
		return fromDescription[1].trim();
	}

	const fromTitle = title.match(
		/Construtora\s+(?!EM\b|em\b)([A-ZÁÉÍÓÚ][A-Za-zÁÉÍÓÚáéíóú0-9'’`.&-\s]{2,50}?)(?:\s*S\/A|\s*S\.A\.|\s*[|–—]|$)/i,
	);
	if (fromTitle) {
		return fromTitle[1].trim();
	}

	const speFromTitle = title.match(
		/(?:Constru[cç][aã]o|Lan[cç]amento)\s+SPE,?\s+([^,|]+)/i,
	);
	if (speFromTitle) {
		return `SPE ${speFromTitle[1].trim()}`;
	}

	const speFromDescription = description.match(
		/(?:projeto|empreendimento|lan[cç]amento)\s+SPE\s+(?:na|em|no)\s+([^,.–—]+)/i,
	);
	if (speFromDescription) {
		return `SPE ${speFromDescription[1].trim()}`;
	}

	if (/SPE/i.test(title)) {
		const speName = title.match(/SPE,?\s+([^,|]+)/i);
		if (speName) {
			return `SPE ${speName[1].trim()}`;
		}
	}

	return NOT_INFORMED;
}

function extractTotalAndares(property) {
	const explicit =
		property.ficha?.totalAndares ||
		property.overview?.totalFloors ||
		property.overview?.totalAndares ||
		null;
	if (explicit) {
		return explicit;
	}

	const html = property.descriptionHtml || '';
	const listItems = extractListItemTexts(html);

	for (const text of listItems) {
		const exact = text.match(/^(\d+)\s*(andares?|pavimentos?)$/i);
		if (exact) {
			const unit = /pavimento/i.test(exact[2]) ? 'pavimentos' : 'andares';
			return `${exact[1]} ${unit}`;
		}
	}

	for (const text of listItems) {
		if (/garagem|por andar|pavimento do/i.test(text)) {
			continue;
		}

		const match = text.match(/(\d+)\s*(pavimentos?|andares?)/i);
		if (match) {
			const unit = /pavimento/i.test(match[2]) ? 'pavimentos' : 'andares';
			return `${match[1]} ${unit}`;
		}
	}

	const buildingMatch = html.match(/(\d{2,})\s*pavimentos?/i);
	if (buildingMatch) {
		return `${buildingMatch[1]} pavimentos`;
	}

	return NOT_INFORMED;
}

function extractTotalUnidades(property) {
	const explicit =
		property.ficha?.totalUnidades ||
		property.overview?.totalUnits ||
		property.overview?.totalUnidades ||
		null;
	if (explicit) {
		return explicit;
	}

	const html = property.descriptionHtml || '';
	const listItems = extractListItemTexts(html);

	for (const text of listItems) {
		const exact = text.match(/^(\d+)\s*(apartamentos?|unidades?|casas?|sobrados?)$/i);
		if (exact) {
			const unit = exact[2].toLowerCase();
			if (/apartamento/.test(unit)) {
				return `${exact[1]} apartamentos`;
			}
			if (/casa/.test(unit)) {
				return `${exact[1]} casas`;
			}
			if (/sobrado/.test(unit)) {
				return `${exact[1]} sobrados`;
			}
			return `${exact[1]} unidades`;
		}
	}

	for (const text of listItems) {
		if (/por andar/i.test(text)) {
			continue;
		}

		const match = text.match(/(\d+)\s*(apartamentos?|unidades?)/i);
		if (match) {
			const unit = /apartamento/i.test(match[2]) ? 'apartamentos' : 'unidades';
			return `${match[1]} ${unit}`;
		}
	}

	const globalMatch = html.match(
		/(\d+)\s*(apartamentos?|unidades?)(?!\s*por\s*andar)/i,
	);
	if (globalMatch) {
		const unit = /apartamento/i.test(globalMatch[2]) ? 'apartamentos' : 'unidades';
		return `${globalMatch[1]} ${unit}`;
	}

	return NOT_INFORMED;
}

function extractPadrao(property) {
	const explicit =
		property.ficha?.padrao || property.overview?.padrao || null;
	if (explicit) {
		return explicit;
	}

	const sources = [
		property.title,
		stripHtml(property.descriptionHtml || ''),
		...(property.labels || []).map((label) => label.name),
	];

	for (const text of sources) {
		if (!text) {
			continue;
		}

		if (/alto\s+padr[aã]o/i.test(text)) {
			return 'Alto padrão';
		}

		if (/m[eé]dio\s+padr[aã]o/i.test(text)) {
			return 'Médio padrão';
		}

		if (/luxo|premium|exclusiv/i.test(text)) {
			return 'Alto padrão';
		}
	}

	return NOT_INFORMED;
}

function extractRegistro(property) {
	const explicit =
		property.ficha?.registro || property.overview?.registro || null;
	if (explicit) {
		return explicit;
	}

	const text = stripHtml(property.descriptionHtml || '');

	const cartorio = text.match(
		/Cart[oó]rio[^.]{0,50}(?:\d+[º°]?\s*RI|Registro de Im[oó]veis[^.]{0,40})/i,
	);
	if (cartorio) {
		return cartorio[0].trim();
	}

	const cartorioShort = text.match(/Cart[oó]rio\s+\d+[º°]?\s*RI/i);
	if (cartorioShort) {
		return cartorioShort[0].trim();
	}

	const incorporacao = text.match(/Incorpora[çc][aã]o[^.]{8,140}/i);
	if (incorporacao) {
		const value = incorporacao[0].trim();
		const oficio = value.match(/(\d+[º°]?\s*Of[ií]cio[^.]+)/i);
		if (oficio) {
			return oficio[1].trim();
		}

		const matricula = value.match(/Matr[ií]cula[^.]{0,40}/i);
		if (matricula) {
			return value.length > 90 ? `${value.slice(0, 90).trim()}…` : value;
		}

		return value.length > 90 ? `${value.slice(0, 90).trim()}…` : value;
	}

	return NOT_INFORMED;
}

function buildFichaCidade(property) {
	const city = resolvePropertyCityName(property);
	const state = property.address?.state?.slug?.toUpperCase() || 'SC';

	if (!city) {
		return NOT_INFORMED;
	}

	return `${city} - ${state}`;
}

function buildFicha(property) {
	return {
		codigo: formatFichaCodigo(getPropertyCode(property)),
		construtora: extractConstrutora(property),
		situacao: getCategoryLabel(property.category),
		entrega:
			property.overview?.deliveryYear ||
			property.statuses?.[0]?.name ||
			NOT_INFORMED,
		totalAndares: extractTotalAndares(property),
		totalUnidades: extractTotalUnidades(property),
		padrao: extractPadrao(property),
		registro: extractRegistro(property),
		atualizadoEm: formatTodayDate(),
		cidade: buildFichaCidade(property),
	};
}

function buildSobre(property) {
	const city = property.address?.city?.name;
	const neighborhood = property.address?.neighborhood?.name;
	const title = property.title;
	const category = getCategoryLabel(property.category);

	return [
		`${title} é um empreendimento ${category.toLowerCase()} em ${neighborhood || city || 'Santa Catarina'}, ${city ? `no município de ${city}` : 'com localização estratégica'} e perfil pensado tanto para moradia quanto para investimento.`,
		`Com tipologias variadas e condições comerciais flexíveis, o projeto combina localização privilegiada, infraestrutura moderna e potencial de valorização na região.`,
		`Entre em contato para receber plantas, tabela atualizada e simulação de pagamento conforme a unidade de interesse.`,
	].join(' ');
}

function buildAudienceItems(property, mode) {
	const neighborhood = property.address?.neighborhood?.name || 'região';
	const city = property.address?.city?.name || 'Santa Catarina';

	if (mode === 'morar') {
		return [
			`Localização em ${neighborhood}, com acesso facilitado a serviços e comércio.`,
			`Tipologias pensadas para conforto no dia a dia e praticidade urbana.`,
			`Infraestrutura de lazer e áreas comuns que elevam a qualidade de vida.`,
			`Projeto adequado para quem busca morar com segurança e conveniência.`,
			`Entorno em consolidação, com boa oferta de transporte e serviços em ${city}.`,
		];
	}

	return [
		`Região de ${neighborhood} com histórico de valorização em ${city}.`,
		`Demanda consistente por locação e revenda na categoria ${getCategoryLabel(property.category).toLowerCase()}.`,
		`Condições de pagamento que facilitam a composição da carteira imobiliária.`,
		`Potencial de rentabilidade em locação de médio e longo prazo.`,
		`Liquidez favorecida pela localização e pelo perfil do empreendimento.`,
	];
}

function buildFaq(property) {
	const financing = buildFinancingSimulation(property);
	const delivery = property.overview?.deliveryYear || property.statuses?.[0]?.name || NOT_INFORMED;
	const paymentSummary = financing.resumo
		? ` Condições informadas: ${financing.resumo}.`
		: '';

	return [
		{
			pergunta: 'Este imóvel aceita financiamento bancário?',
			resposta: financing.aceitaFinanciamento
				? `Sim. Trabalhamos com financiamento bancário e condições durante a obra.${paymentSummary} Use o simulador da página ou solicite uma proposta personalizada.`
				: financing.aceitaParcelas || financing.resumo
					? `As condições de pagamento incluem entrada e parcelas durante a obra.${paymentSummary} Consulte nossa equipe para simulação completa.`
					: 'Consulte nossa equipe para verificar as condições de pagamento disponíveis para este empreendimento.',
		},
		{
			pergunta: 'Posso usar o imóvel para morar ou investir?',
			resposta:
				'O empreendimento atende perfis residenciais e de investimento, com tipologias que permitem moradia, locação de longo prazo ou estratégias conforme a unidade escolhida.',
		},
		{
			pergunta: 'Qual a previsão de entrega?',
			resposta: `A entrega prevista informada para o empreendimento é ${delivery}. Valores e cronograma podem ser atualizados pela construtora.`,
		},
		{
			pergunta: 'Como agendar visita ou receber a tabela completa?',
			resposta:
				'Preencha o formulário ao lado ou fale conosco pelo WhatsApp. Respondemos em até 1 hora com plantas, valores e disponibilidade.',
		},
	];
}

function buildHighlights(property, plantas) {
	const highlights = [];

	if (property.labels?.length) {
		for (const label of property.labels.slice(0, 2)) {
			highlights.push({
				titulo: label.name,
				descricao: `Diferencial exclusivo do empreendimento.`,
				icone: 'fa-solid fa-building',
			});
		}
	}

	for (const feature of property.features?.slice(0, 4 - highlights.length) || []) {
		const slug = property.featureSlugs?.find((_, index) => property.features[index] === feature);
		highlights.push({
			titulo: feature,
			descricao: `Infraestrutura disponível no empreendimento.`,
			icone: mapFeatureIcon(feature, slug),
		});
	}

	if (plantas.length > 1) {
		highlights.push({
			titulo: 'Múltiplas plantas',
			descricao: `${plantas.length} opções de metragem e configuração disponíveis.`,
			icone: 'fa-solid fa-table-cells-large',
		});
	}

	return highlights.slice(0, 4);
}

function buildStats(property, plantas) {
	const areas = plantas.map((p) => p.areaPrivativaMin).filter(Boolean);
	const bedrooms = plantas.map((p) => p.quartos).filter(Boolean);
	const minArea = areas.length ? Math.min(...areas) : property.overview?.sizeSqm;
	const maxArea = areas.length ? Math.max(...areas) : property.overview?.sizeSqm;
	const minBedrooms = bedrooms.length ? Math.min(...bedrooms) : property.overview?.bedrooms;

	return {
		price: buildPriceLabel(property),
		bedrooms:
			minBedrooms != null
				? minBedrooms === 0
					? 'Studio'
					: `${minBedrooms}+ quartos`
				: NOT_INFORMED,
		area:
			minArea && maxArea
				? minArea === maxArea
					? `${minArea} m²`
					: `${minArea} a ${maxArea} m²`
				: property.overview?.sizeSqm
					? `${property.overview.sizeSqm} m²`
					: NOT_INFORMED,
		situacao: getCategoryLabel(property.category),
		unidadesRestantes: null,
	};
}

export function buildPropertyPageViewModel(property, slug) {
	const displayTitle = cleanPropertyTitle(property.title, property);
	const plantas = buildPlantas(property, slug);
	const galleryImages = (property.images || []).map((image) => ({
		url: getPropertyImageUrl(slug, image.file),
		alt: displayTitle,
	}));
	const stats = buildStats(property, plantas);
	const financing = buildFinancingSimulation(property);
	const cityName = property.address?.city?.name || NOT_INFORMED;
	const neighborhoodName = property.address?.neighborhood?.name || NOT_INFORMED;
	const seoTitle = `${displayTitle} — Apartamentos na planta em ${neighborhoodName}, ${cityName} | ${SITE_NAME}`;
	const seoDescription = `${getCategoryLabel(property.category)} ${displayTitle} em ${neighborhoodName}, ${cityName}. ${stats.price}. Veja plantas, fotos, condições de pagamento e fale com corretor credenciado.`;
	const whatsappText = encodeURIComponent(
		`Olá! Tenho interesse no empreendimento ${displayTitle} (cód. ${getPropertyCode(property)}).`,
	);

	const seoMeta = buildPropertySeo({
		title: displayTitle,
		description: seoDescription,
		neighborhoodName,
		category: property.category,
	});

	return {
		slug,
		whatsappNumber: WHATSAPP_NUMBER,
		whatsappUrl: `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappText}`,
		seo: {
			title: seoTitle,
			description: seoMeta.description,
			keywords: seoMeta.keywords,
			h1: displayTitle,
			jsonLd: buildPropertyRealEstateListingJsonLd({
				property,
				slug,
				displayTitle,
				description: seoDescription,
			}),
			ogImage: galleryImages[0]?.url,
		},
		nav: {
			city: cityName,
			neighborhood: neighborhoodName,
			title: displayTitle,
		},
		hero: {
			images: galleryImages,
			situacao: getCategoryLabel(property.category),
			padrao: property.labels?.[0]?.name || property.types?.[0]?.name || 'Lançamento',
			videoUrl: getPropertyVideoUrl(property),
			totalPhotos: galleryImages.length,
		},
		stats,
		ficha: buildFicha(property),
		sobre: property.descriptionHtml?.includes('<h5')
			? null
			: linkifyGlossaryContent(buildSobre(property)),
		descriptionHtml: linkifyGlossaryContent(property.descriptionHtml),
		highlights: buildHighlights(property, plantas),
		plantas,
		audience: {
			morar: linkifyGlossaryList(buildAudienceItems(property, 'morar')),
			investir: linkifyGlossaryList(buildAudienceItems(property, 'investir')),
		},
		comodidades: (property.features || []).map((nome, index) => ({
			nome,
			icone: mapFeatureIcon(nome, property.featureSlugs?.[index]),
		})),
		location: {
			label: buildLocationLabel(property),
			address: property.address?.street || buildLocationLabel(property),
			mapEmbedUrl: buildMapEmbedUrl(property),
			points: [],
		},
		financing,
		faq: linkifyFaqItems(buildFaq(property)),
		sidebar: {
			price: buildPriceLabel(property),
			code: getPropertyCode(property),
			showUrgency: false,
			construtora: NOT_INFORMED,
		},
		footer: {
			city: cityName,
			neighborhood: neighborhoodName,
			title: displayTitle,
			code: getPropertyCode(property),
		},
	};
}
