import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { load } from 'cheerio';
import { createApp } from '../server/app.js';
import { loadContent, root, parseDocument } from '../server/content.js';
import { renderMarkdown, localUrl } from '../server/markdown.js';

async function serve(t, options) {
  const server = createApp(options).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  return `http://127.0.0.1:${server.address().port}`;
}

test('every collection page renders its complete Markdown body and galleries', async t => {
  const base = await serve(t);
  const state = await loadContent();
  for (const type of ['project', 'devlog', 'article']) assert.ok(state.collections[type].length > 0);
  for (const doc of Object.values(state.collections).flat()) {
    const response = await fetch(base + doc.url);
    assert.equal(response.status, 200, doc.url);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const $ = load(await response.text());
    assert.equal($('.document-heading h1').text(), doc.data.title);
    assert.ok($('.prose').text().trim().length > 0, doc.slug);
    assert.doesNotMatch($('.prose').text(), /\{%|\{\{|:::gallery|\{\./);
    const expectedGalleryCount = [...doc.body.matchAll(/^:::gallery /gm)].length;
    assert.equal($('.gallery').length, expectedGalleryCount, doc.slug);
    const expectedVideos = [...doc.body.matchAll(/<iframe /g)].length;
    assert.equal($('.prose iframe').length, expectedVideos, doc.slug);
    for (const match of doc.body.matchAll(/<iframe[^>]+src="([^"]+)"/g)) {
      assert.ok($('.prose iframe').toArray().some(el => $(el).attr('src') === match[1]), `Missing video in ${doc.slug}`);
    }
  }
});

test('home, listings, navigation, assets, and error routes work', async t => {
  const base = await serve(t);
  for (const route of ['/', '/index.html', '/projects.html', '/articles.html', '/devlogs.html', '/favicon.png', '/assets/Huang_KuanYen_Resume.pdf', '/ui/site.css', '/ui/site.js']) {
    assert.equal((await fetch(base + route)).status, 200, route);
  }
  for (const route of ['/missing-page', '/content/site.yml', '/server/index.js', '/.git/config']) assert.equal((await fetch(base + route)).status, 404, route);
  const html = await (await fetch(base)).text();
  const $ = load(html);
  assert.equal($('.feature-project .feature-item').length, 3);
  assert.equal($('.feature-copy a[href^="/project/"]').length, 3);
  assert.equal($('a[href="mailto:benbook90@gmail.com"]').length, 2);
  assert.doesNotMatch($('main').text(), /:::feature|\{\./);
  const list = load(await (await fetch(base + '/projects.html')).text());
  const state = await loadContent();
  assert.equal(list('.entry-card').length, state.collections.project.filter(doc => doc.data.hidden !== true).length);
  const response = await fetch(base + '/%E0%A4%A');
  assert.equal(response.status, 400);
});

test('new and edited Markdown is visible immediately; drafts stay private', async t => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'rob-site-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await cp(path.join(root, 'content'), directory, { recursive: true });
  const base = await serve(t, { contentRoot: directory });
  const filename = path.join(directory, 'projects', '2099-01-Test.md');
  const markdown = published => `---\ntitle: Live test\ntime: 2099-01\npublished: ${published}\n---\nOriginal body.\n`;
  assert.equal((await fetch(base + '/project/2099-01-Test/')).status, 404);
  await writeFile(filename, markdown(true));
  assert.match(await (await fetch(base + '/project/2099-01-Test/')).text(), /Original body\./);
  await writeFile(filename, markdown(true).replace('Original body.', 'Edited body.'));
  assert.match(await (await fetch(base + '/project/2099-01-Test/')).text(), /Edited body\./);
  const listing = load(await (await fetch(base + '/projects.html')).text());
  assert.equal(listing('.entry-card h2').first().text(), 'Live test');
  await writeFile(filename, markdown(false));
  assert.equal((await fetch(base + '/project/2099-01-Test/')).status, 404);
  assert.doesNotMatch(await (await fetch(base + '/projects.html')).text(), /Live test/);
  await writeFile(path.join(directory, 'pages', 'about.md'), '---\ntitle: About\n---\nA new standalone page.');
  assert.match(await (await fetch(base + '/about.html')).text(), /A new standalone page\./);
});

test('special filenames, spaced image paths, attributes, and YAML strings survive', () => {
  assert.equal(localUrl('/article/2026-03-04-Öoo-GameLog#6/'), '/article/2026-03-04-%C3%96oo-GameLog%236/');
  assert.equal(localUrl('/assets/images/projects/One Day More/1.jpg'), '/assets/images/projects/One%20Day%20More/1.jpg');
  assert.equal(parseDocument('---\ntime: 2026-01-02\n---\nBody').data.time, '2026-01-02');
  const $ = load(renderMarkdown('[Read](/project/One Day More/)\n\n![](/assets/images/projects/One Day More/1.jpg)\n{.text-center}\n\n[Resume](/resume.pdf){.btn}'));
  assert.equal($('a').first().attr('href'), '/project/One%20Day%20More/');
  assert.equal($('p.text-center img').length, 1);
  assert.equal($('a.btn').length, 1);
  assert.throws(() => renderMarkdown(':::gallery missing\n:::', {}), /Unknown gallery/);
});
