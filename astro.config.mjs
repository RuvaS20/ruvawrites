// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
	site: 'https://ruvawrites.pages.dev',
	integrations: [mdx(), sitemap(), icon()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Bricolage Grotesque',
			cssVariable: '--font-bricolage-grotesque',
			weights: ['200', '300', '400', '500', '600', '700', '800'],
			fallbacks: ['sans-serif']
		},
		{
			provider: fontProviders.google(),
			name: 'Manrope',
			cssVariable: '--font-manrope',
			weights: ['200', '300', '400', '500', '600', '700', '800', '900'],
			fallbacks: ['sans-serif']
		}
	],
});
