export function initSectionNavigation() {
  const nav = document.querySelector('.section-navigation');
  if (!nav) return;
  const entries = [...nav.querySelectorAll('li a')].map(link => ({
    link, heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  })).filter(entry => entry.heading);
  if (!entries.length) return;
  let scheduled = false;
  function update() {
    scheduled = false;
    const offset = (document.querySelector('.masthead')?.getBoundingClientRect().height || 0) + 24;
    let current = entries[0];
    for (const entry of entries) {
      if (entry.heading.getBoundingClientRect().top <= offset) current = entry;
    }
    for (const entry of entries) {
      if (entry === current) entry.link.setAttribute('aria-current', 'location');
      else entry.link.removeAttribute('aria-current');
    }
  }
  function schedule() {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  window.addEventListener('load', schedule);
  update();
}
