// Populate homepage Latest Blogs from JSON
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

  async function loadJSON(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
  }

  function normalizeHero(path) {
    if (!path) return 'assets/images/placeholder.svg';
    // Convert blog-relative ../assets/... to root-relative for homepage
    if (path.startsWith('../assets/')) return path.replace('../assets/', 'assets/');
    return path;
  }

  function renderLatest(container, posts) {
    container.innerHTML = '';
    const grid = el('div', { class: 'card-grid' });
    posts.forEach(p => {
      const card = el('article', { class: 'card' });
      const href = `blogs/post.html?id=${encodeURIComponent(p.id)}`;
      const media = el('a', { class: 'media', href });
      media.appendChild(el('img', { src: normalizeHero(p.hero), alt: p.title || 'Blog image' }));
      card.appendChild(media);
      const content = el('div', { class: 'content' });
      content.appendChild(el('h3', {}, el('a', { href, text: p.title || 'Untitled' })));
      if (p.summary) content.appendChild(el('p', { text: p.summary }));
      card.appendChild(content);
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('home-blogs');
    if (!root) return;
    const src = root.getAttribute('data-src') || 'data/blogs.json';
    try {
      const data = await loadJSON(src);
      const posts = (data.posts || []).slice().sort((a,b) => String(b.date).localeCompare(String(a.date))).slice(0,3);
      renderLatest(root, posts);
    } catch (e) {
      console.error(e);
      root.innerHTML = '<p>Failed to load latest blogs.</p>';
    }
  });
})();

