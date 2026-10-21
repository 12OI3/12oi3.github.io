export function initProjectFilters() {
  // Filtering runs in the browser, including on GitHub Pages.
  const projectBrowser = document.querySelector('.project-browser');
  if (projectBrowser) {
    const controls = projectBrowser.querySelector('.project-filters');
    const select = projectBrowser.querySelector('#project-tag');
    const buttons = [...projectBrowser.querySelectorAll('[data-tag]')];
    const activeTag = projectBrowser.querySelector('[data-active-tag]');
    const cards = [...projectBrowser.querySelectorAll('[data-project-tags]')].map(card => ({
      element: card, priority: Number(card.dataset.featured) || 0, tags: JSON.parse(card.dataset.projectTags).map(tag => tag.toLowerCase()),
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
      const orderedCards = tag.toLowerCase() === 'featured'
        ? [...cards].sort((a, b) => b.priority - a.priority) : cards;
      const results = projectBrowser.querySelector('#project-results');
      for (const card of orderedCards) results.append(card.element);
      let count = 0;
      for (const card of cards) {
        card.element.hidden = Boolean(tag) && !card.tags.includes(tag.toLowerCase());
        if (!card.element.hidden) count++;
      }
      for (const button of buttons) {
        const selected = button.dataset.tag.toLowerCase() === tag.toLowerCase();
        button.setAttribute('aria-pressed', String(selected));
        if (selected) button.setAttribute('aria-label', `Remove ${tag} filter`);
        else button.removeAttribute('aria-label');
      }
      // Pinned tags already provide a toggle; add one for dropdown-only tags.
      activeTag.hidden = !tag || buttons.some(button => button.dataset.tag.toLowerCase() === tag.toLowerCase());
      activeTag.textContent = tag;
      activeTag.setAttribute('aria-label', `Remove ${tag} filter`);
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
    activeTag.addEventListener('click', () => {
      filterProjects('', true);
      select.focus();
    });
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
}
