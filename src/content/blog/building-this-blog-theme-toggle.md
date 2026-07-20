---
title: 'Building This Blog: The Theme Toggle'
description: 'Notes-to-self on the light/dark toggle powering this site — CSS variables, killing the flash, the pure-CSS sun/moon morph, and the circular View Transition wipe, broken down slowly.'
pubDate: 'Jul 18 2026'
heroImage: '../../assets/blog-placeholder-5.jpg'
---

In my last post, [Building This Blog: Astro](/blog/building-this-blog-astro/), I wrote up a light intro to Astro. In this post I write about how I implemented the theme toggle effect on my page. I highkenuinely can't find the Code Pen from which I got this design inspo from, but never fear, I will find you (one day)!

---

## Thematic

I learnt that the simplest system to employ when theming is to use CSS variables. Don't scatter hardcoded colors around your CSS, you will indeed regret that. Instead, give each color a name, and swap around what those names "mean". 

Here's the rundown:

## 1. Declare colors in your CSS :root

```css
:root {
	/* Light theme — the default */
	--bg: #f4e9e1;
	--text: 15, 18, 25;
}

body   { background: var(--bg); }
header { background: var(--bg); }
p {color: rgb(var(--text))}
```

Now "the background color" has a single home. If I change `--bg`, the body, header, and footer all follow automatically. Same applies for the tex color.

## 2: Define a second set of colors for the dark theme

So I define my colors twice: once for light mode, once for dark. In `src/styles/global.css`:

```css

:root[data-theme='dark'] {
	/* Dark theme — SAME names, different values */
	--bg: #0f1219;
	--text: 229, 233, 240;
}
```

Two things to unpack here.

**What's `:root`?** It's just the `<html>` element — the outermost thing on the page. Variables I put there are visible everywhere.

**What's `:root[data-theme='dark']`?** It's a conditional. It reads as "the `<html>` element, but only when it has an attribute `data-theme="dark"` on it." So this whole second block is dormant until something flips that attribute on — which is the toggle's entire job (Step 5).

And the one rule I cannot break: **both blocks use the exact same names** (`--bg`, `--text`). The dark block doesn't invent new colors, it just reassigns the same nicknames. 

### Side Note: Text as rgb

You might notice `--bg` is used plainly but `--text` gets wrapped in `rgb(...)`. Here's why I did that.

Normally I'd store a color whole: `--text: #0f1219;`. Instead I stored just the three raw numbers that make it up: `--text: 15, 18, 25;` (those are the red, green, blue values).

Because I kept the raw numbers, I can reuse the same color at any opacity without defining a second variable:

```css
color: rgb(var(--text));            /* solid text */
border: 1px solid rgba(var(--text), 0.2);   /* same color, 20% opacity */
```

## 3: What the FOUC?: Remember the theme and kill the "flash"

There's a subtle bug waiting here. When someone reloads the page, the browser starts drawing it in the default (light) theme, and then my JavaScript runs and switches it to dark. The result is an ugly light-to-dark flash on every load. It even has the name:

> **FOUC (Flash Of Un-themed Content):** the split second a page shows the wrong state before JavaScript fixes it.

To beat the flash, I need to set the theme before the first paint. That means a small inline script right in the `<head>`, inside `BaseHead.astro`:

```astro
<script is:inline>
	const theme = localStorage.getItem('theme')
		|| (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	document.documentElement.setAttribute('data-theme', theme);
</script>
```

Reading it line by line, it answers three questions in order:

1. **"Have I saved a theme from last time?"** — `localStorage.getItem('theme')`.
2. **"If not, does this person's device prefer dark?"** — the `matchMedia(...)` fallback after the `||`.
3. **Whatever the answer, set `data-theme` on `<html>` immediately** — which activates that dark block from Step 1 before anything is drawn.

Two pieces make this work:

> **localStorage:** a tiny storage box built into the browser. Text I save there survives reloads and even closing the tab. I use it to remember the visitor's last choice.

