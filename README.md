# ROB portfolio

A Node.js website rendered on the server from Markdown, with projects, devlogs, articles, and standalone pages. No static-site build step is required.

## Run locally

Install Node.js 22 or newer and pnpm, then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. For normal operation use `pnpm start`. You can also use `npm install` and `npm start`, but pnpm uses the checked-in lockfile for reproducible installs.

Markdown is read on every request. Save a content file and refresh the page; no build or server restart is needed. `pnpm dev` additionally restarts the server when application code changes.

## Structure

```text
content/
  site.yml        Site name, navigation, footer links, Disqus settings
  pages/          Homepage, collection introductions, and standalone pages
  projects/       Project Markdown
  devlogs/        Development log Markdown
  articles/       Article Markdown
assets/           Original images and résumé
public/           Browser CSS and JavaScript
  icons/          Site icons and homepage illustrations
server/           Content loader, Markdown renderer, page layouts, HTTP server
test/             Route, content-rendering, and live-update checks
scripts/          Current-content audit
```

## Add a project, devlog, or article

Add a `.md` file to the appropriate content directory. Filename stems determine URLs; keep published filenames stable. For example, `content/projects/2026-10-My Project.md` is served at `/project/2026-10-My%20Project/`.

```markdown
---
title: "My Project"
excerpt: "A short description."
time: "2026-10"
published: true
header:
  teaser: /assets/images/projects/My Project/teaser.jpg
---

Write the page here with normal Markdown.
```

`title` and `time` are required for collection documents. The three listing pages automatically include new published files. `time` is an ordering string, sorted newest first; existing values such as `2023-07a` and `2023-07b` retain their ordering. Use consistent, zero-padded values (`YYYY-MM` for projects and `YYYY-MM-DD` for articles/devlogs).

`published: false` keeps a document off both the listing and its direct URL. `hidden: true` hides it from the listing while keeping the URL accessible. Omit `header.teaser` if no thumbnail is needed. `comments: false` disables comments for an individual page.

## Project details and galleries

Optional sidebar metadata stays in front matter:

```yaml
sidebar:
  - title: Team size
    text: "3"
  - title: Role & Responsibility
    text: "Designer and programmer."
gallery:
  - url: /assets/images/projects/My Project/1.jpg
    image_path: /assets/images/projects/My Project/1.jpg
    alt: "Gameplay screenshot"
```

Place this component where the gallery should appear in the Markdown body:

```markdown
:::gallery gallery
:::
```

Use any front-matter array name, and optionally `half` or `third` for columns:

```markdown
:::gallery tutorial_part_1 half
:::
```

Image links open an accessible image dialog. Links to external game pages remain normal links. Standard Markdown images and existing HTML video iframes also work. To center a paragraph or image, place `{.text-center}` on the next line. Inline link classes work as `[Resume](/assets/Huang_KuanYen_Resume.pdf){.btn}`.

Raw HTML is enabled to preserve the original embedded videos and formatting. Markdown files are trusted author input; this app does not accept uploaded Markdown from visitors.

## Homepage and standalone pages

Edit `content/pages/home.md` for the introduction, featured projects, and latest devlog/article links. These selections remain manually curated, as on the original site. Its `:::feature name type` components refer to arrays in the same file's front matter.

Edit `projects.md`, `devlogs.md`, or `articles.md` in `content/pages/` for collection introductions. Add a new file such as `content/pages/about.md` with `title` front matter to create `/about.html` immediately. Add a navigation entry in `content/site.yml` if desired.

Links between projects and devlogs are still normal Markdown links. Original URLs containing spaces, Unicode, and `#` in filenames are supported; the renderer encodes these characters correctly.

## Deployment

This application needs a running Node.js server. GitHub Pages cannot host it because Pages only serves static files. Deploy the repository to a Node.js service or your own server:

```sh
pnpm install --frozen-lockfile --prod
HOST=0.0.0.0 PORT=3000 NODE_ENV=production pnpm start
```

On Windows PowerShell, set environment variables with `$env:HOST = '0.0.0.0'` and `$env:PORT = '3000'` before `pnpm start`. For public hosting, configure HTTPS with the hosting provider or reverse proxy.

An optional Dockerfile is included (`docker build -t rob-portfolio .`, then `docker run -p 3000:3000 rob-portfolio`). `/healthz` is the health-check endpoint. Application errors are logged server-side.

Environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | Listening port |
| `HOST` | `127.0.0.1` | Bind address; use `0.0.0.0` in containers/hosted services |
| `SITE_URL` | `url` in `content/site.yml` | Public canonical URL for the new deployment |

Content in a deployed repository updates when that repository is redeployed. For updates without deployment, mount a persistent `content/` directory and edit files there. The server reads those files immediately; it does not write content itself.

The existing Disqus shortname and original URL/identifier are retained so comment threads can be reused. Visitors click **Load comments** to load Disqus. The original `url` in `content/site.yml` stays the comment-thread base URL even when `SITE_URL` changes. Actual thread continuity depends on Disqus's existing records and must be checked on the deployed domain.

## Verification

```sh
pnpm test
pnpm check:content
```

The tests cover all 42 collection pages, galleries, embedded-video URLs, homepage/listing routes, filenames, missing pages, draft exclusion, new standalone pages, and content edits without restarting.

`check:content` audits the current rendered pages, including local navigation links, thumbnails, galleries, sidebar links, icons, and browser assets. Run it after editing content to check for broken references or unrendered template markup.

Generated screenshots live in ignored `artifacts/`, which is not used by the application or included in the Docker image.

Site icons are organized under `public/icons/`; compatibility routes keep their original URLs, such as `/favicon.png` and `/devlog.png`.
