---
title: 'Astro'
description: 'Notes-to-self on starting my dev journey with Astro.'
pubDate: 'Jul 18 2026'
heroImage: '../../assets/blog-placeholder-2.jpg'
series: 'Building This Blog'
seriesOrder: 1
---

This blog is built with **Astro**, and I learned a lot while putting it together. Why did I pick Astro? Well... it's kind of a long story.

I'd been working on my GitHub and building a self-updating README (a post for another day). One of the things I wanted to include was my latest blog posts. There was one glaring problem.

I didn't have a blog.

So I went down the AI rabbit hole and asked the bot gods how I should set one up. They recommended a lot slop, but I tried them out. One of the ones I tried was Hashnode, and like the others, it sucked.

Naturally, I went to Reddit to self-validate—as one does—and, to no one's surprise, I found my own little circle jerk of people who hated Hashnode too. Some of the issues (not limited to Hashnode btw) were that:

1. It was overrun by AI-generated posts.
2. They randomly flag and archive innocent posts for very vague "violations." They did it to me for posting a single paragraph saying I was starting a blog.
3. I just didn't like the UI. As someone who enjoys web design, I wanted full control over how my site looked and felt.

So I took a recommendation from Reddit, and gave Astro a shot.

And here we are, shooting for the stars. These are really my own notes on how it works — written so future-me can actually learn  something.

---

## What Even is Astro?

Per their website, **Astro is a web framework for building content-focused websites** — blogs, portfolios, docs — and it ships as little JavaScript as possible so pages load fast.

> **Web framework:** a ready-made foundation for building websites. It hands you a project structure and a build process, and takes care of the repetitive work like routing, bundling files, optimizing images.

The interesting thing about Astro is how it delivers a page. A lot of sites today are built as a **single-page app**: the browser downloads a mostly-empty HTML file plus a big bundle of JavaScript, then runs that JavaScript to assemble the page in front of you. That makes sense for something like Gmail which is more interactive, but it's overkill for a blog, where I just want you to read words.

Astro renders pages to HTML that the browser can directly display before a visitor ever asks for the page. 

**Without pre-rendering:**
When a user visits the page, the server runs the code and generates the HTML. It then sends that HTML to the browser, which displays the page.

**Astro’s pre-rendering approach:**
Astro generates the HTML when the site is built, before anyone visits the page. When a user visits, the browser receives the already-generated HTML and can display it immediately.

There are two ways it can do that:

> **Static Site Generation (SSG):** Astro builds the finished HTML once, when I deploy. Every visitor gets the same pre-built file. 

> **Server-side rendering (SSR):** the HTML is built fresh on a server *each time someone requests the page*. Still server-built, but on demand rather than in advance. 

Pre-rendering isn't what makes Astro unique anymore. Frameworks like Next.js, Nuxt, and SvelteKit can all generate HTML ahead of time. The difference is what happens **after** that. 

Many frameworks still send a JavaScript **runtime** (such as React) to the browser so it can **hydrate** the page—that is, "wake up" the HTML and make it interactive, even if the page is just text and images. Astro takes a different approach. If a page doesn't need interactivity, it sends only the finished HTML and **zero JavaScript**. If you later add something like a dark mode toggle or search bar, Astro ships JavaScript **only for those specific components**, instead of for the entire page. That's why Astro sites are often smaller and faster by default.

> **Islands architecture:** a page that's mostly static HTML, with small, isolated interactive components ("islands") that get JavaScript, while everything around them stays plain HTML.

## The project layout

When you open an Astro project, a handful of folders each do a specific job.

```text
src/
├── pages/             each file here becomes a URL (a page on the site) e.g projects, index (home)
├── layouts/           shared page shells e.g the BlogPost shell
├── components/        reusable chunks of UI (header, footer, buttons…)
├── content/           my posts, written as Markdown
├── content.config.ts  the rules for what a post must contain
├── styles/            global CSS
└── assets/            images and fonts and thems
astro.config.mjs       project-wide configuration
```

### 1. `pages/` — where URLs come from

Everything in `src/pages` becomes a page, and the filename *is* the URL. No routing config to write.

> **Routing:** the system that decides which page a visitor sees for a given URL. 

| File | Becomes the URL |
|------|-----------------|
| `src/pages/index.astro` | `/` (homepage) |
| `src/pages/blog/index.astro` | `/blog` |
| `src/pages/blog/[...slug].astro` | `/blog/any-post-name` |

