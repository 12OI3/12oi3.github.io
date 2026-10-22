import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { loadContent } from '../server/content.js';
import { validateDocument } from '../server/content/documents.js';
import { collectionPage, documentPage } from '../server/views.js';

test('devlog skills use the shared vocabulary and remain optional', () => {
  const data = { title: 'Update', time: '2026-10-21', skills: [' tools ', 'TOOLS', '#ui/ux'] };
  validateDocument(data, 'devlog', 'update.md');
  assert.deepEqual(data.skills, ['Tools', 'UI/UX']);
  delete data.skills;
  validateDocument(data, 'devlog', 'update.md');
  assert.deepEqual(data.skills, []);
  assert.throws(() => validateDocument({ ...data, skills: ['Unity'] }, 'devlog', 'update.md'), /update.md skills/);
});

test('devlog skills appear on listing entries and post headers, with no empty lists', async () => {
  const state = await loadContent();
  const listing = load(collectionPage(state, 'devlog'));
  for (const doc of state.collections.devlog.filter(doc => !doc.data.hidden)) {
    const entry = listing('.journal-entry').filter((_, el) => listing(el).find('h3 a').attr('href') === doc.url);
    assert.deepEqual(entry.find('.devlog-skills li').map((_, el) => listing(el).text()).get(), doc.data.skills);
    const page = load(documentPage(state, doc));
    assert.deepEqual(page('.document-heading .devlog-skills li').map((_, el) => page(el).text()).get(), doc.data.skills);
  }
  state.collections.devlog.forEach(doc => { doc.data.skills = []; });
  assert.equal(load(collectionPage(state, 'devlog'))('.devlog-skills').length, 0);
  assert.equal(load(documentPage(state, state.collections.devlog[0]))('.devlog-skills').length, 0);
  assert.equal(load(collectionPage(state, 'article'))('.devlog-skills').length, 0);
});
