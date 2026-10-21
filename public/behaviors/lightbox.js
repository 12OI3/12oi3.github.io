export function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  document.querySelectorAll('.gallery a, .project-media-panel a').forEach(link => {
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
}
