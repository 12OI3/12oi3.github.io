import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import { load } from 'cheerio';
import { loadContent, root } from '../server/content.js';
import { homePage, collectionPage, documentPage } from '../server/views.js';
import { staticPages } from '../scripts/build-site.js';

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'rob-home-projects-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(path.join(root, 'content'), directory, { recursive: true });
  const state = await loadContent(directory);
  const page = state.pages.home;
  const save = groups => writeFile(path.join(directory, 'pages/home.md'),
    `---\n${yaml.dump({ ...page.data, project_groups: groups })}---\n${page.body}`);
  return { directory, state, save };
}

test('homepage defaults to Technical Game Design and preserves project order', async t => {
  const { directory, state, save } = await fixture(t);
  const [a, b, c, d] = state.collections.project;
  await save({ Tools: [d.slug, c.slug], 'Technical Game Design': [c.slug, b.slug, a.slug, d.slug], 'UI/UX': [c.slug] });
  const updated = await loadContent(directory);
  const html = homePage(updated);
  const $ = load(html);
  const titles = selector => $(selector).map((_, el) => $(el).find('h2').text()).get();
  assert.deepEqual(titles('#home-projects article:not([hidden])'), [c.data.title, b.data.title, a.data.title, d.data.title]);
  assert.deepEqual(titles('[data-home-group="Technical Game Design"]'), [c.data.title, b.data.title, a.data.title, d.data.title]);
  assert.deepEqual(titles('[data-home-group="Tools"]'), [d.data.title, c.data.title]);
  assert.deepEqual(titles('[data-home-group="UI/UX"]'), [c.data.title]);
  assert.equal($('#home-projects article[hidden]').length, 3);
  assert.deepEqual($('.specialty-button').map((_, el) => $(el).text()).get(), ['Tools', 'Technical Game Design', 'UI/UX']);
  assert.equal($('.specialty-button[aria-pressed="true"]').text(), 'Technical Game Design');
  assert.equal($('.home-content a[href="/projects.html"]').length, 0);
  assert.ok($('#home-projects .project-description').length > 0);
  assert.ok($('#home-projects .project-card-tags').length > 0);
  assert.equal(staticPages(updated).get('index.html'), html);
  await save({ Tools: [] });
  const empty = load(homePage(await loadContent(directory)));
  assert.equal(empty('#home-projects article').length, 0);
  assert.equal(empty('.home-project-empty[hidden]').length, 0);
  assert.equal(empty('.specialty-button').text(), 'Tools');
  assert.equal(empty('.specialty-button[aria-pressed="true"]').text(), 'Tools');
  await save({ Tools: [a.slug], 'Technical Game Design': [] });
  const emptyDefault = load(homePage(await loadContent(directory)));
  assert.equal(emptyDefault('#home-projects article:not([hidden])').length, 0);
  assert.equal(emptyDefault('.home-project-empty[hidden]').length, 0);
  assert.equal(emptyDefault('.specialty-button[aria-pressed="true"]').text(), 'Technical Game Design');
});

test('homepage selections reject malformed lists, duplicates, missing, draft, and hidden projects', async t => {
  const { directory, state, save } = await fixture(t);
  const slugs = state.collections.project.slice(0, 4).map(doc => doc.slug);
  for (const groups of [[], { Tools: 'wrong' }, { Tools: [slugs[0], slugs[0]] }, { Tools: [42] }, { Tools: [' '] }, { Tools: ['missing-project'] }]) {
    await save(groups);
    await assert.rejects(loadContent(directory), /home.md: project_groups/);
  }
  for (const fields of ['published: false', 'hidden: true']) {
    await writeFile(path.join(directory, 'projects/2099-Test.md'), `---\ntitle: Test\ntime: 2099\n${fields}\n---\nBody`);
    await save({ Tools: ['2099-Test'] });
    await assert.rejects(loadContent(directory), /references unavailable project 2099-Test/);
  }
});

test('home cards show descriptions and the newest highlighted visible devlog, with a separate project link', async t => {
  const { directory, state, save } = await fixture(t);
  const [project, withoutDevlogs] = state.collections.project.filter(doc => !doc.linkedDevlogs.length);
  await save({ Tools: [project.slug, withoutDevlogs.slug] });
  for (const [name, date, extra] of [['Older', '2098-01-01', 'highlight: true'], ['Latest & best', '2099-01-01', 'highlight: true\nexcerpt: A **short** update & overview.'], ['Hidden', '2099-02-01', 'highlight: true\nhidden: true'], ['Draft', '2099-03-01', 'highlight: true\npublished: false'], ['Not featured', '2099-04-01', 'highlight: false'], ['Default', '2099-05-01', '']]) {
    await writeFile(path.join(directory, 'devlogs', `${date}-Test.md`), `---\ntitle: ${name}\ntime: ${date}\nproject: ${project.slug}\n${extra}\n---\nBody`);
  }
  const updated = await loadContent(directory);
  const $ = load(homePage(updated));
  const card = $('#home-projects article:not([hidden])').first();
  assert.equal(card.find('.feature-project-link').attr('href'), project.url);
  assert.equal(card.find('.feature-devlog a').text(), 'A short update & overview. ↗');
  assert.equal(card.find('.feature-devlog a').attr('href'), '/devlog/2099-01-01-Test/');
  assert.equal(card.find('.project-description').text().trim(), project.data.hook.trim());
  assert.deepEqual(card.find('.project-card-tags a').map((_, el) => $(el).text()).get(), project.data.tags);
  assert.equal($('#home-projects article').filter((_, el) => $(el).find('.feature-project-link').attr('href') === withoutDevlogs.url).find('.feature-devlog').length, 0);
  updated.collections.devlog.find(doc => doc.slug === '2099-01-01-Test').data.excerpt = '';
  assert.equal(load(homePage(updated))('#home-projects article:not([hidden])').first().find('.feature-devlog a').text(), 'Latest & best ↗');
  for (const devlog of updated.collections.devlog) devlog.data.highlight = false;
  assert.equal(load(homePage(updated))('.feature-devlog').length, 0);
});