That last one is a single file that builds *every* blog post. 

### 2. `layouts/` — the shared shell

A layout is a page template that other pages pour their content into. Instead of repeating the header, footer, and head metadata on every page, I write them once in a layout. The mechanism that makes this work is the `<slot />`:

```astro
---
// src/layouts/Layout.astro
---
<html>
  <body>
    <Header />
    <slot />   <!-- the page's own content gets dropped in right here -->
    <Footer />
  </body>
</html>
```

### 3. `components/`

Components are the smaller reusable pieces: the header, footer, theme toggle. 

### 4. `content/`

This is where the actual writing lives. 

```text
content/
└── blog/
    ├── first-post.md
```

### 5. `assets/` & `public/`

Assets are the non-code files: images, icons, fonts. 

- **`src/assets/`** — Astro optimizes (e.g compressing to smaller size), resizes, and fingerprints (adds a unique identifier to the filename, like hero.8f3a2.jpg. This helps browsers know when the image has changed and when they can reuse their cached copy) these when it builds. 
- **`public/`** — or files you want to serve exactly as they are, without Astro processing or optimizing them e.g favicons, robots.txt (tells search engine crawlers and other automated bots which pages or folders they are allowed to access and crawl), fonts, pdfs etc.

### `astro.config.mjs`

The project's settings file — integrations, the site URL, Markdown options and even google fonts.

## Anatomy of an `.astro` file

Astro has its own file type, `.astro`. It's a bit like HTML but it has an added section:

```astro
---
// Section 1: JavaScript that runs at BUILD TIME
const name = "Ruva";
---

<!-- Section 2: the HTML template that actually ships -->
<h1>Hello, {name}!</h1>
```

The top section, fenced by `---`, is called the component script, where you prepare data — variables, calculations, fetching. It runs *while Astro builds the site*, never in the visitor's browser. By the time you load the page, this code has already done its job and vanished. To use one of its values in the template, I wrap it in curly braces, like `{name}`.

In a Markdown file (like the top of this very post) the identical-looking `---` fence holds *static YAML metadata* instead — `title`, `pubDate`, and so on — that just gets parsed, never run. 

## Components and props

The reason components matter: I write the navigation once in `Header.astro`, drop `<Header />` onto every page, and if I change it, every page updates at once. Write once, reuse everywhere.

```astro
---
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
---

<Header />
<main>...page content...</main>
<Footer />
```

Components get more useful when you can *feed them values* — those are called **props**, and they work just like HTML attributes. This blog's `BaseHead` component takes a title and description:

```astro
<BaseHead title="My Page" description="A page about things." />
```

Inside the component, I read them off `Astro.props`:

```astro
---
const { title, description } = Astro.props;
---
<title>{title}</title>
<meta name="description" content={description} />
```

---

## Content collections and dynamic routes

A blog is really just "a folder of posts." Astro has a purpose-built feature for that.

> **Content collection:** an organized, type-checked group of content files that Astro can query like a mini-database.

The "type-checked" part comes from a **schema** — a set of rules for what every post must contain. Mine lives in `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),            // must be text
			description: z.string(),      // must be text
			pubDate: z.coerce.date(),     // must be a date
			heroImage: z.optional(image()), // optional image
		}),
});

export const collections = { blog };
```

If a post is missing its `title`, or `pubDate` isn't a real date, the build *fails* and tells me which file is wrong — before the site ever ships. 

> **Dynamic route:** a single file whose name has square brackets (`[...slug]`) that generates many pages — one per item in a collection — instead of one fixed page.

## Putting it together: the journey of a page

So, start to finish, here's what happens when I build the blog:

1. I run `npm run build`.
2. Astro looks in `src/pages/` and finds each page — including `[...slug].astro`.
3. `getStaticPaths()` runs, queries the `blog` collection, and produces one route per post.
4. For each page, the component script runs at build time (sorting posts, rendering Markdown), and the template becomes plain HTML.
5. Components and layouts get folded into that HTML.
6. Images are optimized, the tiny bit of needed JavaScript is bundled, and finished `.html` files are written to `dist/`.
7. That `dist/` folder *is* the whole website — pre-built, fast, ready to serve.

By the time you load a page, all the work is already done. That's why it feels instant.
