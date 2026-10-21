# Content templates

Duplicate `template.md` in the relevant collection folder and rename the copy
before editing. Keep the original template unpublished:

| Template | Destination filename |
| --- | --- |
| `content/projects/template.md` | `content/projects/YYYY-MM-Project Title.md` |
| `content/devlogs/template.md` | `content/devlogs/YYYY-MM-DD-Devlog Title.md` |
| `content/articles/template.md` | `content/articles/YYYY-MM-DD-Article Title.md` |

Templates are validated along with other content but excluded from the site. Every template starts with
`published: false`, so copied drafts remain off listings and direct URLs until
you set `published: true`.

1. Replace the title, date, and sample text. Remove unused sections.
2. Add any images to `assets/images/` and update their paths before uncommenting
   media examples. Commented examples are instructions, not live assets.
3. For a project, edit `hook` for the short card/quote text and write the detailed
   description in the Markdown body after the closing `---`. It appears after Roles. Keep ordinary tags, skills, and Tech Stack
   in their separate lists. The template controls display order automatically.
4. For a linked devlog, add exact published project filenames without `.md` to
   `projects`. Set `highlight: true` only when it should be featured.
5. Set `published: true` when ready, then run `pnpm build` to validate references
   and generate the site. Publishing to the live site still requires the usual
   GitHub Pages workflow.

The development server reads saved content on refresh. For the static preview,
rebuild first. Keep filenames stable after publication because they define URLs.
