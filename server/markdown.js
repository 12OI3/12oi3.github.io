import MarkdownIt from 'markdown-it';
import attrs from 'markdown-it-attrs';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

// Old Markdown includes spaces in local URLs. Encode those paths without
// changing link text or stored content. Keep # in article filenames as %23.
export function localUrl(value) {
  if (!value?.startsWith('/')) return value || '';
  const fragment = value.startsWith('/article/') ? (value.match(/\/(#[^/]*)$/)?.[1] || '') : (value.match(/#[^/]*$/)?.[0] || '');
  const pathname = fragment ? value.slice(0, -fragment.length) : value;
  return pathname.split('/').map(segment => {
    try { return encodeURIComponent(decodeURIComponent(segment)); } catch { return encodeURIComponent(segment); }
  }).join('/') + fragment;
}

const md = new MarkdownIt({ html: true, linkify: true, typographer: false }).use(attrs);
const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, index, options, env, self) => {
  tokens[index].attrSet('loading', 'lazy');
  tokens[index].attrSet('decoding', 'async');
  return defaultImage(tokens, index, options, env, self);
};
md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
  const text = tokens[index + 1]?.content || '';
  const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
  env.headings ??= new Map();
  const count = (env.headings.get(base) || 0) + 1;
  env.headings.set(base, count);
  tokens[index].attrSet('id', count === 1 ? base : `${base}-${count}`);
  return self.renderToken(tokens, index, options);
};

function gallery(data, name, layout) {
  const images = data[name];
  if (!Array.isArray(images)) throw new Error(`Unknown gallery: ${name}`);
  return `<figure class="gallery ${escapeHtml(layout || (images.length === 2 ? 'half' : 'third'))}">${images.map(img => {
    const image = `<img src="${escapeHtml(localUrl(img.image_path))}" alt="${escapeHtml(img.alt)}" loading="lazy" decoding="async">`;
    return img.url ? `<a href="${escapeHtml(localUrl(img.url))}"${img.title ? ` title="${escapeHtml(img.title)}"` : ''}>${image}</a>` : image;
  }).join('')}</figure>`;
}

function feature(data, name, type) {
  if (!Array.isArray(data[name])) throw new Error(`Unknown feature row: ${name}`);
  if (name === 'intro') {
    return `<section class="feature-row feature-center">${data[name].map(item => `
      <article class="feature-item">
        <header class="intro-header">
          ${item.image_path ? `<img class="feature-image" src="${escapeHtml(localUrl(item.image_path.startsWith('/') ? item.image_path : '/' + item.image_path))}" alt="${escapeHtml(item.alt)}" fetchpriority="high">` : ''}
          <div class="intro-identity"><h1>${escapeHtml(item.title)}</h1>${renderMarkdown(item.tagline || '', data)}</div>
        </header>
        <div class="feature-copy">${renderMarkdown(item.excerpt || '', data)}</div>
      </article>`).join('')}</section>`;
  }
  return `<section class="feature-row feature-${escapeHtml(type)}">${data[name].map(item => `
    <article class="feature-item">
      ${item.image_path ? `<img class="feature-image" src="${escapeHtml(localUrl(item.image_path.startsWith('/') ? item.image_path : '/' + item.image_path))}" alt="${escapeHtml(item.alt)}" ${name === 'intro' ? 'fetchpriority="high"' : 'loading="lazy"'}>` : ''}
      <div class="feature-copy">${item.title ? `<${name === 'intro' ? 'h1' : 'h2'}>${type === 'project' && item.url ? `<a class="feature-project-link" href="${escapeHtml(localUrl(item.url))}">${escapeHtml(item.title)}</a>` : escapeHtml(item.title)}</${name === 'intro' ? 'h1' : 'h2'}>` : ''}
      ${renderMarkdown(item.excerpt || '', data)}
      ${item.url && type !== 'project' ? `<a class="button" href="${escapeHtml(localUrl(item.url))}">${escapeHtml(item.btn_label || 'More')}</a>` : ''}</div>
    </article>`).join('')}</section>`;
}

export function renderMarkdown(source, data = {}) {
  let text = source.replace(/\]\((\/[^\n]*?)\)/g, (_, url) => `](${localUrl(url)})`);
  text = text.replace(/<(h[1-6])>([^\n]+)<\/\1>\r?\n\{\.([^}]+)\}/g,
    (_, tag, heading, classes) => `<${tag} class="${escapeHtml(classes.replace(/\s+\./g, ' '))}">${heading}</${tag}>`);
  text = text.replace(/^(\{[^}\n]+\})[ \t]*$/gm, '$1\n');
  // Expand explicit content components before Markdown. HTML blocks stay intact.
  text = text.replace(/^:::gallery\s+(\S+)(?:[ \t]+(\S+))?[ \t]*\r?\n:::[ \t]*$/gm,
    (_, name, layout) => `\n${gallery(data, name, layout)}\n`);
  text = text.replace(/^:::feature\s+(\S+)[ \t]+(\S+)[ \t]*\r?\n:::[ \t]*$/gm,
    (_, name, type) => `\n${feature(data, name, type).replace(/\n\s*/g, '')}\n`);
  return md.render(text, {});
}

export function plainText(source) {
  return renderMarkdown(source).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}
