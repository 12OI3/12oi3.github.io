import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { normalizeTags, loadContent } from '../server/content.js';
import { collectionPage } from '../server/views.js';

test('tags accept multiword names, normalize author input, and reject malformed metadata', () => {
  assert.deepEqual(normalizeTags(undefined), []);
  assert.deepEqual(normalizeTags([' Unity ', '#unity', 'Financial Literacy', 'C++']), ['Unity', 'Financial Literacy', 'C++']);
  for (const invalid of ['Unity', null, [1], [' '], ['#']]) {
    assert.throws(() => normalizeTags(invalid, 'example.md tags'), /example.md tags must be a YAML list/);
  }
});

test('project filters derive counts and pinned buttons from visible projects, safely preserving tag names', async () => {
  const state = await loadContent();
  state.pages.projects.data.pinned_tags = ['puzzle', 'Unused', 'C++'];
  const doc = (title, tags, hidden = false) => ({ data: { title, tags, hidden, time: '2026-05a' }, url: '/project/example/' });
  state.collections.project = [doc('First', ['Puzzle', 'C++']), doc('Second', ['puzzle', 'Financial Literacy']), doc('Untagged', []), doc('Hidden', ['Unused'], true), doc('Escaped', ['<tag> " &'])];
  const $ = load(collectionPage(state, 'project'));
  assert.deepEqual($('.entry-card h2').map((_, el) => $(el).text()).get(), ['First', 'Second', 'Untagged', 'Escaped']);
  assert.deepEqual($('.tag-filter').map((_, el) => $(el).attr('data-tag')).get(), ['', 'Puzzle', 'C++']);
  assert.equal($('.tag-filter[data-tag="Puzzle"] span').text(), '2');
  assert.equal($('#project-tag option[value="Unused"]').length, 0);
  assert.equal($('#project-tag option').filter((_, el) => $(el).attr('value') === '<tag> " &').length, 1);
  assert.deepEqual(JSON.parse($('.entry-card').last().attr('data-project-tags')), ['<tag> " &']);
  assert.equal($('.project-filters[hidden]').length, 1, 'Controls stay hidden until JavaScript enhances the page');
  assert.equal($('.entry-card[hidden]').length, 0, 'Every project is readable without JavaScript');
  assert.equal($('.entry-date').first().text(), '2026-05');
});
