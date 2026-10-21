export function initComments() {
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
}
