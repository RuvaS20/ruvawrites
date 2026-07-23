---
title: 'Building This Blog: Fonts & Footers'
description: 'Learning about the Astro’s font API, and importing SVG icons with astro-icon.'
pubDate: 'Jul 23 2026'
heroImage: '../../assets/blog-placeholder-4.jpg'
---

After the long and tedious stuff of [theme toggle](/blog/building-this-blog-theme-toggle/), I have turned to the simpler stuff: the font and the footer. So this is a short one for me to remember basics.

---

## Swapping the font

I learnt that Astro has a built-in font API, so I don't hand-write `@font-face` rules or drop `<link>` tags in the head. I just describe the font I want in `astro.config.mjs` and Astro handles the rest. This is how I do it:

```js
// astro.config.mjs
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'Manrope',
			cssVariable: '--font-manrope',
			weights: [400, 600, 700],
			fallbacks: ['sans-serif'],
		},
	],
});
```

I set the `cssVariable` on `body` in `global.css`, and everything inherits it e.g:

```css
body {
	font-family: var(--font-manrope);
}
```

Not so fun fact for me: **if you don't list `weights`, Astro only loads `[400]`. So you gotta list out all the font weights you want.

---

## Footer work

I wanted the copyright on the left and the social icons on the right, sitting on the same line. The whole trick is one flex container:

```css
footer {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: space-between;
	gap: 1em;
}
```

`justify-content: space-between` pushes the two children to opposite ends. I ended up using space-around though - it just looked better. `align-items: center` lines them up vertically. 

The markup is just two spans — the second one holds the links:

```astro
<footer>
	<span class="footer-rights">
		{today.getFullYear()} &copy; <span>Ruvarashe Sadya</span>. All rights reserved.
	</span>
	<span class="social-links">
		<!-- icons go here -->
	</span>
</footer>
```

---

## Importing icons with astro-icon

I downloaded some SVGs and wanted to use them without pasting giant `<svg>` blobs into my markup. The clean way in Astro is the **astro-icon** integration.

You gotta npm install it `npm install astro-icon` , then add it to the config:

```js
// astro.config.mjs
import icon from 'astro-icon';

integrations: [mdx(), sitemap(), icon()],
```

astro-icon reads local SVGs from **`src/icons/`** by default, and the filename becomes the icon's name:

```text
src/icons/
├── email.svg
├── linkedin.svg
└── github.svg
```

Then I drop them in wherever, by name:

```astro
---
import { Icon } from 'astro-icon/components';
---

<a href="mailto:ruvarashe.sadya@gmail.com" aria-label="Email">
	<Icon name="email" />
</a>
<a href="https://github.com/ruvas20" target="_blank" rel="noopener" aria-label="GitHub">
	<Icon name="github" />
</a>
```


---

## What I want future-me to remember

- Astro's font API gives you a **CSS variable**, not an applied font — point `body { font-family }` at it yourself.
- List every weight you use, or Astro only loads 400 and your `font-weight` silently falls back. Restart the dev server after changing font config.
- One `display: flex` + `justify-content: space-between` puts the footer on a line. 
- astro-icon reads `src/icons/`, filename = name. 