> **`is:inline`:** an Astro instruction meaning "don't bundle or defer this script — run it right here, right now." 

So a returning visitor gets their saved theme, and a brand-new visitor on a dark-mode laptop gets dark mode automatically. No flash either way.

## 4: Drawing the sun and moon (pure CSS)

This is the part that I took from the long lost Codepen.

The switch itself is a tiny component, `ThemeToggle.astro`:

```astro
<label class="toggle">
	<input type="checkbox" />
	<div></div>
</label>
```

Just a checkbox and an empty `<div>`. The entire sun/moon picture is drawn from that single `<div>` with CSS — no icons, no images, no JavaScript. This happens in 3 stages:

**Stage 1 — start with a plain circle.**

```css
.toggle input + div {
	width: 36px;
	height: 36px;
	border-radius: 50%;   /* a square with fully-rounded corners = a circle */
}
```

`input + div` just means "the `<div>` that sits right after the checkbox." So far I've got a plain 36px disc.

**Stage 2 — bite a crescent out of it to make a moon.**

Here's the trick: an **inset box-shadow**. A normal `box-shadow` sits outside an element; adding `inset` paints it inside instead. If I draw an inset shadow the same color as the moon and shove it off to one corner, it fills most of the circle but leaves a curved sliver uncovered — and that leftover sliver is a crescent.

```css
.toggle input + div {
	/* ...the circle from Stage 1... */
	box-shadow: inset 16px -16px 0 0 var(--toggle-color);
}
```

Reading those numbers: `16px` right, `-16px` up (so the shadow shifts to the upper-right), `0` blur, `0` spread. Shifting a filled shape up-and-right leaves a crescent gap on the lower-left. That gap is the moon. 

**Stage 3 — when checked, turn the moon into a sun.**

When the checkbox is ticked, I grow the inset shadow bigger and switch its color to the page background. A big enough inset shadow covers the crescent entirely, leaving a plain full disc — a sun:

```css
/* Checkbox ticked → fill the whole circle back in = a solid sun */
.toggle input:checked + div {
	box-shadow: inset 32px -32px 0 0 var(--bg);
}
```

`input:checked + div` means "the div, but only while the checkbox is ticked." That `:checked` is how CSS reacts to the toggle with no JavaScript at all.

**Making it animate instead of snap.** On its own, that change would happen instantly. Adding a `transition` tells the browser to glide*between the two shapes over time:

```css
.toggle input + div {
	transition: box-shadow .5s ease, transform .4s ease;
}
```

> **transition:** "when this property changes, don't jump — ease to the new value over this many seconds."

The component also adds the sun's little rays (eight tiny dots made with more box-shadows) and a slight rotation.

## 5: The switch logic (a little JavaScript)

So far the checkbox only changes how the toggle looks. This small script has to flip the site's theme, also in `ThemeToggle.astro`:

```astro
<script>
	const toggleInput = document.querySelector('.toggle input');
	const root = document.documentElement;

	const applyTheme = (isDark) => {
		root.setAttribute('data-theme', isDark ? 'dark' : 'light');
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
	};

	// On load, match the checkbox to whatever theme is already active
	toggleInput.checked = root.getAttribute('data-theme') === 'dark';

	toggleInput.addEventListener('input', () => {
		applyTheme(toggleInput.checked);
	});
</script>
```

Breaking it down:

- `document.querySelector('.toggle input')` finds the checkbox so the script can watch it.
- `applyTheme(isDark)` does the two things that matter: sets `data-theme` on `<html>` (which flips every color via Step 1) and saves the choice to `localStorage` (so Step 3 remembers it next time).
- `addEventListener('input', ...)` runs `applyTheme` every time the checkbox is toggled.

That's a complete, working light/dark toggle. 

## 6: The smooth circular "wipe"

This is the effect I most wanted to understand: clicking the toggle doesn't just snap to dark, the dark theme spreads across the screen as a growing circle from the toggle. Here's how that actually works.

