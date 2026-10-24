import { renderMarkdown, plainText } from '../markdown.js';
import { defaultProjectSkill } from '../config.js';
import { highlightedDevlog } from '../content/relationships.js';
import { layout } from './layout.js';

export function homePage(state) {
  const page = state.pages.home;
  const groups = state.homeProjectGroups;
  const selectedGroup = (groups.find(group => group.tag === defaultProjectSkill) || groups[0])?.tag;
  const card = (doc, group) => {
    const devlog = highlightedDevlog(doc);
    return { title: doc.data.title, url: doc.url, image_path: doc.data.teaser, tags: doc.data.tags, hook: doc.data.hook, group,
      latestDevlog: devlog ? { title: devlog.data.title, excerpt: plainText(devlog.data.excerpt || '').trim(), url: devlog.url } : null };
  };
  const projects = groups.flatMap(group => group.projects.map(doc => card(doc, group.tag)));
  const intro = page.data.intro.map(item => ({ ...item, specialties: groups.map(group => group.tag) }));
  return layout(`<div class="home-content">${renderMarkdown(page.body, { ...page.data, intro, projects, selectedGroup })}</div>`, {
    site: state.site, bodyClass: 'home', description: plainText([page.data.intro?.[0]?.role, page.data.intro?.[0]?.excerpt].filter(Boolean).join(' ')),
  });
}
