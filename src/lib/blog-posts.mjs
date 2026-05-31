import { buildMetaDescription } from './site-seo.mjs';

export const BLOG_POSTS = [];

export function getBlogPosts() {
	return BLOG_POSTS;
}

export function getBlogPost(slug) {
	return BLOG_POSTS.find((post) => post.slug === slug) ?? null;
}

export function getBlogPostMetaDescription(post) {
	if (!post) {
		return '';
	}

	if (post.metaDescription) {
		return buildMetaDescription('', post.metaDescription);
	}

	const keyword = getBlogPostSeoKeyword(post);

	return buildMetaDescription(keyword, post.excerpt);
}

function getBlogPostSeoKeyword(post) {
	const shortTitle = post.title.includes(':')
		? post.title.split(':')[0].trim()
		: post.title.trim();

	if (shortTitle.length <= 72) {
		return shortTitle;
	}

	return post.category ? `${post.category} Florianópolis` : 'imóveis na planta em Florianópolis';
}