**The problem.** Animating one color is easy. But here I'm changing dozens of colors at once, all across the page. There's no single thing to animate. What I really want is to animate *between two whole pictures* of the page — the light version and the dark version. Browsers have a feature built exactly for that.

> **View Transition API:** I hand the browser a function that changes the page. It takes a snapshot *before* the change and *after* the change, then animates from one snapshot to the other. So I can cross-fade or wipe between two entire page states with almost no code.

**The JavaScript.** Here's the fuller version of the click handler from Step 5:

```js
toggleInput.addEventListener('input', () => {
	const isDark = toggleInput.checked;

	// 1. Figure out where the toggle sits on screen (its center point)
	const rect = document.querySelector('.toggle').getBoundingClientRect();
	const x = rect.left + rect.width / 2;
	const y = rect.top + rect.height / 2;

	// 2. Old browser with no support? Just swap instantly, no animation.
	if (!document.startViewTransition) {
		applyTheme(isDark);
		return;
	}

	// 3. Otherwise, let the browser animate between before and after.
	const transition = document.startViewTransition(() => applyTheme(isDark));

	// 4. Once it's ready, tell the CSS where the circle should grow from.
	transition.ready.then(() => {
		root.style.setProperty('--x', `${x}px`);
		root.style.setProperty('--y', `${y}px`);
	});
});
```

**What happens, frame by frame,** when I click:

1. The browser takes a snapshot of the page as it is now — the light version.
2. My function runs `applyTheme(true)`, so under the hood every color flips to dark.
3. The browser takes a second snapshot — the dark version.
4. It stacks the dark snapshot *on top of* the light one, hidden for now.
5. A CSS animation reveals the dark snapshot through a circle that grows from tiny to huge — so the dark theme appears to spread out and cover the page.

**The CSS that does the revealing:**

```css
@keyframes reveal-in {
	from { clip-path: circle(0% at var(--x) var(--y)); }
	to   { clip-path: circle(150% at var(--x) var(--y)); }
}

::view-transition-new(root) {
	animation: reveal-in 0.5s ease-in-out forwards;
}
```

> **clip-path:** a rule that says "only show the part of this element inside this shape." Everything outside the shape becomes invisible.

So `clip-path: circle(...)` shows only a circular chunk of the dark snapshot. Now watch the two ends of the animation:

- `circle(0% ...)` → a circle with **zero** radius. None of the dark layer shows. The page still looks light.
- `circle(150% ...)` → a circle big enough to more than cover the screen. The *whole* dark layer shows.

Animate from `0%` to `150%` and the circle grows outward — the dark theme "wipes" in. Roughly:

```text
click        tiny circle        growing         covers screen
   ·      →     (•)        →     ( ● )      →    ( DARK )
 light        dark peeking      spreading        all dark
```

And the `at var(--x) var(--y)` part is what makes it feel intentional. That's the circle's **center**, and back in the JavaScript (step 4 of the handler) I set `--x` and `--y` to the toggle's exact position. So the circle doesn't grow from some random spot — it radiates from the switch I just clicked.

Last piece: `::view-transition-new(root)` is just the name for "the *after* snapshot of the whole page" (`root` = the whole page; `new` = the after state). That's the layer I'm animating in. And if a browser doesn't support any of this, the `if (!document.startViewTransition)` check catches it and swaps the theme instantly — no animation, but nothing breaks either.

---

## What I want future-me to remember

- Colors live in CSS variables, and the dark block reassigns the **same names** under `[data-theme='dark']`. Same names = it works. Different names = nothing happens (my hours-long bug).
- One `data-theme` flip on `<html>` recolors the whole site — as long as nothing is left hardcoded.
- Set the theme *before paint* with the inline script to kill the flash, and save it to `localStorage` so it sticks.
- The sun/moon is one circle: an inset shadow carves the crescent, and `:checked` fills it back into a sun. Pure CSS.
- The wipe isn't animating colors — it's animating between a **before snapshot and an after snapshot**, revealing the new one through a `clip-path` circle that grows from the toggle. With a plain instant-swap fallback when the API is missing.
