const menu = document.querySelector('.menu-toggle');
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
