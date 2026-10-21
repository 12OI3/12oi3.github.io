import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const collectionNames = { project: 'projects', devlog: 'devlogs', article: 'articles' };
export const projectSkills = ['Technical Game Design', 'Tools', 'UI/UX'];
export const defaultProjectSkill = projectSkills[0];
// Root-level icon URLs retained for existing bookmarks and Markdown.
export const legacyIcons = ['favicon.ico', 'favicon.png', 'article.ico', 'article.png', 'devlog.ico', 'devlog.png'];
export const catImages = { project: '/ui/icons/project.png', devlog: '/devlog.png', article: '/article.png' };
