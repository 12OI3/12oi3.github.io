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
public/
  site.js         Browser entry point (native ES modules)
  behaviors/      Navigation, cat scrolling, filters, galleries, comments
  site.css        Ordered stylesheet imports
  styles/         Base, layout, home, projects, journals, document, cat
  icons/          Site icons and cat illustrations
server/
  config.js       Shared collection names, skills, and icon URLs
  content.js      Content loading entry point
  content/        Validation, taxonomy, relationships, homepage selections
  views.js        Page rendering entry point
  views/          Layout and page-specific templates
  markdown.js     Markdown parser and component directives
  components/     Shared cat, gallery, and feature rendering
  html.js         HTML escaping and local URL encoding
  app.js          Development HTTP routes
test/             Route, content-rendering, and live-update checks
scripts/          Content audit, static build, static preview
.github/workflows/pages.yml  Build, test, and publish to GitHub Pages
dist/             Generated website (ignored by Git; recreated by each build)
```

See [docs/architecture.md](docs/architecture.md) for the rendering flow and where to add features.

## Add a project, devlog, or article

Start with the copy-ready [Project](content/projects/template.md),
[Devlog](content/devlogs/template.md), or [Article](content/articles/template.md)
template. See [template instructions](docs/content-templates.md) for destinations,
dates, media, and publishing. Each template lives in its collection folder with
`published: false`, keeping it off listings and direct URLs.

Add a `.md` file to the appropriate content directory. Filename stems determine URLs; keep published filenames stable. For example, `content/projects/2026-10-My Project.md` is served at `/project/2026-10-My%20Project/`.

```markdown
---
title: "My Project"
hook: >-
  A short hook.
