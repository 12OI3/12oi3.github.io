export function initProjectGallery() {
  document.querySelectorAll('[data-project-gallery]').forEach(gallery => {
    const panels = [...gallery.querySelectorAll('[data-media-panel]')];
    const thumbnails = [...gallery.querySelectorAll('[data-media-index]')];
    const status = gallery.querySelector('.project-media-status');
    const strip = gallery.querySelector('.project-media-thumbnails');
    let drag = null;
    let suppressClick = false;
    strip.addEventListener('pointerdown', event => {
      suppressClick = false;
      // Touch scrolling stays native, including vertical page scrolling.
      if (event.pointerType !== 'mouse' || event.button !== 0 || strip.scrollWidth <= strip.clientWidth) return;
      drag = { id: event.pointerId, x: event.clientX, scroll: strip.scrollLeft, active: false };
    });
    window.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId) return;
      const distance = event.clientX - drag.x;
      if (!drag.active && Math.abs(distance) < 6) return;
      if (!drag.active) {
        drag.active = true;
        strip.setPointerCapture(event.pointerId);
        strip.classList.add('is-dragging');
      }
      event.preventDefault();
      strip.scrollLeft = drag.scroll - distance;
    });
    const finishDrag = event => {
      if (!drag || drag.id !== event.pointerId) return;
      suppressClick = drag.active;
      drag = null;
      strip.classList.remove('is-dragging');
      if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
    };
    window.addEventListener('pointerup', finishDrag);
    window.addEventListener('pointercancel', finishDrag);
    strip.addEventListener('lostpointercapture', finishDrag);
    strip.addEventListener('dragstart', event => event.preventDefault());
    strip.addEventListener('click', event => {
      if (!suppressClick || event.detail === 0) return;
      suppressClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    let selected = 0;
    function select(index, focus = false) {
      selected = (index + panels.length) % panels.length;
      panels.forEach((panel, i) => {
        panel.hidden = i !== selected;
        const frame = panel.querySelector('iframe');
        if (frame) {
          frame.dataset.source ||= frame.getAttribute('src');
          if (panel.hidden) frame.removeAttribute('src');
          else if (!frame.hasAttribute('src')) frame.src = frame.dataset.source;
        }
        thumbnails[i].setAttribute('aria-pressed', String(i === selected));
      });
      const thumb = thumbnails[selected];
      strip.scrollLeft = thumb.offsetLeft - (strip.clientWidth - thumb.clientWidth) / 2;
      if (focus) thumb.focus({ preventScroll: true });
      status.textContent = `${selected + 1} / ${panels.length} · ${panels[selected].getAttribute('aria-label')}`;
    }
    thumbnails.forEach((thumb, index) => thumb.addEventListener('click', () => select(index)));
    gallery.querySelector('[data-media-previous]').addEventListener('click', () => select(selected - 1));
    gallery.querySelector('[data-media-next]').addEventListener('click', () => select(selected + 1));
    strip.addEventListener('keydown', event => {
      const index = { ArrowLeft: selected - 1, ArrowRight: selected + 1, Home: 0, End: panels.length - 1 }[event.key];
      if (index === undefined) return;
      event.preventDefault();
      select(index, true);
    });
    gallery.querySelector('.project-media-controls').hidden = panels.length < 2;
    status.hidden = false;
    select(0);
  });
}
