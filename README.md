# Personal Website (BBC-inspired)

Static, responsive personal site with three sections: Blogs, Images & Videos, and Demos. Built to deploy via GitHub Pages using the official Pages action.

## Structure

- `site/` — all static content served by Pages
  - `index.html` — homepage
  - `blogs/` — blog index + sample post
  - `images-videos/` — media index rendered from JSON (with noscript fallback)
  - `demos/` — demos index + sample interactive page
  - `assets/` — shared CSS, JS, and images
  - `data/` — JSON data files (e.g., `media.json`)

## Local Preview

For JSON-driven pages (Blogs, Images & Videos), use a local web server so `fetch()` can load JSON files:

- Python: `cd site && python3 -m http.server 5173` then open `http://localhost:5173/`
- Node: `npx serve site` or any static server

## Deploying to GitHub Pages

1. Ensure your default branch is `main` (or update the workflow trigger if using another branch).
2. Push this repo to GitHub.
3. In the repo Settings → Pages, set "Build and deployment" Source to "GitHub Actions".
4. Push/merge to `main` (or run the workflow manually). The Pages Action uploads `site/` and publishes it.

## Customization

- Update colors, spacing, or layout in `site/assets/css/styles.css`.
- Replace placeholder images with real assets in `site/assets/images/`.
- Add posts/pages by copying existing files and updating links.
  - Or edit JSON files to add entries (see below).

## JSON-driven content

The media page (`site/images-videos/index.html`) loads its content from `site/data/media.json` using `site/assets/js/content.js`.

- Edit `site/data/media.json` to add/remove items.
- Paths in `media.json` are relative to the page that renders them (here, `images-videos/`). For example, images use `../assets/images/...`.
- A `<noscript>` fallback is provided for SEO and non-JS browsers.

Example entry in `media.json`:

```
{
  "images": [
    { "id": "sample-image", "title": "Sample Image", "src": "../assets/images/placeholder.svg", "alt": "Abstract placeholder", "description": "..." }
  ],
  "videos": [
    { "id": "sample-video", "title": "Sample Video", "src": "https://.../flower.mp4", "type": "video/mp4", "poster": "../assets/images/placeholder.svg", "description": "..." }
  ]
}
```

If you like this approach, we can migrate `blogs/` and `demos/` similarly to load from JSON.

### Blogs via JSON

- Data: `site/data/blogs.json` with an array `posts` containing `{ id, title, date, author, summary, hero, contentUrl | content }`.
- List page: `site/blogs/index.html` renders from JSON with `site/assets/js/blogs.js`.
- Post page: `site/blogs/post.html?id=<postId>` loads the matching item and fetches its `contentUrl`.
- Supported content types:
  - HTML (`.html`): inserted as-is.
  - Markdown (`.md`/`.markdown`): rendered client-side by `site/assets/js/markdown.js`.
  - Plain text (`.txt`): displayed in a `<pre>` block.
- Examples:
  - HTML: `site/blogs/content/hello-world.html`
  - Markdown: `site/blogs/content/design-notes.md`, `site/blogs/content/roadmap.md`

#### Optional frontmatter in Markdown

You can include YAML-like frontmatter at the top of a Markdown file. The post page prefers frontmatter fields when present:

```
---
title: Design Notes
date: 2025-01-02
author: You
tags: [design, layout]
summary: Thoughts on BBC‑style responsive layout.
---
```

The Blogs index still uses `site/data/blogs.json` for fast listing and sorting; frontmatter is used on the single post page.

Tip: Keep `contentUrl` paths relative to the blogs directory (e.g., `content/hello-world.html`).