tags: [GameJam, Puzzle]
tech_stack: [Unity, C#]
skills: [Technical Game Design, UI/UX]
featured: 0
time: "2026-10"
published: true
teaser: /assets/images/projects/My Project/teaser.jpg
development_date: "2026/08 ~ PRESENT"
team: "3 people"
links:
  - label: itch.io
    url: https://example.itch.io/my-project
roles: |-
  ### Game designer
  - Designed the core mechanics and levels.
---

Extra content here appears after Roles.
```

`title` and `time` are required for collection documents. The three listing pages automatically include new published files. `time` is an ordering string, sorted newest first; existing values such as `2023-07a` and `2023-07b` retain their ordering. Use consistent, zero-padded values (`YYYY-MM` for projects and `YYYY-MM-DD` for articles/devlogs).

`published: false` keeps a document off both the listing and its direct URL. `hidden: true` hides it from the listing while keeping the URL accessible. Omit `teaser` if no thumbnail is needed. `comments: false` disables comments for an individual page.


Set `featured` to an integer priority in a project's front matter (default `0`, without quotes). Positive values add the project to the automatic Featured filter and give its Projects page card an accent background and gold star badge. Higher values appear first when Featured is selected; equal priorities keep their normal order. Zero and negative values are not featured. The Featured button and dropdown option toggle the same filter; clearing it restores normal card order. There is no need to add Featured to `tags` or `pinned_tags`. Homepage selections remain unchanged. Devlog `highlight` remains a separate boolean.

## Project tags and filtering

Project cards on the homepage and Projects page show the title, clickable project tags, and the `hook`. Each tag links to its Projects page filter. The `hook` also supplies the blockquote on the project detail page, so editing it once updates all three places. Markdown formatting is supported. Devlogs and articles continue to use `excerpt`.

Add a `tags` list to a project's front matter. These tags remain available in the Projects page filter dropdown:

```yaml
tags:
  - GameJam
  - Puzzle
  - Financial Literacy
```

Use plain tag names without `#`. Multiword names are supported. Matching ignores capitalization, surrounding whitespace, and an optional leading `#`; duplicates within a project are removed. Use consistent spelling for display. Omit `tags` or use `tags: []` for an untagged project, which appears when no filter is selected. Put engines, languages, SDKs, and libraries in `tech_stack`, for example `tech_stack: [Unity, C#, FMOD]`. These entries appear in the Tech Stack sidebar and in the same Projects filter dropdown and pinned controls as regular tags and skills. Filter counts deduplicate names across all three lists. Each detail-page tag links to its filter, including names with `#` or `+`.

Choose which tags appear as shortcut buttons in `content/pages/projects.md`:

```yaml
pinned_tags: [GameJam, Plugin, ETC-BVW, Prototype, VR]
```

Buttons follow this order. Tags without any listed projects are omitted. Use `pinned_tags: []` to keep only the automatic Featured button beside the dropdown. Both controls select one tag at a time, show matching counts, and preserve chronological project order. Clicking the selected pinned tag again clears the filter and shows all projects; selecting **All tags** in the dropdown does the same. The filter is shareable through `projects.html?tag=GameJam`, and browser Back/Forward restores it. Draft and hidden projects never contribute tags or counts. Filtering runs in the browser on GitHub Pages; all projects remain readable with JavaScript disabled.

Skills use a separate `skills` list. The supported values are `Technical Game Design`, `Tools`, and `UI/UX`. For example:

```yaml
tags: [Plugin, VisualNovel]
tech_stack: [Unity]
skills: [Tools, UI/UX]
```

Omit `skills` or use `skills: []` when none apply. Skill names normalize capitalization and whitespace; unsupported values or skill labels placed in `tags` produce a validation error. Detail pages show project tags below the title and skill tags at the top of the sidebar; cards show the project hook. The project dropdown and pinned buttons can filter by tags, skills, or Tech Stack. Homepage buttons still use the curated project lists in `home.md`; Technical Game Design starts selected, and exactly one skill stays active.

## Project details and galleries

Project detail order is fixed by the template: **featured devlog (full width) → title → trailer → hook quote → gallery → roles → Markdown content**. The sidebar contains **Tags → Skills → Development date → Tech Stack → Team → Links**. Skills and tags are omitted when empty. On mobile, the sidebar sits after the title and before the trailer. Missing trailers and galleries are omitted. Missing sidebar values and roles display a neutral availability label; existing author placeholders are preserved.

Use structured front matter for these sections; project `sidebar` arrays are rejected to prevent layout drift:

```yaml
development_date: "2026/01 ~ 2026/04"
tech_stack: [Unity, C#]
team: "3 people"
links:
  - label: GitHub
    url: https://github.com/example/my-project
trailer: https://www.youtube-nocookie.com/embed/VIDEO_ID
roles: |-
  ### Designer and programmer
  - Designed and implemented the core gameplay.
gallery:
  - url: /assets/images/projects/My Project/1.jpg
    image_path: /assets/images/projects/My Project/1.jpg
    alt: "Gameplay screenshot"
```

The project `gallery` array renders automatically between the hook and Roles. Do not repeat its directive in the project body. `trailer` takes an HTTPS embed URL. `links: []` displays “Not available” without an empty hyperlink. Markdown is supported in `roles`, `team`, and `development_date`.

Use `hook` for the short card text and quote below the trailer. Write detailed descriptions in the Markdown body after the closing `---`, followed by features, tutorials, notes, and supporting media. This content appears after Roles. The featured devlog appears at the top across the full page width; project pages omit the additional devlog list and comments.

Other documents, or additional galleries in extra content, can still place a gallery using:

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

Edit `content/pages/home.md` for the introduction and homepage project selections. The `project_groups` mapping defines the tag buttons and an ordered list of project filenames (without `.md`) per tag. Lists can contain any number of projects:

```yaml
project_groups:
  Technical Game Design:
    - 2025-11-BEAT-Shojo
    - 2025-07-Vocabutory
    - 2023-01-Survivor For The Feast
  Tools:
    - 2026-05-Scriptable Functions Library
    - 2025-06-CreSpiritTalker
    - 2024-02-Project Fusion
  UI/UX:
    - 2023-07-You Ken-Do It
    - 2025-06-CreSpiritTalker
    - 2025-11-BEAT-Shojo
```

Technical Game Design is selected by default. Exactly one homepage skill stays selected: clicking the active button keeps it selected, and choosing another switches the displayed list. If Technical Game Design is removed from the configuration, the first group becomes the default. Each list appears in the exact order written. A project can belong to multiple lists. Use `[]` for an empty list; selecting it shows an empty state while keeping its button active. Missing, hidden, or unpublished project references cause a clear validation error. Cards read the current title, teaser image, hook, and URL from each project. Project selections do not use a highlight flag.

The `:::feature intro center` and `:::feature projects project` components render the introduction and these selections. Changes appear on the next request with `pnpm dev`, or after rebuilding with `pnpm build` for the static preview and GitHub Pages.

Edit `projects.md`, `devlogs.md`, or `articles.md` in `content/pages/` for collection introductions. Add a new file such as `content/pages/about.md` with `title` front matter to create `/about.html` on the next build (immediately in the development preview). Add a navigation entry in `content/site.yml` if desired.

## Link devlogs to projects

Homepage project cards show a featured devlog link only for a linked devlog with `highlight: true` in its YAML front matter. Project detail pages show that devlog in a card after Roles and any extra body content, including its title, excerpt, and link. This devlog-only boolean defaults to `false`; use unquoted `true` or `false`. If several linked devlogs are highlighted, the newest visible, published one is shown. No card appears when none qualify. The full devlog listing and project devlog lists still include unhighlighted posts.

Set `projects` in a devlog's YAML front matter to a list of exact project filenames without `.md`:

```yaml
---
title: "Vocabutory #4"
time: "2026-10-03"
projects:
  - "2025-07-Vocabutory"
  - "2026-09-You Hive My Word"
highlight: true
published: true
---
```

This example links the devlog to both projects. A highlighted devlog is eligible for the featured card on every linked project, and for those projects' homepage cards. Each project independently shows its newest highlighted devlog. Use `projects: []` or omit the field for general posts. Every referenced project must exist and be published; a typo or a reference to a draft project produces a build error naming the devlog to fix.

Existing single-project syntax (`project: "2025-07-Vocabutory"`) still works. When changing to a list, replace `project` with `projects`. If both fields are present, their references are combined; repeated references produce only one link and one list entry per project.

Each project page automatically lists its linked devlogs after Roles, extra content, and the featured devlog card, newest first. Each linked devlog shows links back to all its projects beneath the title, in the configured order. You only maintain the relationship in the devlog: no list or duplicate metadata is needed in project Markdown. Projects with no linked devlogs show no section. Drafts and `hidden: true` devlogs are excluded from generated lists; hidden devlogs still show their project links at their direct URL.

Changing or removing these references updates every project's list automatically on the next local request or Pages build. The existing handwritten project lists have been replaced with these generated lists. Ordinary links within prose still work. Original URLs containing spaces, Unicode, and `#` in filenames are supported; the renderer encodes these characters correctly.

## Deployment

The workflow in `.github/workflows/pages.yml` tests and builds the site, then publishes only `dist/` to **https://12oi3.github.io/**. It runs automatically when you push to **`Develop(Codex)`**. Pull requests targeting that branch run checks without publishing. Jekyll is not used and the README is never included in the deployment.

One-time repository setup:

1. Open [Settings → Pages](https://github.com/12OI3/12oi3.github.io/settings/pages).
2. Under **Build and deployment → Source**, select **GitHub Actions**, replacing “Deploy from a branch.”
3. If the `github-pages` environment restricts deployment branches, allow `Develop(Codex)` in **Settings → Environments → github-pages**.
4. Commit and push these changes to `Develop(Codex)`. Check the **Deploy website to GitHub Pages** run in the repository's Actions tab.

For future updates, edit Markdown or assets, commit, and push to `Develop(Codex)`. No manual HTML editing or committing `dist/` is needed. The build copies browser files to `/ui/<content-hash>/` so deployments load matching scripts, nested modules, and styles instead of stale cached versions. Media goes to `/assets/`; existing page and icon URLs are preserved, including filenames containing spaces, Unicode, or `#`. It also supplies a custom `404.html` and `.nojekyll` marker.

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

The tests cover every published collection page, galleries, embedded-video URLs, homepage/listing routes, filenames, missing pages, draft exclusion, new standalone pages, and local content edits without restarting. They also build the static output and check its page links, assets, journal listings, custom 404, removal of stale output, and exclusion of source files.

`check:content` audits the current rendered pages, including local navigation links, thumbnails, galleries, sidebar links, icons, and browser assets. It also follows imported browser JavaScript and CSS files, catching missing nested assets before publishing. Run it after editing content or modules to check for broken references or unrendered template markup.

Generated screenshots live in ignored `artifacts/`, which is not used by the application or included in the Docker image.

Site icons are organized under `public/icons/`; compatibility routes keep their original URLs, such as `/favicon.png` and `/devlog.png`.

