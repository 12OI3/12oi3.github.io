import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('Featured sorts descending, preserves ties, and restores normal order on clearing or history navigation', async () => {
  const element = (dataset = {}) => ({
    dataset, handlers: {}, attributes: {}, hidden: false,
    addEventListener(name, fn) { this.handlers[name] = fn; },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name]; },
    removeAttribute(name) { delete this.attributes[name]; },
    focus() {},
  });
  const cards = [0, 2, 8, 2, -1].map((priority, index) => Object.assign(element({
    featured: String(priority), projectTags: JSON.stringify(['Puzzle', ...(priority > 0 ? ['Featured'] : [])]),
  }), { index }));
  const results = element();
  results.children = [...cards];
  results.append = card => { results.children = results.children.filter(item => item !== card); results.children.push(card); };
  const select = element();
  select.options = ['', 'Featured', 'Puzzle'].map(value => ({ value }));
  select.querySelector = () => null;
  const button = element({ tag: 'Featured' });
  const nodes = {
    '.project-filters': element(), '#project-tag': select,
    '[data-active-tag]': element(), '.project-count': element(),
    '.project-empty': element(), '#project-results': results, '[data-clear-tags]': element(),
  };
  const browser = {
    querySelector: selector => nodes[selector],
    querySelectorAll: selector => selector === '[data-tag]' ? [button] : cards,
  };
  const window = {
    location: { href: 'https://example.com/projects.html?tag=featured' },
    history: { pushState(_state, _title, url) { window.location.href = url.href; } },
    addEventListener(name, fn) { this[name] = fn; },
  };
  const source = await readFile(new URL('../public/behaviors/project-filters.js', import.meta.url), 'utf8');
  vm.runInNewContext(source.replace('export function', 'function') + '\ninitProjectFilters();', {
    document: { querySelector: () => browser }, window, URL,
  });
  const visible = () => results.children.filter(card => !card.hidden).map(card => card.index);
  assert.deepEqual(visible(), [2, 1, 3]);
  button.handlers.click();
  assert.deepEqual(visible(), [0, 1, 2, 3, 4]);
  select.value = 'Featured';
  select.handlers.change();
  assert.deepEqual(visible(), [2, 1, 3]);
  select.value = 'Puzzle';
  select.handlers.change();
  assert.deepEqual(visible(), [0, 1, 2, 3, 4]);
  window.location.href = 'https://example.com/projects.html?tag=Featured';
  window.popstate();
  assert.deepEqual(visible(), [2, 1, 3]);
  nodes['[data-clear-tags]'].handlers.click();
  assert.deepEqual(visible(), [0, 1, 2, 3, 4]);
});
