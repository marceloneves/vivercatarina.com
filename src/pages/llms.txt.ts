import { buildLlmsTxt } from '../lib/sitemap.mjs';
import { createMarkdownResponse } from '../lib/sitemap-response.mjs';

export const prerender = true;

export function GET() {
	return createMarkdownResponse(buildLlmsTxt());
}
