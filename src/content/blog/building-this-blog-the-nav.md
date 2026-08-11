---
title: 'Nav & Ham'
description: 'Cleaning up the nav, and building hamburger menu for mobile.'
pubDate: 'Jul 24 2026'
heroImage: '../../assets/blog-placeholder-3.jpg'
series: 'Building This Blog'
seriesOrder: 4
---

After building the [fonts and footer](/blog/building-this-blog-fonts-and-footers/), I started on making the nav. I'm going for a clean design for this portfolio so i'm trying my best start bit by bit with that. Restraint is quite hard bu it can be very rewarding.

This time I also remembered to keep track of my muse. Today's hamburger design inspo came from [this CodePen by lmgonzalves](https://codepen.io/lmgonzalves/pen/KaWaJO). Many thanks to you, oh lovely internet stranger.

---

## The checkbox hack

I'm loving the minimal JS of the design of the hamburger.

It all comes down to a plain **checkbox**. A checkbox has exactly two states — ticked or not — and the browser remembers that. So the whole plan is:

1. Put an invisible checkbox on the page.
2. When it's ticked, the menu is open. When it's unticked, the menu is closed.
3. Style the menu based on the checkbox's state.

This is such a well-worn trick it has a name.

> **The checkbox hack:** using a hidden checkbox to store an on/off state, so CSS alone can build things that seem interactive — menus, tabs, accordions, modals — with no JavaScript.

I wonder what else I can do with this hack.

---

## Step 1: the hidden checkbox and its button

Everything starts with two elements: a hidden checkbox and a label that acts as the button. Here's the markup at the top of my `Header.astro`:

```astro
<!-- The checkbox that remembers open/closed -->
<input type="checkbox" id="mobile-toggle" class="hidden-toggle" aria-label="Toggle menu" />

<!-- The hamburger the user actually taps -->
<label for="mobile-toggle" class="hamburger-menu">
	<span class="line line-1"></span>
	<span class="line line-2"></span>
	<span class="line line-3"></span>
</label>
```

**The `<label>` is the clickable part.** A label with `for="mobile-toggle"` is *wired to* the checkbox with the matching `id`. Clicking the label ticks and unticks the checkbox — even when the checkbox itself is invisible. This is built into HTML—it's the same reason clicking the text beside a checkbox in a form also ticks it.

**The three empty `<span>`s are the burger lines.** They're just empty boxes I'll draw as lines with CSS.

Then I hide the checkbox itself, because nobody should see it — they see the hamburger, not a checkbox:

```css
.hidden-toggle {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
	pointer-events: none;
}
```

---

## Step 2: making CSS react to the tick

CSS can style an element based on the checkbox's state using two pieces of syntax:

```css
.hidden-toggle:checked ~ .internal-links {
	/* styles that apply only while the box is ticked */
}
```

I actually didn't know of this selector, I would've done JS, but here's how it works:

- `:checked` — while this checkbox is ticked.
- `~` — the **general sibling selector**. It selects any matching element that comes **after** another element at the same level.

So:

```css
.hidden-toggle:checked ~ .internal-links
```

means: **"Select `.internal-links` only if the `.hidden-toggle` checkbox before it is checked."**

In other words, when the hamburger menu's hidden checkbox is ticked, CSS changes the menu's styles. 

The `~` combinator can only look *forward*, at siblings that come *after* the checkbox. That's the reason the checkbox is the very first thing inside the nav — so it can "see" and react to everything else.

---

## Step 3: folding the three lines into an "X"

The three burger lines are stacked with a gap. To make the classic "X" when the menu opens, do three small moves, all triggered by `:checked`:

```css
/* Top line drops to the middle and tilts 45° */
.hidden-toggle:checked ~ .hamburger-menu .line-1 {
	transform: translateY(8px) rotate(45deg);
}
/* Middle line just vanishes */
.hidden-toggle:checked ~ .hamburger-menu .line-2 {
	opacity: 0;
	transform: translateX(-10px);
}
/* Bottom line rises to the middle and tilts the other way */
.hidden-toggle:checked ~ .hamburger-menu .line-3 {
	transform: translateY(-8px) rotate(-45deg);
}
```

The top and bottom lines slide to the centre and rotate in opposite directions, crossing to form the X. The middle line fades out.

> **transform:** a CSS property that moves, rotates, or scales an element *visually* — without disturbing anything around it. `translateY(8px)` nudges down 8px; `rotate(45deg)` spins 45 degrees.

