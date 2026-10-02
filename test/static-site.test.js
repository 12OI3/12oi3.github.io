import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { load } from 'cheerio';
import { buildSite, outputRoot, staticPages } from '../scripts/build-site.js';
import { loadContent } from '../server/content.js';

test('GitHub Pages output serves every page and local asset without the Markdown server', async t => {
  // Deleted/unpublished content must not survive a subsequent build.
  await mkdir(outputRoot, { recursive: true });
  await writeFile(path.join(outputRoot, 'stale-page.html'), 'Old page');
  const pages = await buildSite();
  await assert.rejects(access(path.join(outputRoot, 'stale-page.html')));
  await access(path.join(outputRoot, '.nojekyll'));
  const app = express();
  app.use(express.static(outputRoot));
  app.use((req, res) => res.status(404).sendFile(path.join(outputRoot, '404.html')));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  const urls = new Set(['/']);
  for (const [filename, expected] of pages) {
    const url = '/' + filename.split('/').map(encodeURIComponent).join('/');
    assert.equal(await (await fetch(base + url)).text(), expected, filename);
    const $ = load(expected);
    for (const element of $('a[href], img[src], script[src], link[href], iframe[src]').toArray()) {
      const ref = $(element).attr('src') || $(element).attr('href');
      if (ref.startsWith('/') && !ref.startsWith('//')) urls.add(ref);
    }
  }
  for (const url of urls) assert.equal((await fetch(base + url)).status, 200, url);
  for (const url of ['/README.md', '/content/site.yml', '/server/index.js', '/package.json', '/.git/config', '/missing']) {
    const response = await fetch(base + url);
    assert.equal(response.status, 404, url);
    assert.equal(await response.text(), pages.get('404.html'));
  }
  const state = await loadContent();
  for (const type of ['devlog', 'article']) {
    const $ = load(pages.get(`${type === 'devlog' ? 'devlogs' : 'articles'}.html`));
    assert.equal($('.journal-entry').length, state.collections[type].filter(doc => !doc.data.hidden).length);
    assert.equal($('.journal-preview').length, 0);
  }
  assert.equal(await readFile(path.join(outputRoot, 'ui/site.js'), 'utf8'), await readFile(new URL('../public/site.js', import.meta.url), 'utf8'));
});

test('new standalone Markdown pages receive both existing URL forms', async () => {
  const state = await loadContent();
  state.pages.about = { data: { title: 'About' }, body: 'A new page.' };
  const pages = staticPages(state);
  assert.match(pages.get('about.html'), /A new page\./);
  assert.equal(pages.get('about/index.html'), pages.get('about.html'));
});
