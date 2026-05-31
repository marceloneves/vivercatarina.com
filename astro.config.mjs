// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import { SITE_URL } from './src/lib/site-contact.mjs';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel(),
	site: SITE_URL,
	vite: {
		server: {
			watch: {
				ignored: ['**/src/data/imoveis/**'],
			},
		},
	},
});
