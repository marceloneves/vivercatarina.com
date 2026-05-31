import { getImoveisSitemapEntries, renderSitemapXml } from '../lib/sitemap.mjs';
import { createXmlResponse } from '../lib/sitemap-response.mjs';

export const prerender = true;

export function GET() {
	return createXmlResponse(renderSitemapXml(getImoveisSitemapEntries()));
}
