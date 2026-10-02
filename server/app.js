import express from 'express';
import path from 'node:path';
import { root, loadContent, collectionNames } from './content.js';
import { homePage, collectionPage, documentPage, standalonePage } from './views.js';

export function createApp({ contentRoot = path.join(root, 'content') } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
  app.use('/ui', express.static(path.join(root, 'public'), { maxAge: 0, dotfiles: 'deny' }));
  app.use('/assets', express.static(path.join(root, 'assets'), { maxAge: '1h', dotfiles: 'deny' }));
  for (const filename of ['favicon.ico', 'favicon.png', 'article.ico', 'article.png', 'devlog.ico', 'devlog.png']) {
    app.get(`/${filename}`, (req, res) => res.sendFile(path.join(root, 'public', 'icons', filename)));
  }
  app.get('/healthz', (req, res) => res.json({ status: 'ok' }));
  app.use(async (req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.sendStatus(405);
    // Dynamic HTML is never cached, so Markdown edits appear on the next request.
    res.set('Cache-Control', 'no-store');
    try {
      const state = await loadContent(contentRoot);
      let pathname;
      try { pathname = decodeURIComponent(req.path); } catch { return res.status(400).send('Invalid URL'); }
      if (pathname === '/' || pathname === '/index.html') return res.send(homePage(state));
      for (const [type, name] of Object.entries(collectionNames)) {
        if ([`/${name}.html`, `/${name}`, `/${name}/`].includes(pathname)) return res.send(collectionPage(state, type));
        if (pathname.startsWith(`/${type}/`)) {
          const slug = pathname.slice(type.length + 2).replace(/\/$/, '');
          const doc = state.collections[type].find(item => item.slug === slug);
          if (doc) return res.send(documentPage(state, doc));
        }
      }
      const pageName = pathname.replace(/^\//, '').replace(/\.html$|\/$/g, '');
      if (pageName !== '404' && Object.hasOwn(state.pages, pageName) && !['home', ...Object.values(collectionNames)].includes(pageName)) {
        return res.send(standalonePage(state, pageName));
      }
      return res.status(404).send(standalonePage(state, '404'));
    } catch (error) { next(error); }
  });
  app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).type('html').send('<h1>Unable to load this page</h1><p>Please try again shortly.</p>');
  });
  return app;
}
