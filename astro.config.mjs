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
			// Headings, site-wide.
			provider: fontProviders.google(),
			name: 'Lato',
			cssVariable: '--font-lato',
			weights: ['700', '900'],
			fallbacks: ['sans-serif']
		},
		{
			// Body copy.
			provider: fontProviders.google(),
			name: 'Manrope',
			cssVariable: '--font-manrope',
			weights: ['400', '500', '600', '700'],
			fallbacks: ['sans-serif']
		},
		{
			// Display face for the sketched words in the home page hero.
			provider: fontProviders.google(),
			name: 'Cabin Sketch',
			cssVariable: '--font-cabin-sketch',
			weights: ['700'],
			fallbacks: ['sans-serif']
		},
		{
			// Postcard heading.
			provider: fontProviders.google(),
			name: 'Buda',
			cssVariable: '--font-buda',
			weights: ['300'],
			fallbacks: ['serif']
		},
		{
			// Postcard handwriting.
			provider: fontProviders.google(),
			name: 'The Girl Next Door',
			cssVariable: '--font-the-girl-next-door',
			weights: ['400'],
			fallbacks: ['cursive']
		}
	],
});
