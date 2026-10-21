import { projectSkills } from '../config.js';

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
  return normalizeTags([...(data.tags || []), ...(data.skills || []), ...(data.tech_stack || [])])
    .filter(tag => tag.toLowerCase() !== 'featured')
    .concat(data.featured > 0 ? ['Featured'] : []);
}
