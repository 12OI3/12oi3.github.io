import { escapeHtml, localUrl } from '../html.js';
import { icon } from '../icons.js';

export function backToTopCat(imagePath) {
  return `<div class="home-cat-slot"><button class="home-cat" type="button" aria-label="Back to top" title="Back to top"><span class="cat-up" aria-hidden="true">${icon('up')}</span><img class="feature-image" src="${escapeHtml(localUrl(imagePath.startsWith('/') ? imagePath : '/' + imagePath))}" alt="" fetchpriority="high"><span class="cat-top-label" aria-hidden="true">Top</span></button></div>`;
}
