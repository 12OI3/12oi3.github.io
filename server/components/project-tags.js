import { escapeHtml as e } from '../html.js';

export function projectCardTags(tags = []) {
  return tags.length ? `<ul class="project-card-tags" aria-label="Project tags">${tags.map(tag => `<li><a href="/projects.html?tag=${e(encodeURIComponent(tag))}">${e(tag)}</a></li>`).join('')}</ul>` : '';
}
