// Content loader for JSON-driven sections.
// Currently supports the Images & Videos page.
(function () {
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

  function renderMedia(container, data) {
    container.innerHTML = '';
    const frag = document.createDocumentFragment();

    // Images
    if (Array.isArray(data.images)) {
      for (const item of data.images) {
        const block = el('div', { class: 'article', id: item.id || undefined });
        block.appendChild(el('h3', { text: item.title || 'Untitled Image' }));
        block.appendChild(el('p', { class: 'meta', text: 'Image' }));
        if (item.src) {
          block.appendChild(el('img', { src: item.src, alt: item.alt || '' }));
        }
        if (item.description) {
          block.appendChild(el('p', { text: item.description }));
        }
        frag.appendChild(block);
      }
    }

    // Videos
    if (Array.isArray(data.videos)) {
      for (const item of data.videos) {
        const block = el('div', { class: 'article', id: item.id || undefined });
        block.appendChild(el('h3', { text: item.title || 'Untitled Video' }));
        block.appendChild(el('p', { class: 'meta', text: 'Video' }));

        const video = el('video', { controls: '', preload: 'metadata', poster: item.poster || undefined });
        if (item.src) {
          video.appendChild(el('source', { src: item.src, type: item.type || 'video/mp4' }));
        }
        video.appendChild(document.createTextNode('Your browser does not support the video tag.'));
        block.appendChild(video);
        if (item.description) {
          block.appendChild(el('p', { text: item.description }));
        }
        frag.appendChild(block);
      }
    }

    if (!frag.childNodes.length) {
      container.appendChild(el('div', { class: 'article' }, el('p', { text: 'No media available.' })));
    } else {
      container.appendChild(frag);
    }
  }

  async function loadJSON(url) {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
    return res.json();
  }

  document.addEventListener('DOMContentLoaded', async () => {
    const mediaContainer = document.getElementById('media-list');
    if (mediaContainer) {
      const src = mediaContainer.getAttribute('data-src') || '../data/media.json';
      try {
        const data = await loadJSON(src);
        renderMedia(mediaContainer, data);
      } catch (err) {
        console.error(err);
        mediaContainer.innerHTML = '<div class="article"><p>Failed to load media content.</p></div>';
      }
    }
  });
})();

