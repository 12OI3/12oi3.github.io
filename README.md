# ROB portfolio

A Markdown website published at https://12oi3.github.io using GitHub Pages, without Jekyll. A small Node.js build generates HTML with the same templates used by the local preview. Browser interactions, including image galleries and mobile navigation, work on the published site.

## Run locally

Install Node.js 22 or newer and pnpm, then:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. You can also use `pnpm start` without automatic code restarts. Use pnpm so installs follow the checked-in lockfile.

The development server reads Markdown on every request. Save a content file and refresh the page; no build or server restart is needed locally. `pnpm dev` additionally restarts the server when application code changes. The public GitHub Pages website updates after you push and its build finishes.

To preview the actual files that GitHub Pages publishes:

```sh
pnpm build
pnpm preview
```

Open http://127.0.0.1:4173. Rebuild after changing content to update this static preview.

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
server/           Shared content loader, renderer, layouts, development server
test/             Route, content-rendering, and live-update checks
scripts/          Content audit, static build, static preview
.github/workflows/pages.yml  Build, test, and publish to GitHub Pages
dist/             Generated website (ignored by Git; recreated by each build)
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

Edit `projects.md`, `devlogs.md`, or `articles.md` in `content/pages/` for collection introductions. Add a new file such as `content/pages/about.md` with `title` front matter to create `/about.html` on the next build (immediately in the development preview). Add a navigation entry in `content/site.yml` if desired.

Links between projects and devlogs are still normal Markdown links. Original URLs containing spaces, Unicode, and `#` in filenames are supported; the renderer encodes these characters correctly.

## Deployment

The workflow in `.github/workflows/pages.yml` tests and builds the site, then publishes only `dist/` to **https://12oi3.github.io/**. It runs automatically when you push to **`Develop(Codex)`**. Pull requests targeting that branch run checks without publishing. Jekyll is not used and the README is never included in the deployment.

One-time repository setup:

1. Open [Settings → Pages](https://github.com/12OI3/12oi3.github.io/settings/pages).
2. Under **Build and deployment → Source**, select **GitHub Actions**, replacing “Deploy from a branch.”
3. If the `github-pages` environment restricts deployment branches, allow `Develop(Codex)` in **Settings → Environments → github-pages**.
4. Commit and push these changes to `Develop(Codex)`. Check the **Deploy website to GitHub Pages** run in the repository's Actions tab.

For future updates, edit Markdown or assets, commit, and push to `Develop(Codex)`. No manual HTML editing or committing `dist/` is needed. The build copies browser files to `/ui/`, media to `/assets/`, and preserves existing page and icon URLs, including filenames containing spaces, Unicode, or `#`. It also supplies a custom `404.html` and `.nojekyll` marker.

GitHub Pages serves generated files; it does not run the development server. Node.js is used only during the build and local development. The existing Dockerfile remains available as an optional way to run the live Markdown server outside GitHub Pages.

Local development environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` (`4173` for static preview) | Listening port |
| `HOST` | `127.0.0.1` | Preview bind address |
| `SITE_URL` | `url` in `content/site.yml` | Canonical URL override; leave unset for the existing GitHub Pages address |

The existing Disqus shortname and original URL/identifier are retained so comment threads can be reused. Visitors click **Load comments** to load Disqus. The original `url` in `content/site.yml` stays the comment-thread base URL even when `SITE_URL` changes. Actual thread continuity depends on Disqus's existing records and must be checked on the deployed domain.

## Verification

```sh
pnpm test
pnpm check:content
pnpm build
```

The tests cover all 42 collection pages, galleries, embedded-video URLs, homepage/listing routes, filenames, missing pages, draft exclusion, new standalone pages, and local content edits without restarting. They also build the static output and check its page links, assets, journal listings, custom 404, removal of stale output, and exclusion of source files.

`check:content` audits the current rendered pages, including local navigation links, thumbnails, galleries, sidebar links, icons, and browser assets. Run it after editing content to check for broken references or unrendered template markup.

Generated screenshots live in ignored `artifacts/`, which is not used by the application or included in the Docker image.

Site icons are organized under `public/icons/`; compatibility routes keep their original URLs, such as `/favicon.png` and `/devlog.png`.
