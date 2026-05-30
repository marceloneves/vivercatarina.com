// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	output: 'static',
	adapter: node({ mode: 'standalone' }),
	site: 'https://naplantasc.com.br',
	vite: {
		server: {
			watch: {
				ignored: ['**/src/data/imoveis/**'],
			},
		},
	},
});
