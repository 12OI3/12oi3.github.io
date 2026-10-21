import { escapeHtml as e, localUrl } from '../html.js';

function autoplayUrl(source) {
  const url = new URL(source);
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('mute', '1');
  url.searchParams.set('controls', '1');
  url.searchParams.set('playsinline', '1');
  return url.href;
}

export function projectGallery(data) {
  const images = data.gallery || [];
  const items = [
    ...(data.trailer ? [{ video: data.trailer, alt: 'Play trailer', image_path: data.teaser || images[0]?.image_path }] : []),
    ...images,
  ];
  if (!items.length) return '';
  return `<section class="project-gallery" aria-label="Project media" data-project-gallery>
    <div class="project-media-stage">${items.map((item, index) => `
      <div class="project-media-panel" id="project-media-${index}" data-media-panel aria-label="${e(item.video ? `${data.title} trailer` : item.alt || `Screenshot ${index + 1}`)}">
        ${item.video
          ? `<iframe src="${e(autoplayUrl(item.video))}" title="${e(data.title)} trailer" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
          : `<a href="${e(localUrl(item.url || item.image_path))}"${item.title ? ` title="${e(item.title)}"` : ''}><img src="${e(localUrl(item.image_path))}" alt="${e(item.alt)}" ${index ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async"></a>`}
      </div>`).join('')}
    </div>
    <div class="project-media-controls" hidden>
      <button type="button" class="project-media-arrow" data-media-previous aria-label="Previous media">‹</button>
      <div class="project-media-thumbnails" aria-label="Choose project media">${items.map((item, index) => `
        <button type="button" class="project-media-thumbnail" data-media-index="${index}" aria-controls="project-media-${index}" aria-pressed="${index === 0}" aria-label="${e(item.video ? 'Play trailer' : item.alt || `Screenshot ${index + 1}`)}">
          ${item.image_path ? `<img src="${e(localUrl(item.image_path))}" alt="" loading="lazy">` : ''}
          ${item.video ? '<span class="project-media-play" aria-hidden="true">▶</span><span class="project-media-label">Trailer</span>' : ''}
        </button>`).join('')}</div>
      <button type="button" class="project-media-arrow" data-media-next aria-label="Next media">›</button>
    </div>
    <p class="project-media-status" aria-live="polite" hidden></p>
  </section>`;
}
