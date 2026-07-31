---
title: 'Building This Blog: Cards & Regards'
description: 'Building a postcard component in pure CSS — container units, a fake border, a perforated stamp, and a smudged postmark.'
pubDate: 'Jul 31 2026'
heroImage: '../../assets/blog-placeholder-4.jpg'
---

The [hero](/blog/building-this-blog-the-home-page/) left me with a gap in the bottom-right corner for my guestbook idea. I decided to implement the guestbook as sort of postcard entries because some strangers on reddit once posted some postcards to me from Germany and America which I still have and cherish to this day. So I scoured the interwebs for postcard designs, and found [this postcard on Pinterest](https://pin.it/1S0T2dBmJ) and decided on that design.

The rest of it is stitched together from CodePen. The perforated stamp edge and the smudged postmark are both mask tricks I learned from other people's pens. (Unfortunately I've lost the exact ones to the void once again but you can use [this pen](https://codepen.io/skopekreep/pen/xGBZVv) as inspo as well).

---

## The border that isn't a border

The pink frame around the card looks like `border: 20px solid pink`. It isn't.

The card's background *is* the pink. Then a pseudo-element paints the cream face on top of it, inset by a fixed amount, and the gap around the edges is what you read as a border:

```css
.postcard {
	background-color: var(--pink-border);
	border: none;
	position: relative;
	z-index: 1;
}

.postcard::before {
	content: '';
	position: absolute;
	inset: 2.5cqi;      /* the pink gap that reads as a border */
	background-color: var(--cream-bg);
	border-radius: 2cqi;
	z-index: -1;
}
```

> **`inset`:** shorthand for `top`, `right`, `bottom` and `left` at once. `inset: 2.5cqi` means "sit 2.5cqi in from every edge of the parent."

Why bother, when a real border would do? Because a border sits *outside* the padding box and doesn't take a `border-radius` independently of the element, so the inner corners and outer corners are locked together. Doing it this way I can round the pink and the cream by different amounts, and later I can make the "border" a gradient or a texture without touching anything else.

The `z-index: -1` puts the cream layer behind the card's own content but still in front of the pink background, which is the bit I always get wrong and have to fiddle with.

---

## Sizing the whole card off its container

This was the part I actually wanted to get right. I designed the card at 800px wide, but it lives in a hero column on desktop and a full-width stack on mobile, and I didn't want to write breakpoints for the stamp.

So there are no `px` anywhere in the layout. Every length is in `cqi`.

> **`cqi`:** 1% of the *container's* inline size — its width, in a normal left-to-right layout. `50cqi` is half the container's width, whatever that turns out to be.

For that unit to mean anything, some ancestor has to volunteer as the container:

```css
.postcard-wrap {
	container-type: inline-size;
	width: 100%;
}
```

That one line is what makes `cqi` resolve. Without it the unit falls back to the nearest containing block, which in practice means the viewport, and nothing behaves.

The conversion from the original design is just arithmetic. The card was 800px wide with 35px of padding, so:

```
35 / 800 = 4.375%  →  padding: 4.375cqi
```

The header was 56px, which is `7cqi`. The inset was 20px, which is `2.5cqi`. Every number in the file came out of that one division.

The last piece is the shape:

```css
.postcard {
	width: 100%;
	aspect-ratio: 1.5;
}
```

> **`aspect-ratio`:** lock the height to the width by a ratio. `1.5` means "always half again as wide as it is tall," so the card can never go squat or letterboxed.

The result is that the parent sets a width and the card handles everything else. On the home page the entire styling for it is one rule:

```css
.hero-postcard {
	margin-top: auto;   /* sits at the bottom, level with the left card */
}
```

---

## Slots, so it isn't the same card twice

The card takes a few props for the small text — the heading, the postmark lines, the stamp's alt text — but the message and the sign-off are `<slot>`s:

```astro
<p class="post-message">
	<slot name="message">
		No leaves are brown<br />
		I miss the seasons in Harare<br />
		...
	</slot>
</p>
```

> **Named slot:** a hole in a component that the parent fills. `<slot name="message" />` is filled by whatever the parent passes with `slot="message"`.

> **Fallback content:** anything written *inside* the slot tags shows when nobody fills it. So `<Postcard />` on its own still renders a complete card, with the default message.

Which means the home page can drop in `<Postcard class="hero-postcard" />` and get the full thing, and a future page can pass its own words without me duplicating 300 lines of CSS.

---

## The stamp

The stamp has that scalloped, chewed-looking edge — the perforations. There's no image of a stamp anywhere; it's a photo with a piece of white paper on top of it, and the paper has bites taken out of its edges.

The photo is a `background` on `.stamp`, embedded as a base64 data URI so the component carries its own image and doesn't need a file sitting next to it. Then the paper:

```css
.stamp::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: calc(40 * var(--u));   /* slightly larger than the photo */
	height: calc(49 * var(--u));
	background: #fffff9;
	mask:
		radial-gradient(farthest-side at 50% 0%,   #0000 60%, #000 0) calc(-2.25 * var(--u)) 0    / calc(4.5 * var(--u)) calc(2.25 * var(--u)) repeat-x,
		radial-gradient(farthest-side at 50% 100%, #0000 60%, #000 0) calc(-2.25 * var(--u)) 100% / calc(4.5 * var(--u)) calc(2.25 * var(--u)) repeat-x,
		radial-gradient(farthest-side at 0% 50%,   #0000 60%, #000 0) 0    calc(-2.25 * var(--u)) / calc(2.25 * var(--u)) calc(4.5 * var(--u)) repeat-y,
		radial-gradient(farthest-side at 100% 50%, #0000 60%, #000 0) 100% calc(-2.25 * var(--u)) / calc(2.25 * var(--u)) calc(4.5 * var(--u)) repeat-y;
}
```

> **`mask`:** an image that decides which parts of an element you can see. Where the mask image is opaque, the element shows. Where it's transparent, the element is invisible. It takes all the same values as `background` — position, size, `repeat-x`, layers separated by commas.

Take one line:

```css
radial-gradient(farthest-side at 50% 0%, #0000 60%, #000 0)
```

A circle centred on the top edge (`at 50% 0%`) that is **transparent** out to 60% of its radius and **solid black** past that. As a mask, transparent means "punch a hole here." So this gradient is a single semicircular bite out of the top edge.

Then it gets tiled. The size `4.5u × 2.25u` makes each tile twice as wide as it is tall, `repeat-x` runs the tiles along the top edge, and the `-2.25u` offset shifts the whole row half a tile left so the scallops sit where I want them. Four gradients, four edges, and the paper ends up with a ring of bites all the way around.

The one that cost me time is in a comment in the file:

> The paper must **not** be a parent of the photo. A mask clips everything inside the element, not just the element's own background — so wrapping the photo in the masked layer would have masked the photo too, and I'd have got a scalloped photo instead of a scalloped frame.

So they're siblings in painting order: photo underneath, masked paper on top, punched out in the middle so the photo shows through the hole.

---

## The `--u` unit

Everything in the stamp is written as a multiple of one variable:

```css
.stamp-area {
	--u: 0.325cqi;   /* master scale — the stamp is drawn in multiples of it */
	height: calc(49 * var(--u));
}
```

The stamp is `36u × 45u`, the paper is `40u × 49u`, the scallops are `2.25u`, the postmark circle is `36u`. When the stamp came out too big against the card, I changed `--u` from one number to another and every part of it moved together. Doing that with twenty separate `cqi` values would have been a bad afternoon.

---

## The postmark

The circular cancellation mark is one `<div>` with text in it. The circle and its two bars are drawn as backgrounds:

```css
background:
	radial-gradient(farthest-side, #0000 95%, #2369 0),                    /* the ring */
	linear-gradient(#2369 0 0) 50% 40% / 75% 2.25% no-repeat,              /* upper bar */
	linear-gradient(#2369 0 0) 50% 60% / 75% 2.25% no-repeat;              /* lower bar */
```

The ring is the same trick as the scallops, inverted: transparent out to 95%, coloured after that, which leaves a thin outline instead of a filled disc. The bars are solid-colour gradients squashed to 2.25% tall and positioned at 40% and 60% down.

> **`linear-gradient(#2369 0 0)`:** a gradient from a colour to itself, which is just a rectangle of that colour. It's the shortest way to make a solid block you can size and position like a background image.

> **`#2369`:** an 8-digit-style hex in shorthand — `#2369` is `#223366` at 60% opacity. Four digits means RGBA, one digit each.

Then the whole thing gets a second mask so it looks stamped by a tired hand rather than printed:

```css
mask:
	radial-gradient(#0008, #0000 70%) 3% 3% / 5% 5%,
	radial-gradient(#000c, #0000 50%) 5% 5% / 7% 7%,
	radial-gradient(#0008, #0000 40%) 7% 7% / 11% 11%,
	radial-gradient(#0005, #0000 30%) 11% 11% / 13% 13%,
	radial-gradient(#000f, #0000 70%) 5% 5% / 13% 11%,
	radial-gradient(#000a, #0000 50%) 7% 9% / 14% 12%,
	radial-gradient(#0008, #0000 30%) 9% 11% / 9% 8%;
```

Seven layers of tiny dots, each at a slightly different tile size, offset and opacity. Because none of the tile sizes divide evenly into each other, the layers never line up the same way twice across the circle, and the overlap comes out as speckle rather than a pattern. Some of the ink is missing, some of it is faint. That's the whole effect.

I didn't derive those numbers. I nudged them until it looked right, which I think is the honest answer for most of this file.

---

## Drawing the killer bars

The wavy lines trailing off the postmark are SVG, because CSS is bad at wobbles:

```astro
<svg class="postmark-waves" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true">
	<path pathLength="600" d="M2 8 q 14.75 -8 29.5 0 t 29.5 0 t 29.5 0 t 29.5 0" />
	<!-- three more, at y = 22, 36, 50 -->
</svg>
```

> **`q` and `t` in a path:** `q` draws a quadratic curve with one control point; `t` draws another one that mirrors the previous control point automatically. So one `q` plus three `t`s gives four alternating humps — a wave — without me writing out every control point.

They draw themselves in when the page loads, which is the bit I like:

```css
.postmark-waves path {
	stroke-dasharray: 600;
	stroke-dashoffset: 600;
	animation: stamp 1.2s ease forwards;
}

@keyframes stamp {
	to { stroke-dashoffset: 0; }
}
```

> **`stroke-dasharray`:** turns a line into dashes. Set the dash length to the full length of the path and you get one dash and one gap, each as long as the whole line.

> **`stroke-dashoffset`:** slides the dash pattern along the path. At `600` the gap is over the visible line, so nothing shows. Animating it to `0` slides the dash into place, and the line appears to be drawn.

The `pathLength="600"` is what makes those numbers safe. Normally you'd have to measure the real length of each path (in JS, usually) to know what to put in `dasharray`. `pathLength` tells the browser "pretend this path is 600 units long, whatever it actually is," so all four waves use the same two numbers even though they're different lengths.

Each line waits a little longer than the one above it, same stagger idea as the [nav links](/blog/building-this-blog-the-nav/):

```css
.postmark-waves path:nth-child(2) { animation-delay: 0.08s; }
.postmark-waves path:nth-child(3) { animation-delay: 0.16s; }
.postmark-waves path:nth-child(4) { animation-delay: 0.24s; }
```

And since this is decoration and nobody asked for it to move:

```css
@media (prefers-reduced-motion: reduce) {
	.postmark-waves path {
		animation: none;
		stroke-dashoffset: 0;
	}
}
```

> **`prefers-reduced-motion`:** an OS-level setting some people turn on because animation makes them ill. Honouring it costs four lines. The mark still ends up fully drawn — it just skips the drawing.

The `<svg>` is `aria-hidden="true"`, as is the postmark text, because neither means anything to someone listening to the page. The stamp itself gets `role="img"` and a real `aria-label`, since it's a photo and worth describing.

---

## The crooked bits

Two rotations do most of the work of making it feel handmade:

```css
.post-message {
	font-family: 'The Girl Next Door', cursive;
	transform: rotate(-1deg);   /* slight rotation for a handmade feel */
}

.sign-off {
	font-family: 'The Girl Next Door', cursive;
	transform: rotate(-12deg);
	margin-top: auto;           /* pushed to the bottom of the column */
}
```

One degree on the message is almost nothing. You don't consciously see it, but perfectly level handwriting reads as fake, and this fixes that for one line of CSS. Twelve degrees on the sign-off is the opposite — obvious, and meant to be, like it was squeezed in at the end.

The address lines are four empty `<div>`s with a bottom border. That's the entire trick:

```css
.address-line {
	border-bottom: max(1px, 0.125cqi) solid var(--dark-ink);
}
```

The `max(1px, 0.125cqi)` is there because at small container widths `0.125cqi` rounds down to something the browser renders as nothing, and the lines vanish. `max()` sets a floor so they stay visible however small the card gets.

---

## What I want future-me to remember

- **A background plus an inset pseudo-element gives you a border you can actually control.** Round the outside and the inside by different amounts, or make one of them a gradient later.
- **`container-type: inline-size` on a wrapper, then everything in `cqi`.** Design at a fixed width, divide every measurement by that width, and the component becomes responsive with no media queries. This was the big one.
- **`mask` takes the same values as `background`** — layers, positions, sizes, `repeat-x`. Transparent punches a hole, opaque keeps the pixels.
- **A mask clips descendants.** If I want to mask a frame around a photo, the frame has to be a *sibling* of the photo, not its parent.
- **`pathLength` frees you from measuring SVG paths.** Declare a fake length and `stroke-dasharray` / `stroke-dashoffset` become predictable numbers you can reuse across every path.
- **One local variable (`--u`) for a cluster of related sizes.** Rescaling the stamp was one edit instead of twenty.
- **`max(1px, …)` keeps hairlines from disappearing** when a fluid unit rounds down to zero.

The card is sitting in the hero for now, but we'll work on other ideas as they come.
