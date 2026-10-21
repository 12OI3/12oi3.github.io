import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import yaml from 'js-yaml';
import { root, collectionNames } from './config.js';
import { normalizeTags } from './content/taxonomy.js';
import { parseDocument, validateDocument } from './content/documents.js';
import { linkDevlogs } from './content/relationships.js';
import { resolveHomeProjects } from './content/showcase.js';

// Stable entry points for scripts, tests, and the development server.
export { root, collectionNames, projectSkills } from './config.js';
export { normalizeTags, normalizeSkills, projectFilterTags } from './content/taxonomy.js';
export { parseDocument } from './content/documents.js';

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
        validateDocument(document.data, type, filename);
        const slug = filename.slice(0, -3);
        return { ...document, type, slug, url: `/${type}/${encodeURIComponent(slug)}/` };
      }));
    collections[type] = documents.filter(doc => doc.data.published !== false)
      .sort((a, b) => String(b.data.time).localeCompare(String(a.data.time)) || b.slug.localeCompare(a.slug));
  }
  const projects = linkDevlogs(collections);
  const homeProjectGroups = resolveHomeProjects(pages, projects);
  return { site, pages, collections, homeProjectGroups };
}
