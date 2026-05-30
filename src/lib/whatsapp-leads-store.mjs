import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { SITE_WHATSAPP_NUMBER } from './site-contact.mjs';

const LEADS_PATH = join(process.cwd(), 'data', 'whatsapp-leads.json');

export function normalizePhoneDigits(phone) {
	return String(phone || '').replace(/\D/g, '');
}

export function getBrazilianLocalPhoneDigits(phone) {
	let digits = normalizePhoneDigits(phone);

	if (digits.startsWith('55') && digits.length > 11) {
		digits = digits.slice(2);
	}

	return digits;
}

export function validateWhatsAppLead({ name, phone }) {
	const trimmedName = String(name || '').trim();

	if (trimmedName.length < 2) {
		return 'Informe seu nome.';
	}

	const digits = getBrazilianLocalPhoneDigits(phone);

	if (digits.length < 10 || digits.length > 11) {
		return 'Informe um telefone válido com DDD.';
	}

	return null;
}

export function buildWhatsAppRedirectUrl(name, { propertyTitle } = {}) {
	const trimmedName = String(name).trim();
	const message = propertyTitle
		? `Olá! Meu nome é ${trimmedName}. Tenho interesse no imóvel ${propertyTitle}.`
		: `Olá! Meu nome é ${trimmedName}. Vim pelo site Na Planta SC e gostaria de mais informações.`;

	return `https://wa.me/${SITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function appendWhatsAppLead({ name, phone, source, pageUrl, propertySlug }) {
	mkdirSync(dirname(LEADS_PATH), { recursive: true });

	const leads = existsSync(LEADS_PATH)
		? JSON.parse(readFileSync(LEADS_PATH, 'utf8'))
		: [];

	const entry = {
		id: randomUUID(),
		name: String(name).trim(),
		phone: String(phone).trim(),
		phoneDigits: getBrazilianLocalPhoneDigits(phone),
		source: source || 'unknown',
		pageUrl: pageUrl || null,
		propertySlug: propertySlug || null,
		createdAt: new Date().toISOString(),
	};

	leads.push(entry);
	writeFileSync(LEADS_PATH, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');

	return entry;
}
