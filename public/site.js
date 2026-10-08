const menu = document.querySelector('.menu-toggle');
const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
document.querySelectorAll('[data-back-top]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}));
const masthead = document.querySelector('.masthead');
const homeCat = document.querySelector('.home-cat');
if (homeCat) {
  const slot = homeCat.closest('.home-cat-slot');
  let scheduled = false;
  let catTransition;
  const updateCat = () => {
    const headerBottom = masthead?.getBoundingClientRect().bottom || 0;
    homeCat.style.setProperty('--cat-top', `${headerBottom + 16}px`);
    const floating = slot.getBoundingClientRect().top < headerBottom + 12;
    if (floating !== homeCat.classList.contains('is-floating')) {
      // Animate between the actual screen positions, including interrupted moves.
      const before = homeCat.getBoundingClientRect();
      const paddingBefore = getComputedStyle(homeCat).padding;
      catTransition?.cancel();
      homeCat.classList.toggle('is-floating', floating);
      const after = homeCat.getBoundingClientRect();
      if (scrollBehavior() !== 'instant' && before.width && after.width) {
        catTransition = homeCat.animate([
          {
            transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) scale(${before.width / after.width}, ${before.height / after.height})`,
            padding: paddingBefore,
          },
          { transform: 'none', padding: getComputedStyle(homeCat).padding },
        ], { duration: 320, easing: 'cubic-bezier(.22, 1, .36, 1)' });
      }
    }
    scheduled = false;
  };
  const scheduleCat = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateCat);
    }
  };
  window.addEventListener('scroll', scheduleCat, { passive: true });
  window.addEventListener('resize', scheduleCat);
  homeCat.addEventListener('click', () => window.scrollTo({ top: 0, behavior: scrollBehavior() }));
  updateCat();
}
document.querySelectorAll('.intro-specialties').forEach(group => {
  const buttons = [...group.querySelectorAll('.specialty-button')];
  const projects = document.querySelector('#home-projects');
  const empty = document.querySelector('.home-project-empty');
  const cards = [...(projects?.querySelectorAll('[data-home-group]') || [])];
  for (const button of buttons) button.addEventListener('click', () => {
    for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
    if (!projects || !empty) return;
    const tag = button.dataset.tag;
    let count = 0;
    for (const card of cards) {
      card.hidden = card.dataset.homeGroup !== tag;
      if (!card.hidden) count++;
    }
    projects.hidden = count === 0;
    empty.hidden = count !== 0;
    empty.textContent = tag ? 'No projects selected for this tag yet.' : 'No projects selected yet.';
    window.scrollTo({
      top: Math.max(0, window.scrollY + group.getBoundingClientRect().top - (masthead?.getBoundingClientRect().height || 0) - 24),
      behavior: scrollBehavior(),
    });
  });
});
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
  for (const button of buttons) button.addEventListener('click', () => {
    filterProjects(button.getAttribute('aria-pressed') === 'true' ? '' : button.dataset.tag, true);
  });
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
