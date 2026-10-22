import { escapeHtml as e } from '../html.js';

export function devlogSkills(doc) {
  const skills = doc.type === 'devlog' ? doc.data.skills || [] : [];
  return skills.length ? `<ul class="devlog-skills" aria-label="Skills">${skills.map(skill => `<li>${e(skill)}</li>`).join('')}</ul>` : '';
}
