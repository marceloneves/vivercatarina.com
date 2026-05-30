import {
	appendWhatsAppLead,
	buildWhatsAppRedirectUrl,
	validateWhatsAppLead,
} from '../../lib/whatsapp-leads-store.mjs';

export const prerender = false;

export async function POST({ request }) {
	let body;

	try {
		body = await request.json();
	} catch {
		return new Response(JSON.stringify({ error: 'Dados inválidos.' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	const validationError = validateWhatsAppLead(body);

	if (validationError) {
		return new Response(JSON.stringify({ error: validationError }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' },
		});
	}

	try {
		const entry = appendWhatsAppLead({
			name: body.name,
			phone: body.phone,
			source: body.source,
			pageUrl: body.pageUrl,
			propertySlug: body.propertySlug,
		});

		return new Response(
			JSON.stringify({
				ok: true,
				id: entry.id,
				redirectUrl: buildWhatsAppRedirectUrl(body.name, {
					propertyTitle: body.propertyTitle,
				}),
			}),
			{
				status: 201,
				headers: { 'Content-Type': 'application/json' },
			},
		);
	} catch {
		return new Response(JSON.stringify({ error: 'Não foi possível registrar seu contato.' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
