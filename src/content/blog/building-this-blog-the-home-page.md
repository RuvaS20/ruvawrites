---
title: 'Hero & Zero'
description: 'Laying out the hero page from scratch.'
pubDate: 'Jul 30 2026'
heroImage: '../../assets/blog-placeholder-2.jpg'
series: 'Building This Blog'
seriesOrder: 5
cardImage: 'hero.svg'
---

I finally started on the home page itself. I wanted something bold and a little playful / goofy (so much for Eric's clean aesthetic suggestion).

## Letting it breathe

Every page on this site was originally capped at a `720px` reading column by default. I overrode that by changing width and max-width as such:

```css
main {
    width: 100%;
    max-width: 100%;
}
```

> **Scoped styles:** in Astro, styles inside a page's `<style>` only apply to *that* page. So this `main` rule quietly overrides the global one here, and blog posts keep their cosy 720px. I later also overrode the blogposts one too.

The headings are deliberately huge, but "huge" on a laptop is "overflowing off the screen" on a phone. Rather than write three breakpoints, I let one line of CSS do the work:

```css
.hero-heading {
    font-size: clamp(2.5rem, 5.5vw, 6.5rem);
    text-transform: uppercase;
    font-weight: 900;
}
```

> **`clamp(min, preferred, max)`:** pick a size that grows with the viewport (`5.5vw`), but never smaller than `2.5rem` or bigger than `6.5rem`. No media queries.

## A stack of rows

The hero is just a vertical flex column split into three rows — a top row, a middle line, and a bottom row that holds two cards side by side:

## Illustrations

For now the illustration itself came out of [DiceBear Playground](https://www.dicebear.com/playground/) — a quick way to generate a n SVG avatar. The dream, though, is to *make* art like this myself with [lyned](https://lyned.vercel.app), my capstone project.

Still plenty of placeholder text to replace, but the bones are there, be they bare. Next I want to make those cards actually do something.
