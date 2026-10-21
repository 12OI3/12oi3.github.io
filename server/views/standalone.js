import { escapeHtml as e } from '../html.js';
import { renderMarkdown } from '../markdown.js';
import { layout } from './layout.js';

export function standalonePage(state, name) {
  const page = state.pages[name];
  return layout(`<article class="standalone prose">${page.data.title ? `<h1>${e(page.data.title)}</h1>` : ''}${renderMarkdown(page.body, page.data)}</article>`, {
    site: state.site, title: page.data.title || (name === '404' ? 'Page not found' : name), url: `/${name}.html`,
  });
}
