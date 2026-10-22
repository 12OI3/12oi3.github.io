import { escapeHtml as e, localUrl } from '../html.js';
import { plainText } from '../markdown.js';

export function linkedProjectCards(state, doc) {
  if (doc.type !== 'devlog' || !doc.linkedProjects?.length) return '';
  const projects = doc.linkedProjects.map(link => state.collections.project.find(project => project.url === link.url));
  return `<section class="linked-project-cards" aria-labelledby="linked-project-cards-heading">
    <h2 id="linked-project-cards-heading">${projects.length === 1 ? 'Related project' : 'Related projects'}</h2>
    <div class="linked-project-card-list">${projects.map(project => `<a class="linked-project-card${project.data.teaser ? '' : ' without-image'}" href="${e(localUrl(project.url))}">
      ${project.data.teaser ? `<img src="${e(localUrl(project.data.teaser))}" alt="" loading="lazy" decoding="async">` : ''}
      <div class="linked-project-card-copy"><h3>${e(project.data.title)}</h3>
        ${project.data.hook ? `<p>${e(plainText(project.data.hook))}</p>` : ''}
        <span class="linked-project-card-cta">View project <span aria-hidden="true">↗</span></span>
      </div>
    </a>`).join('')}</div>
  </section>`;
}
