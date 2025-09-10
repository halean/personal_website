// JSON-driven Blogs: list and single post rendering
(function(){
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k === 'text') node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) {
      if (child == null) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  function parseFrontmatter(text) {
    const result = { meta: {}, content: text };
    if (!/^---\s*[\r\n]/.test(text)) return result;
    const m = text.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]+([\s\S]*)$/);
    if (!m) return result;
    const rawMeta = m[1];
    const body = m[2];
    const meta = {};
    rawMeta.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf(':');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      // strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      // arrays like [a, b, c]
      if (val.startsWith('[') && val.endsWith(']')) {
        const inner = val.slice(1, -1);
        meta[key] = inner.split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
      } else {
        meta[key] = val;
      }
    });
    result.meta = meta;
    result.content = body;
    return result;
  }

  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  async function loadJSON(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
  }

  async function loadText(url, accept = 'text/plain') {
    const res = await fetch(url, { headers: { 'Accept': accept } });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.text();
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function renderList(container, posts) {
    container.innerHTML = '';
    const grid = el('div', { class: 'card-grid' });
    posts.forEach(p => {
      const card = el('article', { class: 'card' });
      const href = `post.html?id=${encodeURIComponent(p.id)}`;
      const media = el('a', { class: 'media', href });
      media.appendChild(el('img', { src: p.hero || '../assets/images/placeholder.svg', alt: p.title || 'Blog image' }));
      card.appendChild(media);
      const content = el('div', { class: 'content' });
      content.appendChild(el('h3', {}, el('a', { href, text: p.title || 'Untitled' })));
      content.appendChild(el('p', { text: p.summary || '' }));
      card.appendChild(content);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  async function renderPost(container, posts, id) {
    container.innerHTML = '';
    const post = posts.find(p => p.id === id);
    if (!post) {
      container.appendChild(el('p', { text: 'Post not found.' }));
      return;
    }

    // Defaults from JSON index
    const display = {
      title: post.title || 'Untitled',
      author: post.author || '',
      date: post.date || '',
      hero: post.hero || '',
      tags: Array.isArray(post.tags) ? post.tags : []
    };

    let contentHtml = '';
    try {
      if (post.contentUrl) {
        const lower = post.contentUrl.toLowerCase();
        if (lower.endsWith('.md') || lower.endsWith('.markdown')) {
          const mdText = await loadText(post.contentUrl, 'text/plain');
          const { meta, content } = parseFrontmatter(mdText);
          // Prefer frontmatter for display if present
          if (meta.title) display.title = meta.title;
          if (meta.author) display.author = meta.author;
          if (meta.date) display.date = meta.date;
          if (meta.hero) display.hero = meta.hero;
          if (meta.tags) display.tags = Array.isArray(meta.tags) ? meta.tags : String(meta.tags).split(',').map(s => s.trim()).filter(Boolean);
          const html = (window.Markdown && typeof window.Markdown.toHtml === 'function') ? window.Markdown.toHtml(content) : `<pre>${content}</pre>`;
          contentHtml = html;
        } else if (lower.endsWith('.html') || lower.endsWith('.htm')) {
          contentHtml = await loadText(post.contentUrl, 'text/html');
        } else if (lower.endsWith('.txt')) {
          const txt = await loadText(post.contentUrl, 'text/plain');
          contentHtml = `<pre>${txt.replace(/[&<>]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[s]))}</pre>`;
        } else {
          contentHtml = await loadText(post.contentUrl, 'text/html');
        }
      } else if (post.content) {
        contentHtml = post.content;
      } else {
        contentHtml = '<p>No content available.</p>';
      }
    } catch (e) {
      console.error(e);
      contentHtml = '<p>Failed to load post content.</p>';
    }

    // Update title
    if (display.title) document.title = display.title + ' • MySite';

    const header = el('header');
    header.appendChild(el('h1', { text: display.title || 'Untitled' }));
    const metaPieces = [];
    if (display.author) metaPieces.push(display.author);
    if (display.date) metaPieces.push(formatDate(display.date));
    if (metaPieces.length) header.appendChild(el('p', { class: 'meta', text: metaPieces.join(' • ') }));
    container.appendChild(header);

    if (display.hero) {
      container.appendChild(el('img', { src: display.hero, alt: display.title || 'Post image' }));
    }

    const body = el('div');
    body.innerHTML = contentHtml;
    container.appendChild(body);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const listRoot = document.getElementById('blog-list');
    const postRoot = document.getElementById('blog-post');
    if (!listRoot && !postRoot) return;

    const src = (listRoot || postRoot).getAttribute('data-src') || '../data/blogs.json';
    try {
      const data = await loadJSON(src);
      const posts = Array.isArray(data.posts) ? data.posts : [];
      if (listRoot) renderList(listRoot, posts);
      if (postRoot) {
        const id = getQueryParam('id');
        await renderPost(postRoot, posts, id);
      }
    } catch (err) {
      console.error(err);
      if (listRoot) listRoot.innerHTML = '<p>Failed to load blog list.</p>';
      if (postRoot) postRoot.innerHTML = '<p>Failed to load post.</p>';
    }
  });
})();
