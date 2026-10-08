import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const collectionNames = { project: 'projects', devlog: 'devlogs', article: 'articles' };
export const projectSkills = ['Technical Game Design', 'Tools', 'UI/UX'];

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

export function normalizeSkills(value, field = 'skills') {
  return normalizeTags(value, field).map(value => {
    const skill = projectSkills.find(skill => skill.toLowerCase() === value.toLowerCase());
    if (!skill) throw new Error(`${field} must use only ${projectSkills.join(', ')} (received ${value})`);
    return skill;
  });
}

export function projectFilterTags(data) {
  return normalizeTags([...(data.tags || []), ...(data.skills || [])])
    .filter(tag => tag.toLowerCase() !== 'featured')
    .concat(data.featured === true ? ['Featured'] : []);
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
        if (type === 'devlog') {
          if (document.data.highlight === undefined) document.data.highlight = false;
          if (typeof document.data.highlight !== 'boolean') throw new Error(`${filename}: highlight must be true or false (without quotes)`);
        }
        if (type === 'project') {
          if (document.data.featured === undefined) document.data.featured = false;
          if (typeof document.data.featured !== 'boolean') throw new Error(`${filename}: featured must be true or false (without quotes)`);
          document.data.tags = normalizeTags(document.data.tags, `${filename} tags`);
          document.data.skills = normalizeSkills(document.data.skills, `${filename} skills`);
          if (document.data.tags.some(tag => projectSkills.some(skill => skill.toLowerCase() === tag.toLowerCase()))) {
            throw new Error(`${filename}: move skill labels from tags into the skills list`);
          }
        }
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
    const hasLegacyProject = reference !== undefined && reference !== null && reference !== '';
    if (hasLegacyProject && (typeof reference !== 'string' || !projects.has(reference))) {
      throw new Error(`${devlog.slug}.md: project must match a published project filename without .md (received ${JSON.stringify(reference)})${Array.isArray(reference) ? '. For multiple projects, rename project: to projects:' : ''}`);
    }
    const references = devlog.data.projects === undefined ? [] : devlog.data.projects;
    if (!Array.isArray(references) || references.some(ref => typeof ref !== 'string' || !ref.trim())) {
      throw new Error(`${devlog.slug}.md: projects must be a YAML list of project filenames without .md`);
    }
    devlog.linkedProjects = [];
    for (const ref of new Set([...(hasLegacyProject ? [reference] : []), ...references])) {
      const project = projects.get(ref);
      if (!project) throw new Error(`${devlog.slug}.md: projects must match published project filenames without .md (received ${JSON.stringify(ref)})`);
      devlog.linkedProjects.push({ title: project.data.title, url: project.url });
      if (devlog.data.hidden !== true) project.linkedDevlogs.push(devlog);
    }
  }
  const groups = pages.home?.data.project_groups || {};
  if (typeof groups !== 'object' || Array.isArray(groups)) throw new Error('home.md: project_groups must map tag names to project lists');
  const resolveProjects = (references, field) => {
    if (!Array.isArray(references) || references.some(ref => typeof ref !== 'string' || !ref.trim()) || new Set(references).size !== references.length) {
      throw new Error(`home.md: ${field} must contain unique project filenames without .md`);
    }
    return references.map(reference => {
      const project = projects.get(reference);
      if (!project || project.data.hidden === true) throw new Error(`home.md: ${field} references unavailable project ${reference}`);
      return project;
    });
  };
  const homeProjectGroups = Object.entries(groups).map(([tag, references]) => {
    if (!tag.trim()) throw new Error('home.md: project_groups tag names must not be empty');
    return { tag, projects: resolveProjects(references, `project_groups ${tag}`) };
  });
  return { site, pages, collections, homeProjectGroups };
}
