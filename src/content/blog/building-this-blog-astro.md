---
title: 'Astro'
description: 'Notes-to-self on Astro — what it is, how it works, and how the pieces actually fit together to build the page you are reading.'
pubDate: 'Jul 18 2026'
heroImage: '../../assets/blog-placeholder-2.jpg'
series: 'Building This Blog'
seriesOrder: 1
---

This blog is built with **Astro**, and I learned a lot while putting it together. Why did I pick Astro? Well... it's kind of a long story.

I'd been working on my GitHub and building a self-updating README (a post for another day). One of the things I wanted to include was my latest blog posts. There was just one tiny problem.

I didn't have a blog.

So I went down the AI rabbit hole and asked the bots how I should set one up. The overwhelming consensus was: use Hashnode. So I did.

It sucked.

Naturally, I went to Reddit to self-validate—as one does—and, to no one's surprise, I found my own little circle jerk of people who hated it too. And honestly, the complaints weren't unfounded:

1. Hashnode was overrun by AI-generated posts.
2. They randomly flag and archive innocent posts for vague "violations." They did it to me for posting a single paragraph saying I was starting a blog.
3. I just didn't like the UI. As someone who enjoys web design, I wanted full control over how my site looked and felt.

So I took another recommendation from Reddit, and gave Astro a shot.

And here we are. These are really my own notes on how it works — written so future-me can actually learn and relearn something.

---

## What Even is Astro?

Per their website, **Astro is a web framework for building content-focused websites** — blogs, portfolios, docs — and it ships as little JavaScript as possible so pages load fast.

> **Web framework:** a ready-made foundation for building websites. It hands you a project structure and a build process, and takes care of the repetitive work like routing, bundling your files, optimizing images.

The interesting thing about Astro is how it delivers a page. A lot of sites today are built as a **single-page app**: the browser downloads a mostly-empty HTML file plus a big bundle of JavaScript, then runs that JavaScript to assemble the page in front of you. It's like ordering a pizza and receiving the raw dough, the cheese, the toppings, and a recipe card — you have to build the thing before you can eat. That makes sense for something like Gmail, but it's overkill for a blog, where I just want you to read words.

Astro renders pages to finished HTML *ahead of time* instead. There are two ways it can do that:

> **Static Site Generation (SSG):** Astro builds the finished HTML once, when I deploy. Every visitor gets the same pre-built file. 

> **Server-side rendering (SSR):** the HTML is built fresh on a server *each time someone requests the page*. Still server-built, but on demand rather than in advance. 

Pre-rendering isn't what makes Astro unique anymore. Frameworks like Next.js, Nuxt, and SvelteKit can all generate HTML ahead of time. The difference is what happens **after** that. Many frameworks still send a JavaScript **runtime** (such as React) to the browser so it can **hydrate** the page—that is, "wake up" the HTML and make it interactive, even if the page is just text and images. Astro takes a different approach. If a page doesn't need interactivity, it sends only the finished HTML and **zero JavaScript**. If you later add something like a dark mode toggle or search bar, Astro ships JavaScript **only for those specific components**, instead of for the entire page. That's why Astro sites are often smaller and faster by default.

> **Islands architecture:** a page that's mostly static HTML, with small, isolated interactive components ("islands") that get JavaScript, while everything around them stays plain HTML.

---

## The project layout

When you open an Astro project, a handful of folders each do a specific job.

```text
src/
├── pages/             each file here becomes a URL (a page on the site)
├── layouts/           shared page shells — the <slot /> lives here
├── components/        reusable chunks of UI (header, footer, buttons…)
├── content/           my posts, written as Markdown
├── content.config.ts  the rules for what a post must contain
├── styles/            global CSS
└── assets/            images and fonts
astro.config.mjs       project-wide configuration
```

### `pages/` — where URLs come from

Everything in `src/pages` becomes a page, and the filename *is* the URL. No routing config to write.

> **Routing:** the system that decides which page a visitor sees for a given URL. 

| File | Becomes the URL |
|------|-----------------|
| `src/pages/index.astro` | `/` (homepage) |
| `src/pages/about.astro` | `/about` |
| `src/pages/blog/index.astro` | `/blog` |
| `src/pages/blog/[...slug].astro` | `/blog/any-post-name` |

The first three are one-file-one-page. That last one is different — a single file that builds *every* blog post. 

### `layouts/` — the shared shell

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

The `<slot />` is a hole. Whatever I put *inside* the layout tag when I use it lands in that hole, wrapped by the header and footer. 

### `components/`

Components are the smaller reusable pieces: the header, footer, theme toggle. Same idea as a layout, just more granular. I'll come back to them properly in a moment, because they lead into props.

### `content/`

This is where the actual writing lives. Instead of burying posts inside page files, Astro lets me keep them as Markdown files:

