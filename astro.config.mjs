// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: vercel(),
	site: 'https://florianopolis.vivercatarina.com',
	vite: {
		server: {
			watch: {
				ignored: ['**/src/data/imoveis/**'],
			},
		},
	},
});
