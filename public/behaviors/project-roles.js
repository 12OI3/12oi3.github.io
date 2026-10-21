export function initProjectRoles() {
  document.querySelectorAll('.project-role-grid').forEach(rail => {
    if (rail.children.length < 2) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'project-role-carousel';
    rail.before(wrapper);
    const makeArrow = (label, direction) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `project-role-arrow ${direction < 0 ? 'previous' : 'next'}`;
      button.setAttribute('aria-label', label);
      button.addEventListener('click', () => {
        const step = rail.children[1].offsetLeft - rail.children[0].offsetLeft;
        rail.scrollBy({ left: direction * step, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      });
      return button;
    };
    const previous = makeArrow('Previous role', -1);
    const next = makeArrow('Next role', 1);
    wrapper.append(previous, rail, next);
    const update = () => {
      previous.disabled = rail.scrollLeft <= 1;
      next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 1;
    };
    rail.addEventListener('scroll', update, { passive: true });
    const measure = () => {
      // Measure with the full row available; arrows must not create overflow.
      const scroll = rail.scrollLeft;
      previous.hidden = next.hidden = true;
      wrapper.classList.remove('has-overflow');
      const overflowing = rail.scrollWidth > rail.clientWidth + 1;
      wrapper.classList.toggle('has-overflow', overflowing);
      previous.hidden = next.hidden = !overflowing;
      rail.scrollLeft = scroll;
      update();
    };
    new ResizeObserver(measure).observe(wrapper);
    measure();

    let drag = null;
    let suppressClick = false;
    rail.addEventListener('pointerdown', event => {
      suppressClick = false;
      if (event.pointerType !== 'mouse' || event.button !== 0 || !wrapper.classList.contains('has-overflow')) return;
      if (event.target.closest('a, button, input, textarea, select')) return;
      drag = { id: event.pointerId, x: event.clientX, scroll: rail.scrollLeft, active: false };
    });
    window.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const distance = event.clientX - drag.x;
      if (!drag.active && Math.abs(distance) < 6) return;
      if (!drag.active) {
        drag.active = true;
        rail.setPointerCapture(event.pointerId);
        rail.classList.add('is-dragging');
      }
      event.preventDefault();
      rail.scrollLeft = drag.scroll - distance;
    });
    const finishDrag = event => {
      if (!drag || drag.id !== event.pointerId) return;
      suppressClick = drag.active;
      drag = null;
      rail.classList.remove('is-dragging');
      if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    };
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    rail.addEventListener('lostpointercapture', finishDrag);
    rail.addEventListener('click', event => {
      if (!suppressClick) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    rail.addEventListener('dragstart', event => event.preventDefault());
  });
}
