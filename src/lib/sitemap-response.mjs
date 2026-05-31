/**
 * @param {string} body
 * @param {string} contentType
 */
export function createTextResponse(body, contentType) {
	return new Response(body, {
		headers: {
			'Content-Type': contentType,
		},
	});
}

export function createXmlResponse(body) {
	return createTextResponse(body, 'application/xml; charset=utf-8');
}

export function createPlainTextResponse(body) {
	return createTextResponse(body, 'text/plain; charset=utf-8');
}

export function createMarkdownResponse(body) {
	return createTextResponse(body, 'text/plain; charset=utf-8');
}
