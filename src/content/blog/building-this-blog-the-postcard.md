---
title: 'Cards & Regards'
description: 'Building a postcard component in to allow users to leave digital postcards on my blog - iterations of the Web 1.0 guestbook idea.'
pubDate: 'Jul 31 2026'
heroImage: '../../assets/blog-placeholder-4.jpg'
series: 'Building This Blog'
seriesOrder: 6
cardImage: 'postcard.svg'
---

The [hero](/blog/building-this-blog-the-home-page/) left me with a gap in the bottom-right corner for my guestbook idea. I decided to implement the guestbook as sort of postcard entries because some strangers on reddit once posted some postcards to me from Germany and America which I still have and cherish to this day. So I scoured the interwebs for postcard designs, and found [this postcard on Pinterest](https://pin.it/1S0T2dBmJ) and decided on that design.

The rest of it is stitched together from CodePen. The perforated stamp edge and the smudged postmark are both mask tricks I learned from other people's pens. (Unfortunately I've lost the exact ones to the void once again but you can use [this pen](https://codepen.io/skopekreep/pen/xGBZVv) as inspo as well).

## The border

The pink frame around the card looks like `border: 20px solid pink`. It isn't.

The card's background is actually the pink. A pseudo-element then paints the cream face on top, leaving a gap around the edges that reads as a border:

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

Doing it this way I can round the pink and the cream by different amounts.

The `z-index: -1` keeps the cream layer behind the card's content, so the text still sits on top.

Alternatively, I could've had nested divs for simplicity as well, I might still do that in the future.

## Slots

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

> **Fallback content:** anything written *inside* the slot tags shows when nobody fills it. So `<Postcard />` on its own still renders a complete card, with the default message.

So the home page can use `<Postcard class="hero-postcard" />` as-is, while a future page can pass in its own words without duplicating the CSS.

## The stamp

The stamp has that scalloped, chewed-looking edge — the perforations. It's a photo with a piece of white paper on top of it, and the paper has bites taken out of its edges.

The photo is a `background` on `.stamp`, embedded as a base64 data URI so the component carries its own image. Then the paper:

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

> **`mask`:** decides which parts of an element you can see. Opaque areas show; transparent areas become invisible. It works a lot like `background`, so you can position, size and repeat multiple layers.

```css
radial-gradient(farthest-side at 50% 0%, #0000 60%, #000 0)
```

This creates one semicircular bite along the top edge. The transparent part becomes the hole; the solid part stays visible. Then it gets tiled across the edge. Four gradients — one for each side — give the paper a ring of bites all the way around.

> The paper can't be a parent of the photo. A mask clips everything inside it, so the photo would've been scalloped too.

So they're siblings: photo underneath, masked paper on top, with a hole in the middle for the photo to show through.

## The `--u` unit

Everything in the stamp is written as a multiple of one variable:

```css
.stamp-area {
    --u: 0.325cqi;   /* master scale — the stamp is drawn in multiples of it */
    height: calc(49 * var(--u));
}
```

The stamp, paper, scallops and postmark are all sized as multiples of `--u`. When the stamp came out too big against the card, I changed one number around.

## The postmark

The circular cancellation mark is one `<div>` with text in it. The circle and its two bars are drawn as backgrounds:

```css
background:
    radial-gradient(farthest-side, #0000 95%, #2369 0),                    /* the ring */
    linear-gradient(#2369 0 0) 50% 40% / 75% 2.25% no-repeat,              /* upper bar */
    linear-gradient(#2369 0 0) 50% 60% / 75% 2.25% no-repeat;              /* lower bar */
```

The ring uses the same gradient idea as the scallops, but inverted: the middle stays transparent, leaving a thin outline. The two bars are just solid-colour gradients positioned across it.

Then the whole thing gets a second mask so it looks stamped more naturally:

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

Seven layers of tiny dots, each with a slightly different size, offset and opacity. Because they don't line up neatly, they create speckle instead of an obvious repeating pattern. Some of the ink is missing, some of it is faint.

## Drawing wavy lines

The wavy lines trailing off the postmark are SVGs:

> **`q` and `t` in a path:** `q` draws a quadratic curve with one control point; `t` draws another one that mirrors the previous control point automatically. So one `q` plus three `t`s gives four alternating humps — a wave — without me writing out every control point.

They draw themselves in when the page loads:

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

`stroke-dasharray` and `stroke-dashoffset` hide the line at first, then slide it into view. The result is the usual SVG "draw itself" effect.

The `pathLength="600"` saves me from measuring each path separately. It lets all four waves use the same dash values, even though the actual paths are different lengths.

Each line waits a little longer than the one above it, same stagger idea as the [nav links](/blog/building-this-blog-the-nav/):

```css
.postmark-waves path:nth-child(2) { animation-delay: 0.08s; }
.postmark-waves path:nth-child(3) { animation-delay: 0.16s; }
.postmark-waves path:nth-child(4) { animation-delay: 0.24s; }
```

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

Welp, that's most of it for now. I'd be lying if I quite understand everything yet, but I shall be back!
