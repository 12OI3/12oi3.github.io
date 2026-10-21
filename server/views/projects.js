import { escapeHtml as e, localUrl } from '../html.js';
import { renderMarkdown } from '../markdown.js';
import { projectFilterTags } from '../content/taxonomy.js';
import { catImages } from '../config.js';
import { backToTopCat } from '../components/cat.js';
import { icon } from '../icons.js';
import { displayDate } from './dates.js';
import { projectCardTags } from '../components/project-tags.js';

function entryCard(doc, index) {
  const image = doc.data.teaser;
  return `<article class="entry-card ${image ? 'has-image' : 'text-only'}${doc.data.featured > 0 ? ' is-featured' : ''}" data-featured="${e(doc.data.featured ?? 0)}" data-project-tags="${e(JSON.stringify(projectFilterTags(doc.data)))}">
    ${image ? `<a class="entry-image" href="${e(doc.url)}" tabindex="-1" aria-hidden="true"><img src="${e(localUrl(image))}" alt="" ${index < 3 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></a>` : ''}
    <div class="entry-copy"><div class="entry-meta"><span class="entry-date">${e(displayDate(doc.data.time))}</span>${doc.data.featured > 0 ? `<span class="project-featured-badge" role="img" aria-label="Featured project" title="Featured project">${icon('star')}</span>` : ''}</div><h2><a href="${e(doc.url)}">${e(doc.data.title)}</a></h2>
    ${projectCardTags(doc.data.tags)}
    ${doc.data.hook ? `<div class="project-description">${renderMarkdown(doc.data.hook)}</div>` : ''}</div></article>`;
}

export function projectEntries(entries, pinnedTags = [], heading = '') {
  const tags = new Map([['featured', { name: 'Featured', count: 0 }]]);
  for (const doc of entries) for (const tag of projectFilterTags(doc.data)) {
    const key = tag.toLowerCase();
    const item = tags.get(key) || { name: tag, count: 0 };
    item.count++;
    tags.set(key, item);
  }
  const pinned = pinnedTags.filter(tag => tag.toLowerCase() !== 'featured').map(tag => tags.get(tag.toLowerCase())).filter(Boolean);
  return `<section class="project-browser" aria-label="Browse projects">
    <div class="project-overview">${heading}${backToTopCat(catImages.project)}</div>
    <div class="project-filters" hidden>
      <div class="tag-select"><select id="project-tag" aria-label="Filter by tag" aria-controls="project-results">
        <option value="">All tags</option>${[...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).map(tag => `<option value="${e(tag.name)}">${e(tag.name)} (${tag.count})</option>`).join('')}
      </select></div><div class="pinned-tags" role="group" aria-label="Pinned tags">
        <button type="button" class="tag-filter" data-tag="Featured" aria-pressed="false">Featured <span>${tags.get('featured').count}</span></button>
        ${pinned.map(tag => `<button type="button" class="tag-filter" data-tag="${e(tag.name)}" aria-pressed="false">${e(tag.name)} <span>${tag.count}</span></button>`).join('')}
        <button type="button" class="tag-filter" data-active-tag aria-pressed="true" aria-controls="project-results" hidden></button>
      </div>
      <p class="project-count" role="status" aria-live="polite" aria-atomic="true">Showing all ${entries.length} projects</p>
    </div>
    <div id="project-results" class="entries project-grid">${entries.map(entryCard).join('')}</div>
    <div class="project-empty" hidden><p>No projects match this tag.</p><button class="button" type="button" data-clear-tags>Show all projects</button></div>
  </section>`;
}
