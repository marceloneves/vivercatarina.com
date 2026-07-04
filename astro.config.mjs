// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { SITE_URL } from './src/lib/site-contact.mjs';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel(),
	site: SITE_URL,
	build: {
		// Inline do CSS scoped gerado pelo Astro: remove requests render-blocking.
		inlineStylesheets: 'always',
	},
	redirects: {
		'/blog': '/',
		'/blog-details': '/',
	},
	vite: {
		server: {
			watch: {
				ignored: ['**/src/data/imoveis/**'],
			},
		},
	},
});
