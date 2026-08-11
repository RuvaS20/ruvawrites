---
title: 'Hero & Zero'
description: 'Laying out the hero from scratch, and working out what the front page should say before anyone scrolls past it.'
pubDate: 'Jul 30 2026'
heroImage: '../../assets/blog-placeholder-2.jpg'
series: 'Building This Blog'
seriesOrder: 5
cardImage: 'hero.svg'
---

With the [nav](/blog/building-this-blog-the-nav/) sorted, I finally started on the home page itself. I wanted something bold (so much for Eric's clean suggestion) and a little playful up top. Here's how the hero came together.

---

## Letting it breathe

Every page on this site is capped at a tidy `720px` reading column, which is lovely for blog posts and far too narrow for a hero. Astro scopes a component's `<style>` to that component, so I could override just the home page without touching anything else:

```css
main {
	width: 100%;
	max-width: 100%;
}
```

> **Scoped styles:** in Astro, styles inside a page's `<style>` only apply to *that* page. So this `main` rule quietly overrides the global one here, and blog posts keep their cosy 720px.

The headings are deliberately huge, but "huge" on a laptop is "overflowing off the screen" on a phone. Rather than write three breakpoints, I let one line of CSS do the work:

```css
.hero-heading {
	font-size: clamp(2.5rem, 5.5vw, 6.5rem);
	text-transform: uppercase;
	font-weight: 900;
}
```

> **`clamp(min, preferred, max)`:** pick a size that grows with the viewport (`5.5vw`), but never smaller than `2.5rem` or bigger than `6.5rem`. Responsive text with no media queries.

---

## A stack of rows

The hero is just a vertical flex column split into three rows — a top row, a middle line, and a bottom row that holds two cards side by side:

```css
#hero {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
#hero-bottom {
	display: flex;
	gap: 1.5rem;
	align-items: stretch;
}
```

The `align-items: stretch` is the quiet hero here: it makes both cards match the height of the taller one automatically, so the layout stays even no matter how much text goes in each. On mobile, one media query flips `#hero-bottom` to `flex-direction: column` and they stack.

---

## Illustrations

For now the illustration itself came out of [DiceBear Playground](https://www.dicebear.com/playground/) — a quick way to generate a tidy little SVG avatar. The dream, though, is to *make* art like this myself: I'm hoping to dig into [lyned](https://lyned.vercel.app), my capstone project, and come out the other side able to produce SVG illustrations of my own.."

---

## What I want future-me to remember

- **Scoped styles let one page break the rules.** The site-wide `720px` cap is overridden right here in the page's own `<style>` — no global changes, no side effects.
- **`clamp()` replaces breakpoints for text.** One line gives fluid, bounded font sizes.
- **`align-items: stretch` equalises card heights for free** — no fixed heights, no JS.
- **`astro-icon` makes my own SVGs first-class.** Anything in `src/icons/` is just `<Icon name="..." />`.

Still plenty of placeholder text to replace, but the bones are there. Next I want to make those cards actually *mean* something.

Oh — and one of those placeholder cards is a little testimonial that says *"you should definitely make a guestbook."* I took my own advice a bit too seriously and have started sketching out my own self-hostable guestbook — no logins, no foreign iframes, just a stranger leaving a note. More on that soon.
