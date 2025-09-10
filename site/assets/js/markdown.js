// Very small Markdown -> HTML converter (safe subset).
// Supports: headings, paragraphs, lists, code (inline/block), links, images,
// strong/em, and basic blockquotes. Escapes raw HTML by default.
(function () {
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inline(md) {
    const esc = escapeHtml(md);
    // images ![alt](url)
    let out = esc.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (m, alt, href, title) => {
      const a = escapeHtml(alt || '');
      const h = escapeHtml(href || '#');
      const t = title ? ` title="${escapeHtml(title)}"` : '';
      return `<img src="${h}" alt="${a}"${t}>`;
    });
    // links [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (m, text, href, title) => {
      const t = escapeHtml(text || '');
      const h = escapeHtml(href || '#');
      const tt = title ? ` title="${escapeHtml(title)}"` : '';
      const rel = ' rel="noopener noreferrer" target="_blank"';
      return `<a href="${h}"${tt}${rel}>${t}</a>`;
    });
    // inline code `code`
    out = out.replace(/`([^`]+)`/g, (m, code) => `<code>${escapeHtml(code)}</code>`);
    // bold **text**
    out = out.replace(/\*\*([^*]+)\*\*/g, (m, t) => `<strong>${t}</strong>`);
    // italics *text*
    out = out.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, (m, pre, t) => `${pre}<em>${t}</em>`);
    return out;
  }

  function toHtml(mdText) {
    const lines = String(mdText).replace(/\r\n?/g, '\n').split('\n');
    const out = [];
    let i = 0;
    let inCode = false;
    let listType = null; // 'ul' or 'ol'
    let listBuffer = [];

    function flushParagraph(buffer) {
      const text = buffer.join(' ').trim();
      if (text) out.push(`<p>${inline(text)}</p>`);
      buffer.length = 0;
    }
    function flushList() {
      if (!listType || !listBuffer.length) return;
      const items = listBuffer.map(li => `<li>${inline(li)}</li>`).join('');
      out.push(`<${listType}>${items}</${listType}>`);
      listType = null;
      listBuffer = [];
    }

    const pbuf = [];
    while (i < lines.length) {
      const raw = lines[i++];
      const line = raw.replace(/\t/g, '    ');

      // fenced code blocks ```
      if (/^```/.test(line)) {
        if (!inCode) {
          flushList();
          flushParagraph(pbuf);
          inCode = true;
          out.push('<pre><code>');
        } else {
          inCode = false;
          out.push('</code></pre>');
        }
        continue;
      }
      if (inCode) {
        out.push(escapeHtml(raw) + '\n');
        continue;
      }

      if (!line.trim()) {
        flushList();
        flushParagraph(pbuf);
        continue;
      }

      // headings
      const h = line.match(/^(#{1,6})\s+(.*)$/);
      if (h) {
        flushList();
        flushParagraph(pbuf);
        const level = h[1].length;
        out.push(`<h${level}>${inline(h[2].trim())}</h${level}>`);
        continue;
      }

      // blockquote
      const bq = line.match(/^>\s?(.*)$/);
      if (bq) {
        flushList();
        flushParagraph(pbuf);
        out.push(`<blockquote><p>${inline(bq[1])}</p></blockquote>`);
        continue;
      }

      // lists
      const ul = line.match(/^\s*[-*]\s+(.*)$/);
      const ol = line.match(/^\s*\d+\.\s+(.*)$/);
      if (ul || ol) {
        const type = ul ? 'ul' : 'ol';
        const text = (ul ? ul[1] : ol[1]).trim();
        if (listType && listType !== type) flushList();
        listType = type;
        listBuffer.push(text);
        continue;
      } else if (listType) {
        // list terminated
        flushList();
      }

      // paragraph accumulation
      pbuf.push(line.trim());
    }
    // flush end
    flushList();
    flushParagraph(pbuf);
    return out.join('\n');
  }

  window.Markdown = { toHtml };
})();

