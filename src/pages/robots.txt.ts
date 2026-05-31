import { buildRobotsTxt } from '../lib/sitemap.mjs';
import { createPlainTextResponse } from '../lib/sitemap-response.mjs';

export const prerender = true;

export function GET() {
	return createPlainTextResponse(buildRobotsTxt());
}
