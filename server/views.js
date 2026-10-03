import { escapeHtml as e, localUrl, renderMarkdown, plainText } from './markdown.js';
import { collectionNames } from './content.js';

function layout(content, { site, title, active = '/', description = '', url = '/', bodyClass = '' }) {
  const canonical = new URL(url, process.env.SITE_URL || site.url).href;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#28233f">
<title>${e(title ? `${title} — ${site.title}` : site.title)}</title>
<meta name="description" content="${e(description)}">
<link rel="canonical" href="${e(canonical)}">
<meta property="og:title" content="${e(title || site.title)}"><meta property="og:description" content="${e(description)}">
<meta property="og:type" content="website"><meta property="og:url" content="${e(canonical)}">
<link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/ui/site.css?v=journal">
<script src="/ui/site.js" defer></script>
</head><body class="${e(bodyClass)}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead"><div class="nav-shell">
<a class="brand" href="/" aria-label="${e(site.title)} home"><span>${e(site.title.toUpperCase())}</span></a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation">Menu <span aria-hidden="true">☰</span></button>
<nav id="navigation" aria-label="Main navigation">${site.navigation.map(link => `<a href="${e(link.url)}"${active === link.url ? ' aria-current="page"' : ''}>${e(link.title)}</a>`).join('')}</nav>
</div></header>
<main id="main" class="shell">${content}</main>
<footer class="site-footer"><div class="shell"><div class="footer-top"><a class="footer-name" href="/">${e(site.title)}</a><a href="#main" class="back-top">Back to top ↑</a></div>
<nav aria-label="Social links">${site.footer.map(link => `<a href="${e(localUrl(link.url))}"${/^https?:/.test(link.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${e(link.label)}<span aria-hidden="true"> ↗</span></a>`).join('')}</nav>
<p class="copyright">© ${new Date().getFullYear()} ${e(site.title)}.</p></div></footer>
<dialog class="lightbox" aria-label="Image viewer"><button class="lightbox-close" autofocus aria-label="Close image">Close ×</button><img alt=""></dialog>
</body></html>`;
}

export function homePage(state) {
  const page = state.pages.home;
  return layout(`<div class="home-content">${renderMarkdown(page.body, page.data)}</div>`, {
    site: state.site, bodyClass: 'home', description: plainText([page.data.intro?.[0]?.tagline, page.data.intro?.[0]?.excerpt].filter(Boolean).join(' ')),
  });
}

function displayDate(value) {
  return String(value ?? '').replace(/^(\d{4}-\d{2}(?:-\d{2})?)[a-z]+$/i, '$1');
}

function entryCard(doc, index) {
  const image = doc.data.header?.teaser;
  return `<article class="entry-card ${image ? 'has-image' : 'text-only'}" data-project-tags="${e(JSON.stringify(doc.data.tags || []))}">
    ${image ? `<a class="entry-image" href="${e(doc.url)}" tabindex="-1" aria-hidden="true"><img src="${e(localUrl(image))}" alt="" ${index < 3 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"></a>` : ''}
    <div class="entry-copy"><span class="entry-date">${e(displayDate(doc.data.time))}</span><h2><a href="${e(doc.url)}">${e(doc.data.title)}</a></h2>
    ${doc.data.excerpt ? `<div class="entry-excerpt">${renderMarkdown(doc.data.excerpt)}</div>` : ''}
    <ul class="project-tags" aria-label="Tags">${(doc.data.tags || []).map(tag => `<li>#${e(tag)}</li>`).join('')}</ul></div></article>`;
}

function projectEntries(entries, pinnedTags = [], heading = '') {
  const tags = new Map();
  for (const doc of entries) for (const tag of doc.data.tags || []) {
    const key = tag.toLowerCase();
    const item = tags.get(key) || { name: tag, count: 0 };
    item.count++;
    tags.set(key, item);
  }
  const pinned = pinnedTags.map(tag => tags.get(tag.toLowerCase())).filter(Boolean);
  return `<section class="project-browser" aria-label="Browse projects">
    <div class="project-overview">${heading}
    <div class="project-filters" hidden>
      <div class="project-filter-row"><div class="tag-select"><label for="project-tag">Filter by tag</label><select id="project-tag" aria-controls="project-results">
        <option value="">All tags</option>${[...tags.values()].sort((a, b) => a.name.localeCompare(b.name)).map(tag => `<option value="${e(tag.name)}">${e(tag.name)} (${tag.count})</option>`).join('')}
      </select></div><div class="pinned-tags" role="group" aria-label="Pinned tags">
        <button type="button" class="tag-filter" data-tag="" aria-pressed="true">All projects <span>${entries.length}</span></button>
        ${pinned.map(tag => `<button type="button" class="tag-filter" data-tag="${e(tag.name)}" aria-pressed="false">${e(tag.name)} <span>${tag.count}</span></button>`).join('')}
      </div></div>
      <p class="project-count" role="status" aria-live="polite" aria-atomic="true">Showing all ${entries.length} projects</p>
    </div></div>
    <div id="project-results" class="entries project-grid">${entries.map(entryCard).join('')}</div>
    <div class="project-empty" hidden><p>No projects match this tag.</p><button class="button" type="button" data-clear-tags>Show all projects</button></div>
  </section>`;
}

function journalEntries(entries) {
  const years = new Map();
  for (const doc of entries) {
    const year = String(doc.data.time).match(/^\d{4}/)?.[0] || 'Undated';
    if (!years.has(year)) years.set(year, []);
    years.get(year).push(doc);
  }
  const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `<div class="entries journal-entries">${[...years].map(([year, docs]) => `
    <section class="journal-year-group" aria-labelledby="journal-year-${e(year)}">
      <h2 class="journal-year" id="journal-year-${e(year)}">${e(year)}</h2>
      ${docs.map(doc => {
        const rawDate = displayDate(doc.data.time);
        const date = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? new Date(`${rawDate}T00:00:00Z`) : null;
        const dateLabel = date && !Number.isNaN(date.getTime()) ? dateFormat.format(date) : rawDate;
        return `<article class="journal-entry">
          <time class="journal-date" datetime="${e(rawDate)}">${e(dateLabel)}</time>
          <div class="journal-copy"><h3><a href="${e(doc.url)}">${e(doc.data.title)}</a></h3>
          <div class="journal-excerpt">${renderMarkdown(doc.data.excerpt || '')}</div></div>
        </article>`;
      }).join('')}
    </section>`).join('')}</div>`;
}

export function collectionPage(state, type) {
  const name = collectionNames[type];
  const page = state.pages[name];
  const entries = state.collections[type].filter(doc => doc.data.hidden !== true);
  const usesJournal = type === 'devlog' || type === 'article';
  const heading = `<header class="page-heading"><span class="eyebrow">${e(state.site.name)} / ${e(page.data.title)}</span><h1>${e(page.data.title)}</h1><div class="page-intro">${renderMarkdown(page.body, page.data)}</div></header>`;
  return layout(usesJournal ? heading + journalEntries(entries) : projectEntries(entries, page.data.pinned_tags, heading), {
    site: state.site, title: page.data.title, active: `/${name}.html`, url: `/${name}.html`, description: plainText(page.body),
    bodyClass: usesJournal ? 'journal-page' : 'projects-page',
  });
}

export function documentPage(state, doc) {
  const name = collectionNames[doc.type];
  const sidebar = doc.data.sidebar || [];
  const hasSidebar = sidebar.length > 0 || doc.linkedDevlogs?.length > 0;
  const title = state.pages[name].data.title;
  const readingTime = Math.max(1, Math.floor(doc.body.split(/\s+/).length / 200));
  const comments = state.site.comments;
  const commentUrl = new URL(doc.url, state.site.url).href;
  const linkedProjectHtml = doc.linkedProject ? `<p class="linked-project">Project: <a href="${e(doc.linkedProject.url)}">${e(doc.linkedProject.title)}</a></p>` : '';
  const linkedDevlogsHtml = doc.linkedDevlogs?.length ? `<section class="linked-devlogs" aria-labelledby="linked-devlogs-heading">
    <h2 id="linked-devlogs-heading">Devlogs</h2><ul>${doc.linkedDevlogs.map(devlog => `<li><a href="${e(devlog.url)}">${e(devlog.data.title)}</a></li>`).join('')}</ul></section>` : '';
  const commentsHtml = comments?.provider === 'disqus' && doc.data.comments !== false ? `
    <section class="comments" aria-label="Comments"><h2>Comments</h2><div id="disqus_thread" data-shortname="${e(comments.shortname)}" data-url="${e(commentUrl)}" data-identifier="${e(`/${doc.type}/${doc.slug}`)}"><button class="button load-comments" type="button">Load comments</button></div></section>` : '';
  return layout(`<div class="document-top"><a class="back-link" href="/${name}.html">← ${e(title)}</a><span class="eyebrow">${e(displayDate(doc.data.time))}${doc.type !== 'project' ? ` · ${readingTime} min read` : ''}</span></div>
    <div class="document-layout ${hasSidebar ? 'with-sidebar' : ''}">
    <article class="document"><header class="document-heading"><h1>${e(doc.data.title)}</h1>${linkedProjectHtml}</header><div class="prose">${renderMarkdown(doc.body, doc.data)}</div>${commentsHtml}</article>
    ${hasSidebar ? `<aside class="project-sidebar" aria-label="Project details">${sidebar.map(item => `<section>${item.title ? `<h2>${e(item.title)}</h2>` : ''}${item.text ? renderMarkdown(item.text) : ''}</section>`).join('')}${linkedDevlogsHtml}</aside>` : ''}
    </div>`, {
    site: state.site, title: doc.data.title, active: `/${name}.html`, url: doc.url,
    description: plainText(doc.data.excerpt || (doc.data.tags || []).map(tag => `#${tag}`).join(' ')), bodyClass: `detail ${doc.type}-detail`,
  });
}

export function standalonePage(state, name) {
  const page = state.pages[name];
  return layout(`<article class="standalone prose">${page.data.title ? `<h1>${e(page.data.title)}</h1>` : ''}${renderMarkdown(page.body, page.data)}</article>`, {
    site: state.site, title: page.data.title || (name === '404' ? 'Page not found' : name), url: `/${name}.html`,
  });
}
