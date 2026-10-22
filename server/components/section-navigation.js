import { escapeHtml as e } from '../html.js';

export function sectionNavigation(headings) {
  if (headings.length < 2) return '';
  const baseLevel = Math.min(...headings.map(heading => heading.level));
  return `<nav class="section-navigation" aria-label="On this page">
    <p class="section-navigation-label">On this page</p>
    <ul>${headings.map(heading => `<li style="--section-depth:${heading.level - baseLevel}"><a href="#${e(encodeURIComponent(heading.id))}">${e(heading.label)}</a></li>`).join('')}</ul>
    <a class="section-back-top" href="#main">↑ Back to top</a>
  </nav>`;
}
