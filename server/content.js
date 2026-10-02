import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const collectionNames = { project: 'projects', devlog: 'devlogs', article: 'articles' };

export function parseDocument(source, filename = '') {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Missing YAML front matter: ${filename}`);
  const data = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`Invalid front matter: ${filename}`);
  return { data, body: source.slice(match[0].length) };
}

// Shared by the live development server and the GitHub Pages build.
export async function loadContent(contentRoot = path.join(root, 'content')) {
  const site = yaml.load(await readFile(path.join(contentRoot, 'site.yml'), 'utf8'), { schema: yaml.JSON_SCHEMA });
  const pages = {};
  for (const filename of await readdir(path.join(contentRoot, 'pages'))) {
    if (!filename.endsWith('.md')) continue;
    pages[filename.slice(0, -3)] = parseDocument(await readFile(path.join(contentRoot, 'pages', filename), 'utf8'), filename);
  }
  const collections = {};
  for (const [type, directory] of Object.entries(collectionNames)) {
    const documents = await Promise.all((await readdir(path.join(contentRoot, directory)))
      .filter(filename => filename.endsWith('.md'))
      .map(async filename => {
        const document = parseDocument(await readFile(path.join(contentRoot, directory, filename), 'utf8'), filename);
        if (!document.data.title || !document.data.time) throw new Error(`title and time are required: ${filename}`);
        const slug = filename.slice(0, -3);
        return { ...document, type, slug, url: `/${type}/${encodeURIComponent(slug)}/` };
      }));
    collections[type] = documents.filter(doc => doc.data.published !== false)
      .sort((a, b) => String(b.data.time).localeCompare(String(a.data.time)) || b.slug.localeCompare(a.slug));
  }
  return { site, pages, collections };
}
