import { escapeHtml as e, localUrl } from '../html.js';
import { renderMarkdown, renderRoleGrid } from '../markdown.js';
import { normalizeTags } from '../content/taxonomy.js';
import { projectGallery } from '../components/project-gallery.js';

function tagLinks(tags, className, label) {
  return `<ul class="${className}" aria-label="${label}">${tags.map(tag => `<li><a href="/projects.html?tag=${e(encodeURIComponent(tag))}">${e(tag)}</a></li>`).join('')}</ul>`;
}

function projectExtras(body, data) {
  return renderMarkdown(body, data)
    .replace(/(<h2 id="features?">[\s\S]*?<\/h2>)([\s\S]*?)(?=<h2\b|$)/g, (_, heading, content) =>
      `<section class="project-features" aria-label="Features">${heading}${content.replace(/(?:\s*<hr>\s*)+$/, '')}</section>`)
    .replace(/(?:\s*<hr>\s*)+$/, '');
}

// The template owns the section order; detailed prose lives in the Markdown body.
export function projectDetail(doc, { featuredDevlogHtml }) {
  const data = doc.data;
  const tags = normalizeTags(data.tags);
  return `<div class="document-layout with-sidebar project-detail-layout">
    ${featuredDevlogHtml}
    <article class="document">
      <header class="document-heading"><h1>${e(data.title)}</h1></header>
      ${projectGallery(data)}
      <div class="project-body prose">
        ${data.hook ? `<blockquote class="project-hook">${renderMarkdown(data.hook)}</blockquote>` : ''}
        <section class="project-roles" aria-labelledby="project-roles-heading"><h2 id="project-roles-heading">Roles</h2>${data.roles ? renderRoleGrid(data.roles) : '<p class="project-missing">Not specified.</p>'}</section>
        ${doc.body.trim() ? `<div class="project-extra">${projectExtras(doc.body, data)}</div>` : ''}
      </div>
    </article>
    <aside class="project-sidebar" aria-label="Project details">
      ${tags.length ? `<section class="project-sidebar-tags"><h2>Tags</h2>${tagLinks(tags, 'project-tags', 'Project tags')}</section>` : ''}
      ${data.skills?.length ? `<section class="project-skills"><h2>Skills</h2>${tagLinks(data.skills, 'tech-stack-tags skill-tags', 'Skills')}</section>` : ''}
      <section><h2>Development date</h2>${data.development_date ? renderMarkdown(data.development_date) : '<p>Not specified.</p>'}</section>
      <section><h2>Tech Stack</h2>${data.tech_stack?.length ? tagLinks(data.tech_stack, 'tech-stack-tags', 'Tech Stack') : '<p>Not specified.</p>'}</section>
      <section><h2>Team</h2>${data.team ? renderMarkdown(data.team) : '<p>Not specified.</p>'}</section>
      <section><h2>Links</h2>${data.links?.length ? `<ul class="project-links">${data.links.map(link => `<li><a href="${e(localUrl(link.url))}">${e(link.label)} <span aria-hidden="true">↗</span></a></li>`).join('')}</ul>` : '<p>Not available.</p>'}</section>
    </aside>
  </div>`;
}
