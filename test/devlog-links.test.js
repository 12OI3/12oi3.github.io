import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { load } from 'cheerio';
import { loadContent, root } from '../server/content.js';
import { documentPage } from '../server/views.js';

test('existing devlog relationships generate one list per project and backlinks', async () => {
  const state = await loadContent();
  assert.equal(state.collections.devlog.filter(doc => doc.linkedProject).length, 7);
  for (const [slug, count] of [['2024-02-Project Fusion', 2], ['2025-06-CreSpiritTalker', 2], ['2025-07-Vocabutory', 3]]) {
    const project = state.collections.project.find(doc => doc.slug === slug);
    assert.equal(project.linkedDevlogs.length, count);
    const $ = load(documentPage(state, project));
    assert.equal($('.linked-devlogs').length, 1);
    assert.equal($('.project-sidebar > section:last-child').hasClass('linked-devlogs'), true);
    assert.equal($('.document .linked-devlogs').length, 0);
    assert.equal($('.linked-devlogs a').length, count);
    assert.equal($('.prose a[href^="/devlog/"]').length, 0, 'Handwritten list was removed');
    const dates = project.linkedDevlogs.map(doc => doc.data.time);
    assert.deepEqual(dates, [...dates].sort().reverse());
    for (const devlog of project.linkedDevlogs) {
      const page = load(documentPage(state, devlog));
      assert.equal(page('.linked-project a').attr('href'), project.url);
      assert.equal(page('.linked-project a').text(), project.data.title);
    }
  }
  const general = state.collections.devlog.find(doc => doc.slug.includes('GDC'));
  assert.equal(load(documentPage(state, general))('.linked-project').length, 0);
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