test('devlog highlight defaults to false and accepts only YAML booleans', async t => {
  const { directory } = await fixture(t);
  const filename = path.join(directory, 'devlogs/2099-Flag.md');
  for (const [value, expected] of [[undefined, false], ['true', true], ['false', false]]) {
    await writeFile(filename, `---\ntitle: Flag\ntime: 2099\n${value === undefined ? '' : `highlight: ${value}\n`}---\nBody`);
    const state = await loadContent(directory);
    assert.equal(state.collections.devlog.find(doc => doc.slug === '2099-Flag').data.highlight, expected);
  }
  for (const value of ['"true"', '1', 'null', '[]']) {
    await writeFile(filename, `---\ntitle: Flag\ntime: 2099\nhighlight: ${value}\n---\nBody`);
    await assert.rejects(loadContent(directory), /2099-Flag.md: highlight must be true or false/);
  }
});

test('project featured priority validates integers and styles only Projects page cards', async t => {
  const { directory, save } = await fixture(t);
  const filename = path.join(directory, 'projects/2099-Featured.md');
  for (const [value, expected] of [[undefined, 0], ['0', 0], ['1', 1], ['10', 10], ['-1', -1]]) {
    await writeFile(filename, `---\ntitle: Featured test\ntime: 2099\ntags: [Puzzle]\n${value === undefined ? '' : `featured: ${value}\n`}---\nBody`);
    await save({ 'Technical Game Design': ['2099-Featured'] });
    const state = await loadContent(directory);
    const project = state.collections.project.find(doc => doc.slug === '2099-Featured');
    assert.equal(project.data.featured, expected);
    for (const [html, selector] of [[homePage(state), '#home-projects article'], [collectionPage(state, 'project'), '.entry-card']]) {
      const $ = load(html);
      const card = $(selector).filter((_, el) => $(el).find('h2 a').attr('href') === project.url);
      assert.equal(card.length, 1);
      const showFeatured = selector === '.entry-card' && expected > 0;
      assert.equal(card.hasClass('is-featured'), showFeatured);
      assert.equal(card.find('.project-featured-badge').length, showFeatured ? 1 : 0);
      assert.equal(card.find('.project-card-tags').text(), 'Puzzle');
    }
  }
  for (const value of ['true', 'false', '"1"', '1.5', '9007199254740992', 'null', '[]']) {
    await writeFile(filename, `---\ntitle: Featured test\ntime: 2099\nfeatured: ${value}\n---\nBody`);
    await assert.rejects(loadContent(directory), /2099-Featured.md: featured must be an integer/);
  }
});


test('one project hook updates both card layouts and the detail quote without changing filter tags', async t => {
  const {directory, save} = await fixture(t);
  const file = path.join(directory, 'projects/2099-Description.md');
  await save({'Technical Game Design': ['2099-Description']});
  for (const text of ['A **shared** description.', 'An updated description.']) {
    await writeFile(file, '---\ntitle: Description test\ntime: 2099\nhook: >-\n  ' + text + '\ntags: [Puzzle]\nskills: [Tools]\n---\nBody');
    const state = await loadContent(directory);
    const project = state.collections.project.find(doc => doc.slug === '2099-Description');
    assert.equal(project.data.hook, text);
    const home = load(homePage(state));
    const listing = load(collectionPage(state, 'project'));
    const card = listing('.entry-card').filter((_, el) => listing(el).find('h2 a').attr('href') === project.url);
    const detail = load(documentPage(state, project));
    assert.equal(home('.project-description').html().trim(), card.find('.project-description').html().trim());
    assert.equal(home('.project-description').text().trim(), detail('.project-hook').text().trim());
    assert.equal(home('.project-card-tags').text(), 'Puzzle');
    assert.equal(card.find('.project-card-tags').text(), 'Puzzle');
    assert.equal(card.find('.project-card-tags a').attr('href'), '/projects.html?tag=Puzzle');
    assert.deepEqual(JSON.parse(card.attr('data-project-tags')), ['Puzzle', 'Tools']);
  }
  await writeFile(file, '---\ntitle: Invalid\ntime: 2099\ndescription: [wrong]\n---\nBody');
  await assert.rejects(loadContent(directory), /2099-Description.md: description must be text/);
});