```text
content/
└── blog/
    ├── first-post.md
    ├── learning-astro.md
    └── why-i-built-this-blog.md
```

### `assets/` vs `public/`

Assets are the non-code files: images, icons, fonts. The thing that tripped me up here is that there are *two* places these can go, and they behave differently:

- **`src/assets/`** — Astro optimizes, resizes, and fingerprints these when it builds. My `heroImage: '../../assets/blog-placeholder-2.jpg'` lives here, which is why the hero images come out compressed and cache-friendly.
- **`public/`** — copied to the final site *untouched*. Good for things that must keep their exact name and path, like `favicon.svg` or `robots.txt`.

### `astro.config.mjs`

The project's settings file — integrations, the site URL, Markdown options and even google fonts.

---

## Anatomy of an `.astro` file

Astro has its own file type, `.astro`. If you know HTML it feels familiar, because most of the file *is* HTML. The twist is that every `.astro` file has two sections.

```astro
---
// Section 1: JavaScript that runs at BUILD TIME
const name = "Ruva";
---

<!-- Section 2: the HTML template that actually ships -->
<h1>Hello, {name}!</h1>
```

The top section, fenced by `---`, is where I prepare data — variables, calculations, fetching. It runs *while Astro builds the site*, never in the visitor's browser. By the time you load the page, this code has already done its job and vanished. To use one of its values in the template, I wrap it in curly braces, like `{name}`.

One naming trap worth flagging, because it confused me for a while: **the `---` fence means two different things depending on the file.** In an `.astro` file it holds *JavaScript that executes* — Astro's own docs call this the **component script**. In a Markdown file (like the top of this very post) the identical-looking `---` fence holds *static YAML metadata* — `title`, `pubDate`, and so on — that just gets parsed, never run. Same delimiter, completely different jobs.

Here's a slightly bigger template example, looping over a list:

```astro
---
const posts = ["Why I Chose Astro", "Building My Portfolio", "Learning Astro"];
---

<ul>
  {posts.map(post => <li>{post}</li>)}
</ul>
```

`posts.map(...)` is plain JavaScript — it makes one `<li>` per item. At build time Astro turns that into flat HTML:

```html
<ul>
  <li>Why I Chose Astro</li>
  <li>Building My Portfolio</li>
  <li>Learning Astro</li>
</ul>
```

The visitor downloads that HTML and nothing else. The loop that made it never ships.

---

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

A blog is really just "a folder of posts." Astro has a purpose-built feature for exactly that.

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

I called a collection "queryable like a database," so here's the actual query — `getCollection('blog')` — inside the single file that generates every post page:

```astro
---
// src/pages/blog/[...slug].astro
import { getCollection, render } from 'astro:content';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },   // becomes the URL: /blog/<slug>
    props: { post },             // hands the post data to this page
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---
<Layout title={post.data.title}>
  <Content />
</Layout>
```

> **Dynamic route:** a single file whose name has square brackets (`[...slug]`) that generates many pages — one per item in a collection — instead of one fixed page.

Read top to bottom, this is the whole trick of an Astro blog:

- `getStaticPaths()` looks through your blog collection and finds every post you have. For each post, it gives Astro two important things: the **slug** (the name used in the URL, like `/blog/my-first-post`) and the post's data (title, date, description, etc.).

- Astro then uses that list to create a separate page for every blog post. This is what a **dynamic route** does: instead of manually creating `first-post.astro`, `second-post.astro`, and `third-post.astro`, one file can generate all of them automatically.

- `render(post)` takes the Markdown file and converts it into something Astro can display. It turns your written content into a `<Content />` component that contains the actual blog post.

- Finally, `<Layout>` wraps the content with the shared parts of your website, like the header, footer, fonts, and styling. The `<slot />` inside the layout is simply the placeholder where the blog post content gets inserted.

So the flow is:

Markdown files → `getStaticPaths()` finds them → Astro creates a page for each one → `render()` converts the Markdown into HTML → `<Layout>` adds the website structure → final blog page is generated.

Collections, schema, props, layouts, and routing all meet right here. Every other page on the site is a simpler version of this.

---

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

---

## What I want future-me to remember

- Astro builds pages to plain HTML ahead of time and ships *no framework runtime* — interactivity is opt-in, via islands.
- A file's location in `src/pages` is its URL; `[...slug].astro` is the one file that builds every post.
- `getCollection()` + a schema + `getStaticPaths()` + a layout are the four things that turn a Markdown folder into real pages. 
- In an `.astro` file, the `---` fence is JavaScript that runs at build time; in a Markdown file, the same fence is just static metadata.

Next up, I break down the light/dark switch in the corner: [Building This Blog: The Theme Toggle](/blog/building-this-blog-theme-toggle/).
