import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { load } from 'cheerio';
import { loadContent, root } from '../server/content.js';
import { documentPage, homePage } from '../server/views.js';

test('multiple project links support highlights, backlinks, reassignment, and validation', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'rob-multi-project-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(path.join(root, 'content'), directory, { recursive: true });
  const first = '2025-07-Vocabutory';
  const second = '2099-01-Space # & Unicode 測試';
  await writeFile(path.join(directory, 'projects', `${second}.md`), '---\ntitle: "A & B"\ntime: 2099-01\n---\nBody.');
  await writeFile(path.join(directory, 'projects/2099-Draft.md'), '---\ntitle: Draft\ntime: 2099\npublished: false\n---\nBody.');
  const slug = '2099-01-01-Multi project';
  const save = (references, extra = '') => writeFile(path.join(directory, 'devlogs', `${slug}.md`),
    `---\ntitle: Shared update\ntime: 2099-01-01\nhighlight: true\nprojects: ${JSON.stringify(references)}\n${extra}\n---\nBody.`);
  const getProject = (state, ref) => state.collections.project.find(doc => doc.slug === ref);
  const sharedLinks = (state, ref) => getProject(state, ref).linkedDevlogs.filter(doc => doc.slug === slug);

  await save([first, second, first], `project: ${JSON.stringify(first)}`);
  let state = await loadContent(directory);
  let devlog = state.collections.devlog.find(doc => doc.slug === slug);
  const $ = load(documentPage(state, devlog));
  const urls = [first, second].map(ref => getProject(state, ref).url);
  assert.deepEqual($('.linked-project a').map((_, el) => $(el).attr('href')).get(), urls);
  assert.match($('.linked-project').text(), /^Projects:/);
  assert.equal($('.linked-project a').last().text(), 'A & B');
  for (const ref of [first, second]) {
    assert.equal(sharedLinks(state, ref).length, 1);
    const page = load(documentPage(state, getProject(state, ref)));
    assert.equal(page('.project-headline-devlog a').attr('href'), devlog.url);
    assert.equal(page(`.linked-devlogs a[href="${devlog.url}"]`).length, 1);
  }
  state.homeProjectGroups = [{ tag: 'Technical Game Design', projects: [getProject(state, first), getProject(state, second)] }];
  const home = load(homePage(state));
  assert.equal(home(`.feature-devlog a[href="${devlog.url}"]`).length, 2);

  await save([second]);
  state = await loadContent(directory);
  assert.equal(sharedLinks(state, first).length, 0);
  assert.equal(sharedLinks(state, second).length, 1);
  devlog = state.collections.devlog.find(doc => doc.slug === slug);
  assert.match(load(documentPage(state, devlog))('.linked-project').text(), /^Project:/);

  for (const extra of ['hidden: true', 'published: false']) {
    await save([first, second], extra);
    state = await loadContent(directory);
    for (const ref of [first, second]) assert.equal(sharedLinks(state, ref).length, 0);
    if (extra === 'hidden: true') {
      devlog = state.collections.devlog.find(doc => doc.slug === slug);
      assert.equal(load(documentPage(state, devlog))('.linked-project a').length, 2);
    }
  }
  await save([]);
  state = await loadContent(directory);
  for (const ref of [first, second]) assert.equal(sharedLinks(state, ref).length, 0);
  devlog = state.collections.devlog.find(doc => doc.slug === slug);
  assert.equal(load(documentPage(state, devlog))('.linked-project').length, 0);
  for (const invalid of [first, null, 123, {}, [123], [''], [' '], ['missing-project'], ['2099-Draft']]) {
    await save(invalid);
    await assert.rejects(loadContent(directory), /2099-01-01-Multi project.md: projects must/);
  }
});

test('project headline features only the newest eligible highlighted linked devlog', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'rob-devlog-headline-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(path.join(root, 'content'), directory, { recursive: true });
  const projectSlug = '2025-07-Vocabutory';
  const posts = [
    ['2099-01-01-Older', 'highlight: true', projectSlug],
    ['2099-01-02-Featured', 'highlight: true', projectSlug],
    ['2099-01-03-Normal', 'highlight: false', projectSlug],
    ['2099-01-04-Hidden', 'highlight: true\nhidden: true', projectSlug],
    ['2099-01-05-Draft', 'highlight: true\npublished: false', projectSlug],
    ['2099-01-06-Other', 'highlight: true', '2024-02-Project Fusion'],
  ];
  for (const [slug, flags, project] of posts) {
    await writeFile(path.join(directory, 'devlogs', `${slug}.md`), `---\ntitle: 'Design & <Iteration>'\ntime: ${slug.slice(0, 10)}\nproject: ${project}\nexcerpt: 'A **closer look** at the design.'\n${flags}\n---\nBody.`);
  }
  const state = await loadContent(directory);
  const project = state.collections.project.find(doc => doc.slug === projectSlug);
  const featured = state.collections.devlog.find(doc => doc.slug === '2099-01-02-Featured');
  const $ = load(documentPage(state, project));
  assert.equal($('.project-headline-devlog').length, 1);
  assert.equal($('.project-headline-devlog').next().hasClass('document-layout'), true, 'Card sits above both project columns');
  assert.equal($('.project-headline-devlog a').attr('href'), featured.url);
  assert.equal($('.project-headline-devlog h2').text(), 'Design & <Iteration>');
  assert.equal($('.headline-devlog-excerpt').text(), 'A closer look at the design.');
  assert.equal($('.linked-devlogs a').length, project.linkedDevlogs.length);
  assert.equal(load(documentPage(state, featured))('.project-headline-devlog').length, 0);
  for (const devlog of project.linkedDevlogs) devlog.data.highlight = false;
  assert.equal(load(documentPage(state, project))('.project-headline-devlog').length, 0);
  project.linkedDevlogs = [];
  assert.equal(load(documentPage(state, project))('.project-headline-devlog').length, 0);
});

