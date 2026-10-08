import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { normalizeTags, normalizeSkills, projectFilterTags, loadContent } from '../server/content.js';
import { collectionPage } from '../server/views.js';

test('tags accept multiword names, normalize author input, and reject malformed metadata', () => {
  assert.deepEqual(normalizeTags(undefined), []);
  assert.deepEqual(normalizeTags([' Unity ', '#unity', 'Financial Literacy', 'C++']), ['Unity', 'Financial Literacy', 'C++']);
  for (const invalid of ['Unity', null, [1], [' '], ['#']]) {
    assert.throws(() => normalizeTags(invalid, 'example.md tags'), /example.md tags must be a YAML list/);
  }
});

test('skills are separate from normal tags while dropdown and pinned filters include both', async () => {
  const state = await loadContent();
  const skills = ['Technical Game Design', 'Tools', 'UI/UX'];
  state.pages.projects.data.pinned_tags = skills;
  const $ = load(collectionPage(state, 'project'));
  for (const project of state.collections.project) {
    assert.ok(Array.isArray(project.data.skills));
    assert.ok(project.data.skills.every(skill => skills.includes(skill)));
    assert.ok(project.data.tags.every(tag => !skills.includes(tag)));
  }
  for (const skill of skills) {
    const expected = state.collections.project.filter(doc => doc.data.hidden !== true && doc.data.skills.includes(skill)).length;
    assert.ok(expected > 0);
    const option = $('#project-tag option').filter((_, el) => $(el).attr('value') === skill);
    assert.equal(option.text(), `${skill} (${expected})`);
    assert.equal($('.tag-filter').filter((_, el) => $(el).attr('data-tag') === skill).find('span').text(), String(expected));
    assert.equal($('.project-tags li').filter((_, el) => $(el).text() === `#${skill}`).length, 0);
    assert.equal($('.entry-card').filter((_, el) => JSON.parse($(el).attr('data-project-tags')).includes(skill)).length, expected);
  }
});

test('skills normalize to the three supported labels and filters deduplicate all labels', () => {
  assert.deepEqual(normalizeSkills(undefined), []);
  assert.deepEqual(normalizeSkills([' tools ', '#UI/UX', 'TOOLS', 'technical game design']), ['Tools', 'UI/UX', 'Technical Game Design']);
  for (const invalid of ['Tools', null, [1], ['Unity'], ['Design tools']]) {
    assert.throws(() => normalizeSkills(invalid, 'example.md skills'), /example.md skills/);
  }
  assert.deepEqual(projectFilterTags({ tags: ['Unity', 'Tools'], skills: ['Tools', 'UI/UX'] }), ['Unity', 'Tools', 'UI/UX']);
  assert.deepEqual(projectFilterTags({}), []);
});

test('project filters derive counts and pinned buttons from visible projects, safely preserving tag names', async () => {
  const state = await loadContent();
  state.pages.projects.data.pinned_tags = ['puzzle', 'Unused', 'C++'];
  const doc = (title, tags, hidden = false) => ({ data: { title, tags, hidden, time: '2026-05a' }, url: '/project/example/' });
  state.collections.project = [doc('First', ['Puzzle', 'C++']), doc('Second', ['puzzle', 'Financial Literacy']), doc('Untagged', []), doc('Hidden', ['Unused'], true), doc('Escaped', ['<tag> " &'])];
  const $ = load(collectionPage(state, 'project'));
  assert.deepEqual($('.entry-card h2').map((_, el) => $(el).text()).get(), ['First', 'Second', 'Untagged', 'Escaped']);
  assert.deepEqual($('.tag-filter').map((_, el) => $(el).attr('data-tag')).get(), ['Featured', 'Puzzle', 'C++']);
  assert.equal($('.tag-filter[aria-pressed="true"]').length, 0);
  assert.equal($('.tag-filter[data-tag="Puzzle"] span').text(), '2');
  assert.equal($('#project-tag option[value="Unused"]').length, 0);
  assert.equal($('#project-tag option').filter((_, el) => $(el).attr('value') === '<tag> " &').length, 1);
  assert.deepEqual(JSON.parse($('.entry-card').last().attr('data-project-tags')), ['<tag> " &']);
  assert.equal($('.project-filters[hidden]').length, 1, 'Controls stay hidden until JavaScript enhances the page');
  assert.equal($('.entry-card[hidden]').length, 0, 'Every project is readable without JavaScript');
  assert.equal($('.entry-date').first().text(), '2026-05');
});

test('Featured is derived from the flag and has one automatic toggle with visible counts', async () => {
  assert.deepEqual(projectFilterTags({ tags: ['Puzzle', 'Featured'], featured: false }), ['Puzzle']);
  assert.deepEqual(projectFilterTags({ tags: ['Puzzle', 'featured'], featured: true }), ['Puzzle', 'Featured']);
  const state = await loadContent();
  state.pages.projects.data.pinned_tags = ['Featured', 'FEATURED', 'Puzzle'];
  const doc = (title, featured, hidden = false) => ({ data: { title, featured, hidden, tags: ['Puzzle'], time: '2026-01' }, url: '/project/' + title + '/' });
  state.collections.project = [doc('Featured', true), doc('Normal', false), doc('Hidden', true, true)];
  const $ = load(collectionPage(state, 'project'));
  assert.equal($('.tag-filter[data-tag="Featured"]').length, 1);
  assert.equal($('.tag-filter[data-tag="Featured"] span').text(), '1');
  assert.equal($('#project-tag option[value="Featured"]').text(), 'Featured (1)');
  assert.equal($('.entry-card').filter((_, el) => JSON.parse($(el).attr('data-project-tags')).includes('Featured')).length, 1);
  const badge = $('.project-featured-badge');
  assert.equal(badge.text(), '');
  assert.equal(badge.attr('aria-label'), 'Featured project');
  assert.equal(badge.find('svg').length, 1);
  state.collections.project = [doc('Normal', false)];
  const empty = load(collectionPage(state, 'project'));
  assert.equal(empty('.tag-filter[data-tag="Featured"] span').text(), '0');
  assert.equal(empty('#project-tag option[value="Featured"]').text(), 'Featured (0)');
});
