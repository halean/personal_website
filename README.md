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

Open `site/index.html` in a browser. No build step required.

## Deploying to GitHub Pages

1. Ensure your default branch is `main` (or update the workflow trigger if using another branch).
2. Push this repo to GitHub.
3. In the repo Settings → Pages, set "Build and deployment" Source to "GitHub Actions".
4. Push/merge to `main` (or run the workflow manually). The Pages Action uploads `site/` and publishes it.

## Customization

- Update colors, spacing, or layout in `site/assets/css/styles.css`.
- Replace placeholder images with real assets in `site/assets/images/`.
- Add posts/pages by copying existing files and updating links.

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
