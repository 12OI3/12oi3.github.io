import { scrollBehavior } from './scroll.js';

export function initHomeProjects() {
  const masthead = document.querySelector('.masthead');
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
}
