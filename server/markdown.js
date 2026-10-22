import MarkdownIt from 'markdown-it';
import attrs from 'markdown-it-attrs';
import { escapeHtml, localUrl } from './html.js';
import { gallery, feature } from './components/features.js';

export { escapeHtml, localUrl } from './html.js';
export { backToTopCat } from './components/cat.js';

const md = new MarkdownIt({ html: true, linkify: true, typographer: false }).use(attrs);
const defaultImage = md.renderer.rules.image;
md.renderer.rules.image = (tokens, index, options, env, self) => {
  tokens[index].attrSet('loading', 'lazy');
  tokens[index].attrSet('decoding', 'async');
  return defaultImage(tokens, index, options, env, self);
};
md.renderer.rules.heading_open = (tokens, index, options, env, self) => {
  const text = tokens[index + 1]?.content || '';
  const base = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
  env.headings ??= new Map();
  const count = (env.headings.get(base) || 0) + 1;
  env.headings.set(base, count);
  const id = count === 1 ? base : `${base}-${count}`;
  tokens[index].attrSet('id', id);
  if (env.sectionHeadings && Number(tokens[index].tag.slice(1)) <= 3) {
    const label = (tokens[index + 1]?.children || []).map(token =>
      ['text', 'code_inline', 'image'].includes(token.type) ? token.content :
        ['softbreak', 'hardbreak'].includes(token.type) ? ' ' : '').join('');
    env.sectionHeadings.push({ id, level: Number(tokens[index].tag.slice(1)), label });
  }
  return self.renderToken(tokens, index, options);
};

export function renderMarkdown(source, data = {}, env = {}) {
  let text = source.replace(/\]\((\/[^\n]*?)\)/g, (_, url) => `](${localUrl(url)})`);
  text = text.replace(/<(h[1-6])>([^\n]+)<\/\1>\r?\n\{\.([^}]+)\}/g,
    (_, tag, heading, classes) => `<${tag} class="${escapeHtml(classes.replace(/\s+\./g, ' '))}">${heading}</${tag}>`);
  text = text.replace(/^(\{[^}\n]+\})[ \t]*$/gm, '$1\n');
  // Expand explicit content components before Markdown. HTML blocks stay intact.
  text = text.replace(/^:::gallery\s+(\S+)(?:[ \t]+(\S+))?[ \t]*\r?\n:::[ \t]*$/gm,
    (_, name, layout) => `\n${gallery(data, name, layout)}\n`);
  text = text.replace(/^:::feature\s+(\S+)[ \t]+(\S+)[ \t]*\r?\n:::[ \t]*$/gm,
    (_, name, type) => `\n${feature(data, name, type, renderMarkdown).replace(/\n\s*/g, '')}\n`);
  return md.render(text, env);
}

export function plainText(source) {
  return renderMarkdown(source).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Split on actual Markdown headings, so headings inside code blocks stay intact.
export function renderRoleGrid(source) {
  const tokens = md.parse(source, {});
  const roles = [];
  let current = { title: null, tokens: [] };
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type === 'heading_open' && tokens[i].tag === 'h3') {
      if (current.title || current.tokens.length) roles.push(current);
      current = { title: md.renderer.renderInline(tokens[i + 1].children, md.options, {}), tokens: [] };
      i += 2;
    } else current.tokens.push(tokens[i]);
  }
  if (current.title || current.tokens.length) roles.push(current);
  return `<div class="project-role-grid" tabindex="0" role="region" aria-label="Project roles, scroll horizontally">${roles.map(role => {
    const body = md.renderer.render(role.tokens, md.options, {});
    if (!role.title) return `<div class="project-role-card project-role-plain">${body}</div>`;
    if (!body.trim()) return `<div class="project-role-card project-role-plain">${role.title}</div>`;
    return `<section class="project-role-card"><h3 class="project-role-title">${role.title}</h3><div class="project-role-contributions">${body}</div></section>`;
  }).join('\n')}</div>`;
}
