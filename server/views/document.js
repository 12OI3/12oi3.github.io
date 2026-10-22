import { escapeHtml as e, localUrl } from '../html.js';
import { renderMarkdown, plainText } from '../markdown.js';
import { collectionNames } from '../config.js';
import { highlightedDevlog } from '../content/relationships.js';
import { displayDate } from './dates.js';
import { layout } from './layout.js';
import { projectDetail } from './project-detail.js';
import { linkedProjectCards } from './linked-projects.js';
import { devlogSkills } from '../components/devlog-skills.js';
import { sectionNavigation } from '../components/section-navigation.js';

export function documentPage(state, doc) {
  const name = collectionNames[doc.type];
  const sidebar = doc.data.sidebar || [];
  const hasSidebar = sidebar.length > 0 || doc.linkedDevlogs?.length > 0;
  const entries = state.collections[doc.type] || [];
  const index = entries.findIndex(entry => entry.url === doc.url);
  const visible = entry => entry.data.hidden !== true && entry.data.published !== false;
  const previous = index < 0 ? null : entries.slice(index + 1).find(visible);
  const next = index < 0 ? null : entries.slice(0, index).filter(visible).at(-1);
  const navigationLink = (entry, direction, label) => entry
    ? `<a class="document-nav-link" rel="${direction}" href="${e(localUrl(entry.url))}"><span class="document-nav-label">${label}</span><span class="document-nav-title">${e(entry.data.title)}</span></a>`
    : `<span class="document-nav-link" aria-disabled="true"><span class="document-nav-label">${label}</span><span class="document-nav-title">No ${direction === 'prev' ? 'previous' : 'next'} ${e(doc.type)}</span></span>`;
  const navigation = `<nav class="document-navigation" aria-label="${e(name)} navigation">${navigationLink(previous, 'prev', '← Previous')}${navigationLink(next, 'next', 'Next →')}</nav>`;
  const readingTime = Math.max(1, Math.floor(doc.body.split(/\s+/).length / 200));
  const comments = state.site.comments;
  const commentUrl = new URL(doc.url, state.site.url).href;
  const linkedProjectHtml = doc.linkedProjects?.length ? `<p class="linked-project">${doc.linkedProjects.length === 1 ? 'Project' : 'Projects'}: ${doc.linkedProjects.map(project => `<a href="${e(project.url)}">${e(project.title)}</a>`).join(' <span aria-hidden="true">·</span> ')}</p>` : '';
  const featuredDevlog = doc.type === 'project' ? highlightedDevlog(doc) : null;
  const featuredDevlogHtml = featuredDevlog ? `<section class="project-headline-devlog" aria-labelledby="headline-devlog-title">
    <div><p class="eyebrow">Featured devlog</p><h2 id="headline-devlog-title"><a href="${e(localUrl(featuredDevlog.url))}">${e(featuredDevlog.data.title)}</a></h2>
    ${featuredDevlog.data.excerpt ? `<p class="headline-devlog-excerpt">${e(plainText(featuredDevlog.data.excerpt))}</p>` : ''}</div>
    <span class="headline-devlog-cta" aria-hidden="true">Read devlog <span>↗</span></span>
  </section>` : '';
  const linkedDevlogsHtml = doc.linkedDevlogs?.length ? `<section class="linked-devlogs" aria-labelledby="linked-devlogs-heading">
    <h2 id="linked-devlogs-heading">Devlogs</h2><ul>${doc.linkedDevlogs.map((devlog, index) => `<li><a href="${e(devlog.url)}" aria-describedby="devlog-title-${index}">${e(plainText(devlog.data.excerpt || '').trim() || 'Read devlog')}</a><span class="devlog-title-tooltip" id="devlog-title-${index}" role="tooltip">${e(devlog.data.title)}</span></li>`).join('')}</ul></section>` : '';
  const commentsHtml = comments?.provider === 'disqus' && doc.data.comments !== false ? `
    <section class="comments" aria-label="Comments"><h2>Comments</h2><div id="disqus_thread" data-shortname="${e(comments.shortname)}" data-url="${e(commentUrl)}" data-identifier="${e(`/${doc.type}/${doc.slug}`)}"><button class="button load-comments" type="button">Load comments</button></div></section>` : '';
  const sectionHeadings = [];
  const bodyHtml = doc.type === 'project' ? '' : renderMarkdown(doc.body, doc.data, { sectionHeadings });
  const sectionNav = ['devlog', 'article'].includes(doc.type) ? sectionNavigation(sectionHeadings) : '';
  const content = doc.type === 'project' ? projectDetail(doc, { featuredDevlogHtml, linkedDevlogsHtml }) : `<div class="document-layout ${hasSidebar ? 'with-sidebar' : ''}">
    <article class="document"><header class="document-heading"><h1>${e(doc.data.title)}</h1>${linkedProjectHtml}${devlogSkills(doc)}</header><div class="reading-layout ${sectionNav ? 'has-section-navigation' : ''}"><div class="reading-content"><div class="prose">${bodyHtml}</div>${linkedProjectCards(state, doc)}${commentsHtml}</div>${sectionNav}</div></article>
    ${hasSidebar ? `<aside class="project-sidebar" aria-label="Project details">${sidebar.map(item => `<section>${item.title ? `<h2>${e(item.title)}</h2>` : ''}${item.text ? renderMarkdown(item.text) : ''}</section>`).join('')}${linkedDevlogsHtml}</aside>` : ''}
    </div>`;
  return layout(`<div class="document-top">${doc.type !== 'project' ? `<span class="eyebrow">${e(displayDate(doc.data.time))} · ${readingTime} min read</span>` : ''}${navigation}</div>${content}`, {
    site: state.site, title: doc.data.title, active: `/${name}.html`, url: doc.url,
    description: plainText(doc.data.hook || doc.data.description || doc.data.excerpt || (doc.data.tags || []).map(tag => `#${tag}`).join(' ')), bodyClass: `detail ${doc.type}-detail`,
  });
}