And the reason it *glides* instead of snapping is one line on the lines themselves:

```css
.hamburger-menu .line {
	transition: transform 0.4s ease, opacity 0.3s ease;
}
```

> **transition:** "when this property changes, don't jump to the new value — ease into it over this much time." 

---

## Step 4: overlay vs. push-down

In the design I was copying, opening the menu **pushed the page content down**, like the menu was politely making room for itself. 

It came down to one property: `position: absolute`.

> **Normal document flow:** the browser's default layout. Elements are placed one after another, and each one takes up space, pushing the next element down.

> **`position: absolute`:** removes an element from the normal document flow. It no longer takes up space, so other elements ignore it, and you can position it anywhere you want relative to its nearest positioned parent (or the page if there isn't one).

I removed `position: absolute` and let the menu sit in the normal flow as a full-width row:

```css
.internal-links {
	order: 1;            /* sit below the top bar */
	flex-basis: 100%;    /* take a full-width row of its own */
	max-height: 0;       /* start collapsed — zero height */
	overflow: hidden;    /* hide the links while collapsed */
	transition: max-height 0.35s ease;
}

/* When the checkbox is ticked, grow to full height */
.hidden-toggle:checked ~ .internal-links {
	max-height: 320px;
}
```

Now, because the menu is really *there* taking up space, growing its height from `0` pushes the header taller — and the whole page slides down to make room. 

---

## Step 5: The `max-height` trick

You might've spotted something odd back in Step 4: the menu doesn't open by animating its `height` from `0` to full — it animates **`max-height`**, from `0` up to `320px`. That looks like a typo until you know the reason, so let's slow down on it.

> **`max-height`:** a ceiling on how tall an element is allowed to get. The element takes its natural height *up to* that limit — so `max-height: 0` squashes it flat, and a big value just lets it be its normal size.

So why reach for `max-height` instead of plain old `height`?

> **You can't animate `height: auto`.** Since the browser doesn't know the element's final height until it's rendered, it can't smoothly animate to `auto`. The height just jumps to its final size.

Instead, I animate `max-height`. I set it to a value that's **larger than the menu will ever need** (like `320px`). As `max-height` increases, the menu expands smoothly until it reaches its natural height.

> **Why it works:** `max-height` is a fixed number, so the browser knows exactly what to animate.

> **One thing to remember:** If the menu ever becomes taller than `320px`, the extra content will be hidden because of `overflow: hidden`. If that happens, simply increase the `max-height` value.

---

## Step 6: Links that cascade in

Last flourish. Instead of all the links appearing at once, they fade in one after another, like a little ripple. Each link starts invisible and slightly shifted, then eases into place — but each one waits a touch longer than the one before:

```css
.internal-links a {
	opacity: 0;
	transform: translateX(-10px);
	transition: opacity 0.3s ease, transform 0.3s ease;
}
.hidden-toggle:checked ~ .internal-links a:nth-child(1) { transition-delay: 0.10s; opacity: 1; transform: translateX(0); }
.hidden-toggle:checked ~ .internal-links a:nth-child(2) { transition-delay: 0.15s; opacity: 1; transform: translateX(0); }
.hidden-toggle:checked ~ .internal-links a:nth-child(3) { transition-delay: 0.20s; opacity: 1; transform: translateX(0); }
```

> **`transition-delay`:** wait this long *before* starting the animation. By giving each link a slightly bigger delay (`0.10s`, `0.15s`, `0.20s`…), they arrive in sequence instead of all at once. That stagger is what makes it feel crafted rather than mechanical.

> **`:nth-child(2)`:** a way to target "the 2nd link," "the 3rd link," and so on — so I can hand each one its own delay.

---

## What I want future-me to remember

- The **checkbox hack** lets CSS remember an on/off state, so a whole menu can work with **no JavaScript** — a hidden checkbox plus a `<label>` to tap.
- `:checked ~ .thing` is the engine: "style `.thing` while the box is ticked." It only reaches **forward**, which is why the checkbox comes first in the HTML.
- **`position: absolute` floats things on top; normal flow makes them take up space.** If I want a menu to *push* content instead of *cover* it, it has to stay in the flow. This was the big one.
- You can't animate to `height: auto` — animate **`max-height`** to a number bigger than the content, with `overflow: hidden`. Raise the number if items get clipped.
- To truly centre something of unknown width: `left: 50%` + `transform: translateX(-50%)`.
