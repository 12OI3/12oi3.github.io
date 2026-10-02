import { access } from 'node:fs/promises';
import { load } from 'cheerio';
import path from 'node:path';
import { loadContent, root } from '../server/content.js';
import { homePage, collectionPage, documentPage, standalonePage } from '../server/views.js';

// Validate rendered pages and their local references.
const state = await loadContent();
const documents = Object.values(state.collections).flat();
const collectionPages = ['projects', 'devlogs', 'articles'];
const standalonePages = Object.keys(state.pages).filter(name => !['home', ...collectionPages].includes(name));
const normalize = pathname => pathname.replace(/\/$/, '') || '/';
const knownPages = new Set([
  '/', '/index.html',
  ...collectionPages.flatMap(name => [`/${name}`, `/${name}.html`]),
  ...standalonePages.flatMap(name => [`/${name}`, `/${name}.html`]),
  ...documents.map(doc => normalize(decodeURIComponent(doc.url))),
]);
const icons = new Set(['favicon.ico', 'favicon.png', 'article.ico', 'article.png', 'devlog.ico', 'devlog.png']);
const pages = [
  { name: 'content/pages/home.md', html: homePage(state) },
  ...Object.keys(state.collections).map(type => ({ name: `${type} listing`, html: collectionPage(state, type) })),
  ...documents.map(doc => ({ name: `${doc.type}/${doc.slug}`, html: documentPage(state, doc) })),
  ...standalonePages.map(name => ({ name: `content/pages/${name}.md`, html: standalonePage(state, name) })),
];
const issues = [];
const checkedFiles = new Map();
for (const page of pages) {
  const $ = load(page.html);
  if ($('main').text().match(/\{%|\{\{|:::gallery|:::feature|\{\./)) issues.push(`${page.name}: unrendered template markup`);
  for (const element of $('img[src], iframe[src], script[src], a[href], link[href]').toArray()) {
    const url = $(element).attr('src') || $(element).attr('href');
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    let pathname;
    try { pathname = decodeURIComponent(new URL(url, 'https://content-check.invalid').pathname); }
    catch { issues.push(`${page.name}: malformed URL ${url}`); continue; }

    let file;
    if (pathname.startsWith('/assets/')) file = path.join(root, 'assets', pathname.slice(8));
    else if (pathname.startsWith('/ui/')) file = path.join(root, 'public', pathname.slice(4));
    else if (icons.has(pathname.slice(1))) file = path.join(root, 'public', 'icons', pathname.slice(1));
    if (file) {
      if (!checkedFiles.has(file)) {
        try { await access(file); checkedFiles.set(file, true); }
        catch { checkedFiles.set(file, false); }
      }
      if (!checkedFiles.get(file)) issues.push(`${page.name}: missing asset ${pathname}`);
    } else if (!knownPages.has(normalize(pathname))) {
      issues.push(`${page.name}: unknown local page ${pathname}`);
    }
  }
}
console.log(`Checked ${pages.length} rendered pages, including ${documents.length} collection documents.`);
if (issues.length) {
  console.error([...new Set(issues)].join('\n'));
  process.exitCode = 1;
} else {
  console.log('All rendered local links, media, icons, and browser assets resolve. No leftover template markup.');
}
