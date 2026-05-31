/** @typedef {{ text: string, href: string, caseSensitive?: boolean, linkClass?: string }} LinkRule */

const SKIP_TAG_NAMES = new Set(['script', 'style', 'pre', 'code', 'noscript', 'textarea']);
const HEADING_OPEN = /^<h[1-6]\b/i;
const HEADING_CLOSE = /^<\/h[1-6]>/i;
const SKIP_LINK_CLASSES = ['blog-inner-title', 'blog-subsection-title', 'glossary-term'];

function escapeRegex(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildLinkRegex(rule) {
	const escaped = escapeRegex(rule.text);

	if (rule.caseSensitive) {
		return new RegExp(`(?<![\\wÀ-ú])(${escaped})(?![\\wÀ-ú])`);
	}

	return new RegExp(`(?<![\\wÀ-ú])(${escaped})(?![\\wÀ-ú])`, 'i');
}

function splitOutsideAnchors(html) {
	return html.split(/(<a\b[^>]*>[\s\S]*?<\/a>)/gi).map((part) => ({
		linked: /^<a\b/i.test(part),
		content: part,
	}));
}

function applyRuleOutsideAnchors(html, rule) {
	const regex = buildLinkRegex(rule);

	return splitOutsideAnchors(html)
		.map(({ linked, content }) => {
			if (linked || !regex.test(content)) {
				return content;
			}

			const classAttr = rule.linkClass ? ` class="${rule.linkClass}"` : '';
			return content.replace(regex, `<a href="${rule.href}"${classAttr}>$1</a>`);
		})
		.join('');
}

function opensNoLinkZone(tag) {
	if (!tag.startsWith('<') || tag.startsWith('</')) {
		return false;
	}

	const tagNameMatch = tag.match(/^<(\w+)/);
	if (tagNameMatch && SKIP_TAG_NAMES.has(tagNameMatch[1].toLowerCase())) {
		return true;
	}

	if (HEADING_OPEN.test(tag)) {
		return true;
	}

	return SKIP_LINK_CLASSES.some((className) =>
		new RegExp(`class="[^"]*\\b${className}\\b`, 'i').test(tag),
	);
}

function closesNoLinkZone(tag) {
	if (!tag.startsWith('</')) {
		return false;
	}

	const match = tag.match(/^<\/(\w+)/);
	if (!match) {
		return false;
	}

	const tagName = match[1].toLowerCase();

	if (SKIP_TAG_NAMES.has(tagName)) {
		return true;
	}

	return ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName);
}

function linkifyTextNode(text, rules) {
	if (!text.trim()) {
		return text;
	}

	let result = text;

	for (const rule of rules) {
		result = applyRuleOutsideAnchors(result, rule);
	}

	return result;
}

/** @param {string} html @param {LinkRule[]} rules @param {{ skipHeadings?: boolean }} [options] */
export function linkifyHtmlContent(html, rules, options = {}) {
	if (!html || !rules.length) {
		return html;
	}

	const { skipHeadings = true } = options;
	const parts = html.split(/(<[^>]+>)/);
	let skipLinkifyDepth = 0;

	return parts
		.map((part) => {
			if (part.startsWith('<')) {
				if (skipHeadings && opensNoLinkZone(part)) {
					skipLinkifyDepth += 1;
				} else if (skipHeadings && closesNoLinkZone(part) && skipLinkifyDepth > 0) {
					skipLinkifyDepth -= 1;
				}

				return part;
			}

			if (skipLinkifyDepth > 0) {
				return part;
			}

			return linkifyTextNode(part, rules);
		})
		.join('');
}
