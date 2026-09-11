---
title: 'Themes & Toggles'
description: 'Learning about the light/dark toggle, killing the flash, the pure-CSS sun/moon morph, and the circular View Transition wipe.'
pubDate: 'Jul 20 2026'
heroImage: '../../assets/blog-placeholder-5.jpg'
series: 'Building This Blog'
seriesOrder: 2
---

In this post I write about how I implemented the theme toggle effect on my page. I highkenuinely can't find the Code Pen from which I got this design inspo from, but never fear, I will find you (one day)!

## Thematic

The simplest system to use when theming is to use CSS variables. Give each color a variable name, and swap around what those names "mean".

First, declare colors in the CSS :root.

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

**`:root`:** Stores global CSS variables. The `:root` selector and the html selector target the exact same thing, but :root has higher specificity.

Next, define a second set of colors for the dark theme but using the same variable names.

```css

:root[data-theme='dark'] {
    /* Dark theme — SAME names, different values */
    --bg: #0f1219;
    --text: 229, 233, 240;
}
```

**`:root[data-theme='dark']`:** The `<html>` element, but only when it has an attribute `data-theme="dark"` on it. Is dormant until something flips that attribute on.

## What the FOUC?

When someone reloads the page, the browser starts drawing it in the default (light) theme, and then my JavaScript runs and switches it to dark. The result is a brief light-to-dark flash on every load, named **FOUC (Flash Of Un-themed Content)**.

To beat the flash, I need to set the theme before the first paint using a small inline script in the `<head>`, inside `BaseHead.astro`:

```astro
<script is:inline>
    const theme = localStorage.getItem('theme') // Have I saved a theme from last time in local storage?
        || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); // If not, does this person's device prefer dark?
    document.documentElement.setAttribute('data-theme', theme); // Whatever the answer, set `data-theme` on `<html>` immediately
</script>
```

> **localStorage:** a tiny storage box built into the browser. Text I save there survives reloads and even closing the tab. I use it to remember the visitor's last choice.
> **`is:inline`:** an Astro instruction meaning "don't bundle or defer this script — run it right here, right now."

## The sun and moon

The switch itself is a tiny component, `ThemeToggle.astro`:

```astro
<label class="toggle">
    <input type="checkbox" />
    <div></div>
</label>
```

**Step 1 — start with a plain circle.**

```css
.toggle input + div {
    width: 36px;
    height: 36px;
    border-radius: 50%;   /* a square with fully-rounded corners = a circle */
}
```

`input + div` just means "the `<div>` that sits right after the checkbox."

**Stage 2 — bite a crescent out of it to make a moon.**

Use an **inset box-shadow**. If I draw an inset shadow the same color as the moon and shove it off to one corner, it fills most of the circle but leaves a curved sliver crescent uncovered.

```css
.toggle input + div {
    /* ...the circle from Stage 1... */
    box-shadow: inset 16px -16px 0 0 var(--toggle-color); /* shifting up and right by 16px */
}
```

Shifting a filled shape up-and-right leaves a crescent gap on the lower-left. That gap is the moon.

**Stage 3 — when checked, turn the moon into a sun.**

When the checkbox is ticked, I grow the inset shadow bigger and switch its color to the page background. A big enough inset shadow covers the crescent entirely, leaving a plain full disc — a sun:

```css
/* Checkbox ticked → fill the whole circle back in = a solid sun */
.toggle input:checked + div {
    box-shadow: inset 32px -32px 0 0 var(--bg);
}
```

## The switch logic

So far the checkbox only changes how the toggle looks. This small script has to flip the site's theme, also in `ThemeToggle.astro`:

```astro
<script>
    const toggleInput = document.querySelector('.toggle input'); // finds the checkbox 
    const root = document.documentElement;

    const applyTheme = (isDark) => {
        root.setAttribute('data-theme', isDark ? 'dark' : 'light'); // sets the theme
        localStorage.setItem('theme', isDark ? 'dark' : 'light'); // saves choice to localStorage
    };

    // On load, match the checkbox to whatever theme is already active
    toggleInput.checked = root.getAttribute('data-theme') === 'dark';

    toggleInput.addEventListener('input', () => {
        applyTheme(toggleInput.checked); // runs `applyTheme` every time the checkbox is toggled
    });
</script>
```

## The smooth circular "wipe"

Clicking the toggle doesn't just snap to dark, the dark theme spreads across the screen as a growing circle from the toggle.

Here I'm changing dozens of colors at once, all across the page. There's no single thing to animate. What I really want is to animate *between two whole pictures* of the page — the light version and the dark version. Browsers have a feature built for that.

> **View Transition API:** The View Transition API provides a mechanism for easily creating animated transitions between different website and element views. This includes animating between DOM states in a single-page app (SPA), and animating the navigation between documents in a multi-page app (MPA).

**The JavaScript:**

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

- `circle(0% ...)` = a circle with **zero** radius. None of the dark layer shows. The page still looks light.
- `circle(150% ...)` = a circle big enough to more than cover the screen. The *whole* dark layer shows.

Animate from `0%` to `150%` and the circle grows outward — the dark theme "wipes" in.

The `at var(--x) var(--y)` part is the circle's **center**, and back in the JavaScript (step 4 of the handler) I set `--x` and `--y` to the toggle's exact position. So the circle  radiates from the switch I just clicked.

Last piece: `::view-transition-new(root)` is just the name for "the *after* snapshot of the whole page" (`root` = the whole page; `new` = the after state). That's the layer I'm animating in. And if a browser doesn't support any of this, the `if (!document.startViewTransition)` check catches it and swaps the theme instantly — no animation, but nothing breaks either.

Now, Voila!
