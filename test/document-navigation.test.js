import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { loadContent } from '../server/content.js';
import { documentPage } from '../server/views.js';

test('document navigation follows each collection and stops at its boundaries', async () => {
  const state = await loadContent();
  for (const type of ['project', 'devlog', 'article']) {
    const entries = state.collections[type].filter(doc => !doc.data.hidden);
    for (const [index, doc] of entries.entries()) {
      const $ = load(documentPage(state, doc));
      assert.equal($('.back-link').length, 0);
      assert.equal($('.document-navigation [rel="prev"]').attr('href'), entries[index + 1]?.url);
      assert.equal($('.document-navigation [rel="next"]').attr('href'), entries[index - 1]?.url);
      assert.equal($('.document-navigation .document-nav-link').length, 2);
    }
  }
});

test('navigation skips hidden and unpublished destinations', async () => {
  const state = await loadContent();
  const docs = state.collections.article.slice(0, 4);
  const collection = docs.map((doc, index) => ({
    ...doc, data: { ...doc.data, hidden: index === 1, published: index !== 2 },
  }));
  state.collections.article = collection;
  const first = load(documentPage(state, collection[0]));
  const last = load(documentPage(state, collection[3]));
  assert.equal(first('.document-navigation [rel="prev"]').attr('href'), collection[3].url);
  assert.equal(last('.document-navigation [rel="next"]').attr('href'), collection[0].url);
});
