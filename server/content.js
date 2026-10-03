import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const collectionNames = { project: 'projects', devlog: 'devlogs', article: 'articles' };

export function normalizeTags(value, field = 'tags') {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(tag => typeof tag !== 'string' || !tag.trim().replace(/^#/, '').trim())) {
    throw new Error(`${field} must be a YAML list of non-empty tag names`);
  }
  const tags = new Map();
  for (const item of value) {
    const tag = item.trim().replace(/^#/, '').trim();
    if (!tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag);
  }
  return [...tags.values()];
}

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
  if (pages.projects) pages.projects.data.pinned_tags = normalizeTags(pages.projects.data.pinned_tags, 'projects.md pinned_tags');
  for (const [type, directory] of Object.entries(collectionNames)) {
    const documents = await Promise.all((await readdir(path.join(contentRoot, directory)))
      .filter(filename => filename.endsWith('.md'))
      .map(async filename => {
        const document = parseDocument(await readFile(path.join(contentRoot, directory, filename), 'utf8'), filename);
        if (!document.data.title || !document.data.time) throw new Error(`title and time are required: ${filename}`);
        if (type === 'project') document.data.tags = normalizeTags(document.data.tags, `${filename} tags`);
        const slug = filename.slice(0, -3);
        return { ...document, type, slug, url: `/${type}/${encodeURIComponent(slug)}/` };
      }));
    collections[type] = documents.filter(doc => doc.data.published !== false)
      .sort((a, b) => String(b.data.time).localeCompare(String(a.data.time)) || b.slug.localeCompare(a.slug));
  }
  // Devlogs own the relationship; projects derive their lists on every load/build.
  const projects = new Map(collections.project.map(project => {
    project.linkedDevlogs = [];
    return [project.slug, project];
  }));
  for (const devlog of collections.devlog) {
    const reference = devlog.data.project;
    if (reference === undefined || reference === null || reference === '') continue;
    if (typeof reference !== 'string' || !projects.has(reference)) {
      throw new Error(`${devlog.slug}.md: project must match a published project filename without .md (received ${JSON.stringify(reference)})`);
    }
    const project = projects.get(reference);
    devlog.linkedProject = { title: project.data.title, url: project.url };
    if (devlog.data.hidden !== true) project.linkedDevlogs.push(devlog);
  }
  return { site, pages, collections };
}
