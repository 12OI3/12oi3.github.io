import { cp, lstat, mkdir, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { collectionNames, loadContent, root } from '../server/content.js';
import { homePage, collectionPage, documentPage, standalonePage } from '../server/views.js';

export const outputRoot = path.join(root, 'dist');

export function staticPages(state) {
  const pages = new Map([['index.html', homePage(state)]]);
  for (const [type, name] of Object.entries(collectionNames)) {
    const html = collectionPage(state, type);
    pages.set(`${name}.html`, html);
    pages.set(`${name}/index.html`, html);
    for (const doc of state.collections[type]) {
      // Filesystem names stay decoded; browsers request their encoded URLs.
      pages.set(`${type}/${doc.slug}/index.html`, documentPage(state, doc));
    }
  }
  for (const name of Object.keys(state.pages)) {
    if (['home', ...Object.values(collectionNames)].includes(name)) continue;
    const html = standalonePage(state, name);
    pages.set(`${name}.html`, html);
    if (name !== '404') pages.set(`${name}/index.html`, html);
  }
  return pages;
}

export async function buildSite() {
  const pages = staticPages(await loadContent());
  // Only clear the dedicated output folder inside this checkout, never a link.
  const existing = await lstat(outputRoot).catch(error => {
    if (error.code !== 'ENOENT') throw error;
    return null;
  });
  if (existing && (existing.isSymbolicLink() ||
      await realpath(outputRoot) !== path.join(await realpath(root), 'dist'))) {
    throw new Error('Refusing to clear a dist directory outside this checkout.');
  }
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  for (const [filename, html] of pages) {
    const destination = path.join(outputRoot, filename);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, html);
  }
  await cp(path.join(root, 'assets'), path.join(outputRoot, 'assets'), { recursive: true });
  await cp(path.join(root, 'public'), path.join(outputRoot, 'ui'), { recursive: true });
  for (const filename of ['favicon.ico', 'favicon.png', 'article.ico', 'article.png', 'devlog.ico', 'devlog.png']) {
    await cp(path.join(root, 'public', 'icons', filename), path.join(outputRoot, filename));
  }
  await writeFile(path.join(outputRoot, '.nojekyll'), '');
  return pages;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const pages = await buildSite();
  console.log(`Built ${pages.size} HTML files in dist/ for GitHub Pages.`);
}
