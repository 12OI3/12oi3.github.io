import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { loadContent } from '../server/content.js';
import { documentPage } from '../server/views.js';

test('section navigation targets rendered article and devlog headings, excluding comments and project cards', async () => {
  const state = await loadContent();
  for (const type of ['article', 'devlog']) {
    for (const doc of state.collections[type]) {
      const $ = load(documentPage(state, doc));
      const headings = $('.reading-content > .prose').find('h1[id],h2[id],h3[id]');
      const links = $('.section-navigation li a');
      assert.equal(links.length, headings.length < 2 ? 0 : headings.length, doc.slug);
      links.each((i, link) => {
        assert.equal(decodeURIComponent($(link).attr('href').slice(1)), headings.eq(i).attr('id'));
        assert.equal($(link).text(), headings.eq(i).text());
      });
    }
  }
  assert.equal(load(documentPage(state, state.collections.project[0]))('.section-navigation').length, 0);
});

test('navigation preserves duplicate heading anchors, inline formatting and hierarchy without indexing code', async () => {
  const state = await loadContent();
  const doc = { ...state.collections.devlog[0], body: '## A & B\n## A & B\n### **Nested** `code`\n```md\n## Not a heading\n```\n<!--\n## Hidden\n-->' };
  const $ = load(documentPage(state, doc));
  assert.deepEqual($('.section-navigation li a').map((_, el) => $(el).attr('href')).get(), ['#a-b', '#a-b-2', '#nested-code']);
  assert.deepEqual($('.section-navigation li a').map((_, el) => $(el).text()).get(), ['A & B', 'A & B', 'Nested code']);
  assert.equal($('.section-navigation li').last().attr('style'), '--section-depth:1');
  doc.body = 'A short post without sections.';
  assert.equal(load(documentPage(state, doc))('.section-navigation').length, 0);
});
