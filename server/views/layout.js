import { escapeHtml as e, localUrl } from '../html.js';
import { icon } from '../icons.js';

export function layout(content, { site, title, active = '/', description = '', url = '/', bodyClass = '' }) {
  const canonical = new URL(url, process.env.SITE_URL || site.url).href;
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#28233f">
<title>${e(title ? `${title} — ${site.title}` : site.title)}</title>
<meta name="description" content="${e(description)}">
<link rel="canonical" href="${e(canonical)}">
<meta property="og:title" content="${e(title || site.title)}"><meta property="og:description" content="${e(description)}">
<meta property="og:type" content="website"><meta property="og:url" content="${e(canonical)}">
<link rel="icon" href="/favicon.ico"><link rel="stylesheet" href="/ui/site.css">
<script type="module" src="/ui/site.js"></script>
</head><body id="top" class="${e(bodyClass)}">
<a class="skip-link" href="#main">Skip to content</a>
<header class="masthead"><div class="nav-shell">
<a class="brand" href="/" aria-label="${e(site.title)} home"><span>${e(site.title.toUpperCase())}</span></a>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="navigation">Menu <span aria-hidden="true">☰</span></button>
<nav id="navigation" aria-label="Main navigation">${site.navigation.map(link => `<a href="${e(link.url)}"${active === link.url ? ' aria-current="page"' : ''}>${e(link.title)}</a>`).join('')}</nav>
</div></header>
<main id="main" class="shell">${content}</main>
<footer class="site-footer"><div class="shell"><div class="footer-top"><a class="footer-name" href="#top" data-back-top aria-label="${e(site.title)} — Back to top">${e(site.title)}</a></div>
<nav aria-label="Social links">${site.footer.map(link => `<a href="${e(localUrl(link.url))}"${/^https?:/.test(link.url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(link.label)}<span>${e(link.label)}</span></a>`).join('')}</nav>
<p class="copyright">© ${new Date().getFullYear()} ${e(site.title)}.</p></div></footer>
<dialog class="lightbox" aria-label="Image viewer"><button class="lightbox-close" autofocus aria-label="Close image">Close ×</button><img alt=""></dialog>
</body></html>`;
}
