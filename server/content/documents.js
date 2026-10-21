import yaml from 'js-yaml';
import { projectSkills } from '../config.js';
import { normalizeTags, normalizeSkills } from './taxonomy.js';

export function parseDocument(source, filename = '') {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Missing YAML front matter: ${filename}`);
  const data = yaml.load(match[1], { schema: yaml.JSON_SCHEMA }) || {};
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error(`Invalid front matter: ${filename}`);
  return { data, body: source.slice(match[0].length) };
}

export function validateDocument(data, type, filename) {
  if (!data.title || !data.time) throw new Error(`title and time are required: ${filename}`);
  if (type === 'devlog') {
    if (data.highlight === undefined) data.highlight = false;
    if (typeof data.highlight !== 'boolean') throw new Error(`${filename}: highlight must be true or false (without quotes)`);
  }
  if (type === 'project') {
    if (data.description !== undefined && typeof data.description !== 'string') throw new Error(`${filename}: description must be text`);
    if (data.featured === undefined) data.featured = 0;
    if (!Number.isSafeInteger(data.featured)) throw new Error(`${filename}: featured must be an integer (without quotes)`);
    data.tags = normalizeTags(data.tags, `${filename} tags`);
    data.skills = normalizeSkills(data.skills, `${filename} skills`);
    data.tech_stack = normalizeTags(data.tech_stack, `${filename} tech_stack`);
    for (const field of ['hook', 'development_date', 'team', 'roles', 'trailer']) {
      if (data[field] !== undefined && typeof data[field] !== 'string') throw new Error(`${filename}: ${field} must be text`);
    }
    if (data.trailer && !/^https:\/\/[^\s]+$/.test(data.trailer)) throw new Error(`${filename}: trailer must be an HTTPS embed URL`);
    if (data.links !== undefined && (!Array.isArray(data.links) || data.links.some(link =>
      !link || typeof link.label !== 'string' || !link.label.trim() || typeof link.url !== 'string' || !/^(https?:\/\/|\/[^/])\S+/.test(link.url)))) {
      throw new Error(`${filename}: links must be a YAML list of label and URL pairs`);
    }
    if (data.gallery !== undefined && (!Array.isArray(data.gallery) || data.gallery.some(image =>
      !image || typeof image.image_path !== 'string' || !image.image_path.trim() || typeof image.alt !== 'string'))) {
      throw new Error(`${filename}: gallery must be a YAML list of images with image_path and alt`);
    }
    if (data.sidebar !== undefined) throw new Error(`${filename}: use development_date, tech_stack, team, links, and roles instead of sidebar; put extra content in the Markdown body`);
    if (data.tags.some(tag => projectSkills.some(skill => skill.toLowerCase() === tag.toLowerCase()))) {
      throw new Error(`${filename}: move skill labels from tags into the skills list`);
    }
  }
}
