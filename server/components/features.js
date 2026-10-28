import { escapeHtml, localUrl } from '../html.js';
import { icon } from '../icons.js';
import { backToTopCat } from './cat.js';
import { projectCardTags } from './project-tags.js';

// The Markdown renderer is passed in so nested feature text uses the same parser
// without creating a dependency cycle between parsing and components.
export function gallery(data, name, layout) {
  const images = data[name];
  if (!Array.isArray(images)) throw new Error(`Unknown gallery: ${name}`);
  return `<figure class="gallery ${escapeHtml(layout || (images.length === 2 ? 'half' : 'third'))}">${images.map(img => {
    const image = `<img src="${escapeHtml(localUrl(img.image_path))}" alt="${escapeHtml(img.alt)}" loading="lazy" decoding="async">`;
    return img.url ? `<a href="${escapeHtml(localUrl(img.url))}"${img.title ? ` title="${escapeHtml(img.title)}"` : ''}>${image}</a>` : image;
  }).join('')}</figure>`;
}

export function feature(data, name, type, renderMarkdown) {
  if (!Array.isArray(data[name])) throw new Error(`Unknown feature row: ${name}`);
  if (name === 'intro') {
    return `<section class="feature-row feature-center">${data[name].map(item => `
      <article class="feature-item">
        <header class="intro-header">
          <div class="intro-identity"><p class="intro-name">${escapeHtml(item.title)}</p><h1>${escapeHtml(item.role || item.title)}</h1></div>
          ${item.image_path ? backToTopCat(item.image_path) : ''}
        </header>
        <div class="feature-copy">${renderMarkdown(item.excerpt || '', data)}</div>
        <div class="intro-footer">
        ${item.actions?.length ? `<div class="intro-actions">${item.actions.map(action => `<a class="intro-action" href="${escapeHtml(localUrl(action.url))}">${icon(action.label)}<span>${escapeHtml(action.label)}</span><span class="action-arrow" aria-hidden="true">↗</span></a>`).join('')}</div>` : ''}
        </div>
        ${item.tagline ? `<div class="intro-tagline">${renderMarkdown(item.tagline, data)}</div>` : ''}
      </article>
      ${item.specialties?.length ? `<div class="intro-specialties" role="group" aria-label="Explore projects">${item.specialties.map(specialty => `<button class="specialty-button" type="button" data-tag="${escapeHtml(specialty)}" aria-controls="home-projects" aria-pressed="${specialty === data.selectedGroup}">${escapeHtml(specialty)}</button>`).join('')}<a class="specialty-more" href="/projects.html">More...</a></div>` : ''}`).join('')}</section>`;
  }
  return `<section class="feature-row feature-${escapeHtml(type)}"${type === 'project' ? ' id="home-projects" aria-label="Selected projects"' : ''}>${data[name].map(item => `
    <article class="feature-item"${type === 'project' ? ` data-home-group="${escapeHtml(item.group || '')}"${item.group !== data.selectedGroup ? ' hidden' : ''}` : ''}>
      ${item.image_path ? `<img class="feature-image" src="${escapeHtml(localUrl(item.image_path.startsWith('/') ? item.image_path : '/' + item.image_path))}" alt="${escapeHtml(item.alt)}" loading="lazy">` : ''}
      <div class="feature-copy">${item.title ? `<h2>${type === 'project' && item.url ? `<a class="feature-project-link" href="${escapeHtml(localUrl(item.url))}">${escapeHtml(item.title)}</a>` : escapeHtml(item.title)}</h2>` : ''}
      ${renderMarkdown(item.excerpt || '', data)}
      ${type === 'project' ? projectCardTags(item.tags) : ''}
      ${type === 'project' && item.hook ? `<div class="project-description">${renderMarkdown(item.hook, data)}</div>` : ''}
      ${type === 'project' && item.latestDevlog ? `<div class="feature-devlog"><span class="feature-devlog-label">Featured devlog</span><a href="${escapeHtml(localUrl(item.latestDevlog.url))}">${escapeHtml(item.latestDevlog.excerpt || item.latestDevlog.title)} <span aria-hidden="true">↗</span></a></div>` : ''}
      ${item.url && type !== 'project' ? `<a class="button" href="${escapeHtml(localUrl(item.url))}">${escapeHtml(item.btn_label || 'More')}</a>` : ''}</div>
    </article>`).join('')}</section>${type === 'project' ? `<p class="home-project-empty" role="status"${data[name].some(item => item.group === data.selectedGroup) ? ' hidden' : ''}>No projects selected for this tag yet.</p>` : ''}`;
}
