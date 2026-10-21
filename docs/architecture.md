# Site architecture

This is a Markdown site with a small Node.js renderer. The development server
and static build use the same content loader and page templates. There is no
browser framework or bundler to keep in sync with GitHub Pages.

## Content to page

1. `server/content.js` reads `content/site.yml`, page Markdown, and collections.
2. `content/documents.js` parses front matter and validates document fields.
   `content/taxonomy.js` normalizes tags/skills/tech stacks and derives the Featured filter.
3. `content/relationships.js` links devlogs to projects after published content
   has been loaded. `content/showcase.js` resolves the homepage's ordered groups.
4. `server/views.js` exposes four renderers: home, collection, document, and
   standalone. Their implementations live in `server/views/`, and all use
   `views/layout.js` for navigation, metadata, footer, and browser entry points.
5. `server/app.js` sends those pages on request; `scripts/build-site.js` writes
   them to `dist/` and copies browser files and media for static hosting.

`server/config.js` owns collection names, supported skills, the default skill,
cat image paths, and compatibility icon filenames. Changes to these shared
values should not be repeated in routes, builds, or templates.

## Rendering boundaries

- `server/html.js`: escaping and URL encoding; no content loading or Markdown.
- `server/markdown.js`: parser configuration and `:::gallery` / `:::feature`
  directives. Components receive the renderer for nested text, avoiding a
  circular dependency.
- `server/components/`: reusable cat and Markdown component markup.
- `server/views/`: page composition. Project filters/cards and chronological
  journal entries have separate templates; page templates do not read files.
- `server/views/project-detail.js`: fixed project content and sidebar order.
  Project front matter supplies hook, trailer, gallery, roles, description,
  development_date, tech_stack, team, and links; body Markdown holds extras
  after Roles and the detailed Description. Devlog cards/lists and comments follow those extras. Mobile
  places project metadata after the title/tags, before the main body.

Keep content decisions in the content layer. In particular, both homepage
cards and project headline cards use the same `highlightedDevlog()` selector.
Projects' integer `featured` priority and devlogs' boolean `highlight` are separate settings. A hidden
document retains its direct URL but is excluded from listings and showcases;
an unpublished document is excluded entirely.

Existing entry-point exports in `content.js`, `markdown.js`, and `views.js`
remain available for scripts and tests. Project sidebar arrays have migrated to
the structured fields above; validation rejects the old project sidebar shape.
Filenames and public URLs are unchanged.

## Browser behavior and styles

`public/site.js` initializes independent native ES modules in `behaviors/`:
navigation, back-to-top/cat animation, homepage selection, project filtering,
lightbox, and opt-in comments. Each module owns its DOM queries, listeners, and
state. Shared reduced-motion scroll behavior lives in `behaviors/scroll.js`.
Use relative imports: the same files run under `/ui/` locally and `/ui/<content-hash>/` in static builds. The build hashes scripts, styles, and their dependencies so updates invalidate the entire browser asset tree.

`public/site.css` imports `styles/` in an explicit order: foundation, shared
layout, home, projects, journals, documents, then the shared cat component.
Responsive rules live with their component instead of in a second stylesheet.
Edit the owning file rather than appending another override to `site.css`.
Cat size, floating size, and header offsets are centralized in `styles/cat.css`.

## Verifying changes

- `pnpm test`: content validation, relationships, page rendering, HTTP behavior,
  and static output, including imported browser files and their content types.
- `pnpm build`: audit content and browser imports, then regenerate `dist/`.
- `pnpm preview`: inspect generated pages at `http://127.0.0.1:4173`.

`scripts/browser-assets.js` walks static JavaScript imports and CSS imports/URLs
from the two browser entry points. Missing dependencies fail the content audit.
Use static relative imports when adding browser modules so the audit can follow
them. The build copies `public/` recursively; no additional asset list is needed.

For interaction changes, also check skill selection, filter URL/back navigation,
cat scrolling, mobile navigation, and galleries in the browser. For layout
changes, inspect both desktop and narrow mobile widths. Generated previews and
temporary comparison files belong in ignored `artifacts/`, never in `content/`.
