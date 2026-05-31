import { getBlogPosts } from './blog-posts.mjs';

function normalizeText(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();
}

function scorePostForNeighborhood(post, neighborhoodName) {
	const target = normalizeText(neighborhoodName);

	if (!target) {
		return 0;
	}

	let score = 0;

	if (normalizeText(post.title).includes(target)) {
		score += 12;
	}

	if (normalizeText(post.excerpt).includes(target)) {
		score += 8;
	}

	for (const tag of post.tags) {
		const normalizedTag = normalizeText(tag);

		if (normalizedTag === target) {
			score += 10;
		} else if (normalizedTag.includes(target)) {
			score += 4;
		}
	}

	return score;
}

export function getNeighborhoodBlogPosts(neighborhoodName, limit = 3) {
	if (!neighborhoodName || neighborhoodName === 'Não informado') {
		return [];
	}

	const posts = getBlogPosts();
	const ranked = posts
		.map((post) => ({ post, score: scorePostForNeighborhood(post, neighborhoodName) }))
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score || b.post.datePublished.localeCompare(a.post.datePublished));

	const selected = [];
	const usedSlugs = new Set();

	for (const { post } of ranked) {
		if (selected.length >= limit) {
			break;
		}

		selected.push(post);
		usedSlugs.add(post.slug);
	}

	return selected.slice(0, limit);
}
