import { escapeHtml as e } from '../html.js';
import { renderMarkdown } from '../markdown.js';
import { displayDate } from './dates.js';
import { devlogSkills } from '../components/devlog-skills.js';

export function journalEntries(entries) {
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
          <div class="journal-subtitle"><div class="journal-excerpt">${renderMarkdown(doc.data.excerpt || '')}</div>${devlogSkills(doc)}</div></div>
        </article>`;
      }).join('')}
    </section>`).join('')}</div>`;
}