test('existing devlog relationships generate one list per project and backlinks', async () => {
  const state = await loadContent();
  for (const project of state.collections.project) {
    const expected = state.collections.devlog.filter(devlog => devlog.data.hidden !== true &&
      (devlog.data.project === project.slug || devlog.data.projects?.includes(project.slug)));
    const count = expected.length;
    assert.equal(project.linkedDevlogs.length, count);
    assert.deepEqual(project.linkedDevlogs.map(doc => doc.slug), expected.map(doc => doc.slug));
    const $ = load(documentPage(state, project));
    if (!count) {
      assert.equal($('.linked-devlogs').length, 0);
      continue;
    }
    assert.equal($('.linked-devlogs').length, 1);
    assert.equal($('.project-sidebar > section:last-child').hasClass('linked-devlogs'), true);
    assert.equal($('.document .linked-devlogs').length, 0);
    assert.equal($('.linked-devlogs a').length, count);
    const dates = project.linkedDevlogs.map(doc => doc.data.time);
    assert.deepEqual(dates, [...dates].sort().reverse());
    for (const devlog of project.linkedDevlogs) {
      const page = load(documentPage(state, devlog));
      const backlink = page('.linked-project a').filter((_, el) => page(el).attr('href') === project.url);
      assert.equal(backlink.length, 1);
      assert.equal(backlink.text(), project.data.title);
    }
  }
  for (const general of state.collections.devlog.filter(doc => !doc.linkedProjects.length)) {
    assert.equal(load(documentPage(state, general))('.linked-project').length, 0);
  }
});

test('new, reassigned, unlinked, hidden, and draft devlogs update project lists; invalid references fail clearly', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'rob-devlog-links-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(path.join(root, 'content'), directory, { recursive: true });
  const slug = '2099-01-01-Link test';
  const filename = path.join(directory, 'devlogs', `${slug}.md`);
  const first = '2025-07-Vocabutory';
  const second = '2099-01-Space # & Unicode 測試';
  await writeFile(path.join(directory, 'projects', `${second}.md`), '---\ntitle: "A & B"\ntime: 2099-01\n---\nProject body.');
  const save = (project, extra = '') => writeFile(filename, `---\ntitle: New devlog\ntime: 2099-01-01\n${project === undefined ? '' : `project: ${JSON.stringify(project)}\n`}${extra}\n---\nUnchanged body.`);
  const linked = (state, project) => state.collections.project.find(doc => doc.slug === project).linkedDevlogs.some(doc => doc.slug === slug);
  await save(first);
  let state = await loadContent(directory);
  assert.equal(linked(state, first), true);
  assert.equal(state.collections.project.find(doc => doc.slug === first).linkedDevlogs[0].slug, slug);
  await save(second);
  state = await loadContent(directory);
  assert.equal(linked(state, first), false);
  assert.equal(linked(state, second), true);
  assert.equal(load(documentPage(state, state.collections.project.find(doc => doc.slug === second)))('.project-sidebar .linked-devlogs').length, 1, 'Projects without sidebar metadata still display linked devlogs in a sidebar');
  const devlog = state.collections.devlog.find(doc => doc.slug === slug);
  assert.equal(load(documentPage(state, devlog))('.linked-project a').attr('href'), `/project/${encodeURIComponent(second)}/`);
  for (const extra of ['hidden: true', 'published: false']) {
    await save(second, extra);
    assert.equal(linked(await loadContent(directory), second), false);
  }
  await save(undefined);
  state = await loadContent(directory);
  assert.equal(linked(state, second), false);
  assert.equal(load(documentPage(state, state.collections.project.find(doc => doc.slug === second)))('.linked-devlogs').length, 0);
  for (const invalid of ['Missing project', ['two', 'projects'], 123]) {
    await save(invalid);
    await assert.rejects(loadContent(directory), /2099-01-01-Link test.md: project must match a published project filename/);
  }
});
