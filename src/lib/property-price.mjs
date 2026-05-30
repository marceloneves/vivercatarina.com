const STARTING_PRICE_PATTERN =
	/a partir de[\s\S]{0,50}?R\$\s*(\d{1,3}(?:\.\d{3})+,\d{2})/gi;

export function parseUsDisplayPrice(display) {
	if (!display) {
		return null;
	}

	const match = display.match(/R\$\s*([\d,]+)/);
	if (!match) {
		return null;
	}

	const parts = match[1].split(',');
	if (parts.length > 1 && parts.every((part) => /^\d{1,3}$/.test(part))) {
		return Number(parts.join(''));
	}

	const digits = display.replace(/[^\d]/g, '');
	return digits ? Number(digits) : null;
}

export function formatUsDisplayPrice(amount) {
	if (amount == null || Number.isNaN(amount)) {
		return null;
	}

	return `R$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function extractStartingPricesFromHtml(html) {
	if (!html) {
		return [];
	}

	const prices = [];

	for (const match of html.matchAll(STARTING_PRICE_PATTERN)) {
		const context = html.slice(Math.max(0, match.index - 30), match.index).toLowerCase();
		if (/entrada\s*$/.test(context.trim()) || /vaga[^a]{0,40}$/.test(context)) {
			continue;
		}

		prices.push(Number(match[1].replace(/\./g, '').replace(',', '.')));
	}

	return prices;
}

export function resolvePropertyPrice({ display, prefix, amount, descriptionHtml }) {
	const displayAmount = parseUsDisplayPrice(display);
	let resolvedAmount = displayAmount ?? amount ?? null;

	const startingPrices = extractStartingPricesFromHtml(descriptionHtml);
	const normalizedPrefix = prefix?.trim().toLowerCase();

	if (startingPrices.length > 0 && normalizedPrefix === 'a partir de') {
		const minimumStartingPrice = Math.min(...startingPrices);

		if (
			displayAmount &&
			displayAmount !== minimumStartingPrice &&
			Number.isInteger(displayAmount / minimumStartingPrice) &&
			displayAmount / minimumStartingPrice === 10
		) {
			resolvedAmount = minimumStartingPrice;
		}
	}

	return {
		prefix: prefix || null,
		display: formatUsDisplayPrice(resolvedAmount) || display || null,
		amount: resolvedAmount,
		currency: 'BRL',
	};
}
