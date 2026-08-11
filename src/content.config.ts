import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
			// Group posts into an ordered series
			series: z.string().optional(),
			seriesOrder: z.number().optional(),
			// Filename of the SVG in `src/assets/svg/` used on the post card.
			// Falls back to flowers_default.svg when omitted.
			cardImage: z.string().optional(),
		}),
});

export const collections = { blog };
