import test from 'node:test';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { loadContent, projectFilterTags } from '../server/content.js';
import { validateDocument } from '../server/content/documents.js';
import { documentPage, collectionPage } from '../server/views.js';
import { renderRoleGrid, renderMarkdown } from '../server/markdown.js';

test('role grid preserves every project contribution with always-visible content', async () => {
  const state = await loadContent();
  const text = html => load(html).text().replace(/\s+/g, ' ').trim();
  for (const doc of state.collections.project) {
    const grid = renderRoleGrid(doc.data.roles);
    assert.equal(text(grid), text(renderMarkdown(doc.data.roles)), doc.slug);
    const $ = load(grid);
    assert.equal($('details, summary').length, 0);
    for (const card of $('section.project-role-card').toArray()) {
      assert.ok($(card).children('h3').text().trim());
      assert.ok($(card).children('.project-role-contributions').text().trim());
    }
  }
  const plain = load(renderRoleGrid('Solo Development'));
  assert.equal(plain('details').length, 0);
  assert.equal(plain('.project-role-card').text(), 'Solo Development\n');
});

test('all current projects follow the fixed structure and keep extras after roles', async () => {
  const state = await loadContent();
  for (const doc of state.collections.project) {
    const $ = load(documentPage(state, doc));
    assert.equal($('.document-heading h1').text(), doc.data.title);
    assert.deepEqual($('.project-sidebar h2').map((_, el) => $(el).text()).get(), [...(doc.data.tags.length ? ['Tags'] : []), ...(doc.data.skills.length ? ['Skills'] : []), 'Development date', 'Tech Stack', 'Team', 'Links'], doc.slug);
    assert.deepEqual($('.skill-tags a').map((_, el) => $(el).text()).get(), doc.data.skills, doc.slug);
    assert.deepEqual($('.project-sidebar .project-tags a').map((_, el) => $(el).text()).get(), doc.data.tags, doc.slug);
    assert.equal($('.document-heading .project-tags').length, 0, doc.slug);
    const actual = $('.project-body').children().map((_, el) => $(el).attr('class')).get();
    const expected = [doc.data.hook && 'project-hook', 'project-roles', doc.body.trim() && 'project-extra'].filter(Boolean);
    assert.deepEqual(actual, expected, doc.slug);
    assert.equal($('.project-hook').text().trim(), doc.data.hook.trim(), doc.slug);
    assert.equal(doc.data.description, undefined, doc.slug);
    if (doc.data.trailer) {
      const expectedVideo = new URL(doc.data.trailer);
      for (const key of ['autoplay', 'mute', 'controls', 'playsinline']) expectedVideo.searchParams.set(key, '1');
      assert.equal($('.project-gallery iframe').attr('src'), expectedVideo.href, doc.slug);
      assert.match($('.project-gallery iframe').attr('allow'), /autoplay/);
      assert.equal($('.project-gallery iframe').attr('title'), `${doc.data.title} trailer`);
      assert.equal($('.project-media-panel').first().find('iframe').length, 1);
    }
    assert.equal($('.project-media-panel img').length, doc.data.gallery?.length || 0, doc.slug);
    assert.equal($('.project-media-thumbnail').length, (doc.data.gallery?.length || 0) + Number(Boolean(doc.data.trailer)), doc.slug);
    assert.equal($('.project-body .project-gallery, .project-trailer').length, 0);
    if (doc.data.trailer || doc.data.gallery?.length) {
      assert.equal($('.project-gallery').next().hasClass('project-body'), true);
    }
    assert.equal($('.project-extra .gallery').length, 0, 'Main gallery is not duplicated');
    assert.ok(doc.data.roles, doc.slug);
    assert.ok(doc.data.development_date, doc.slug);
    assert.ok(doc.data.team, doc.slug);
    assert.equal(doc.data.sidebar, undefined, doc.slug);
    assert.equal($('.project-sidebar a[href=""]').length, 0);
  }
});

test('tech stack shares normalized filter values, counts, and encoded detail links', async () => {
  assert.deepEqual(projectFilterTags({tags:['Puzzle', 'unity'], skills:['Tools'], tech_stack:['Unity','C#','C++','FMOD'], featured:1}), ['Puzzle','unity','Tools','C#','C++','FMOD','Featured']);
  const state = await loadContent();
  const listing = load(collectionPage(state, 'project'));
  for (const doc of state.collections.project.filter(doc => !doc.data.hidden)) {
    const $ = load(documentPage(state, doc));
    for (const tag of doc.data.tech_stack) {
      const link = $('.tech-stack-tags a').filter((_, el) => $(el).text() === tag);
      assert.equal(link.attr('href'), `/projects.html?tag=${encodeURIComponent(tag)}`);
      const expected = state.collections.project.filter(other => !other.data.hidden && projectFilterTags(other.data).some(value => value.toLowerCase() === tag.toLowerCase())).length;
      const option = listing('#project-tag option').filter((_, el) => listing(el).attr('value').toLowerCase() === tag.toLowerCase());
      assert.equal(option.text(), `${tag} (${expected})`);
    }
  }
});

test('missing media stays omitted and project schema rejects malformed structured content', async () => {
  const state = await loadContent();
  const doc = {type:'project', slug:'test', url:'/project/test/', data:{title:'Minimal',time:'2026-01'},body:'Extra content.'};
  const $ = load(documentPage(state, doc));
  assert.equal($('.project-trailer, .project-gallery').length, 0);
  assert.equal($('.project-extra').prev().hasClass('project-roles'), true);
  for (const [field, value] of Object.entries({tech_stack:'Unity',development_date:123,team:5,roles:[],trailer:'javascript:alert(1)',links:[{label:'Invalid',url:''}],gallery:[{}],sidebar:[]})) {
    assert.throws(() => validateDocument({title:'Test',time:'2026-01',[field]:value}, 'project', 'test.md'), new RegExp(field));
  }
  const data = {title:'Test',time:'2026-01',tech_stack:[' Unity ', '#unity','C#']};
  validateDocument(data, 'project', 'test.md');
  assert.deepEqual(data.tech_stack, ['Unity','C#']);
});

