import { escapeHtml as e } from '../html.js';
import { renderMarkdown, plainText } from '../markdown.js';
import { collectionNames, catImages } from '../config.js';
import { backToTopCat } from '../components/cat.js';
import { layout } from './layout.js';
import { projectEntries } from './projects.js';
import { journalEntries } from './journals.js';

export function collectionPage(state, type) {
  const name = collectionNames[type];
  const page = state.pages[name];
  const entries = state.collections[type].filter(doc => doc.data.hidden !== true);
  const usesJournal = type === 'devlog' || type === 'article';
  const heading = usesJournal
    ? `<header class="page-heading journal-heading"><div class="journal-heading-copy"><h1>${e(page.data.title)}</h1><div class="page-intro">${renderMarkdown(page.body, page.data)}</div></div>${backToTopCat(catImages[type])}</header>`
    : `<header class="page-heading"><h1>${e(page.data.title)}</h1><div class="page-intro">${renderMarkdown(page.body, page.data)}</div></header>`;
  return layout(usesJournal ? heading + journalEntries(entries) : projectEntries(entries, page.data.pinned_tags, heading), {
    site: state.site, title: page.data.title, active: `/${name}.html`, url: `/${name}.html`, description: plainText(page.body),
    bodyClass: usesJournal ? 'journal-page' : 'projects-page',
  });
}
