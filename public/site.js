const menu = document.querySelector('.menu-toggle');
// Filtering runs in the browser, including on GitHub Pages.
const projectBrowser = document.querySelector('.project-browser');
if (projectBrowser) {
  const controls = projectBrowser.querySelector('.project-filters');
  const select = projectBrowser.querySelector('#project-tag');
  const buttons = [...projectBrowser.querySelectorAll('[data-tag]')];
  const cards = [...projectBrowser.querySelectorAll('[data-project-tags]')].map(card => ({
    element: card, tags: JSON.parse(card.dataset.projectTags).map(tag => tag.toLowerCase()),
  }));
  const knownTags = [...select.options].map(option => option.value);
  function filterProjects(requestedTag, updateUrl = false) {
    const tag = knownTags.find(value => value.toLowerCase() === requestedTag.toLowerCase()) ?? requestedTag;
    // Keep an old or unknown bookmarked tag visible, with an honest empty state.
    select.querySelector('[data-unknown-tag]')?.remove();
    if (!knownTags.includes(tag)) {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      option.dataset.unknownTag = '';
      select.append(option);
    }
    select.value = tag;
    let count = 0;
    for (const card of cards) {
      card.element.hidden = Boolean(tag) && !card.tags.includes(tag.toLowerCase());
      if (!card.element.hidden) count++;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.tag.toLowerCase() === tag.toLowerCase()));
    projectBrowser.querySelector('.project-count').textContent = tag
      ? `Showing ${count} of ${cards.length} projects · ${tag}` : `Showing all ${cards.length} projects`;
    projectBrowser.querySelector('.project-empty').hidden = count !== 0;
    projectBrowser.querySelector('#project-results').hidden = count === 0;
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (tag) url.searchParams.set('tag', tag);
      else url.searchParams.delete('tag');
      if (url.href !== window.location.href) window.history.pushState(null, '', url);
    }
  }
  select.addEventListener('change', () => filterProjects(select.value, true));
  for (const button of buttons) button.addEventListener('click', () => filterProjects(button.dataset.tag, true));
  projectBrowser.querySelector('[data-clear-tags]').addEventListener('click', () => {
    filterProjects('', true);
    select.focus();
  });
  const restoreFilter = () => filterProjects(new URL(window.location.href).searchParams.get('tag') || '');
  window.addEventListener('popstate', restoreFilter);
  restoreFilter();
  controls.hidden = false;
}

const nav = document.querySelector('#navigation');
menu?.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(expanded));
  nav.classList.toggle('is-open', expanded);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    menu.focus();
  }
});

const lightbox = document.querySelector('.lightbox');
document.querySelectorAll('.gallery a').forEach(link => {
  if (!/\.(png|jpe?g|gif|webp)(\?.*)?$/i.test(link.getAttribute('href'))) return;
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const image = lightbox.querySelector('img');
    image.src = link.href;
    image.alt = link.querySelector('img')?.alt || '';
    lightbox.showModal();
  });
});
lightbox?.querySelector('button').addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });

document.querySelector('.load-comments')?.addEventListener('click', event => {
  const container = document.querySelector('#disqus_thread');
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = 'Loading comments…';
  window.disqus_config = function () {
    this.page.url = container.dataset.url;
    this.page.identifier = container.dataset.identifier;
  };
  const script = document.createElement('script');
  script.src = `https://${container.dataset.shortname}.disqus.com/embed.js`;
  script.onload = () => button.remove();
  script.onerror = () => { button.disabled = false; button.textContent = 'Retry loading comments'; script.remove(); };
  document.head.append(script);
});
