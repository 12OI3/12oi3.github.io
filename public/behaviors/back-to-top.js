import { scrollBehavior } from './scroll.js';

export function initBackToTop() {
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
}
