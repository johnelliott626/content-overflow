# Content Overflow

A [Starlight](https://starlight.astro.build/) documentation site that gathers
docs from several repositories into one searchable place, deployed to GitHub
Pages.

No documentation is authored here. Every page is pulled from a remote
repository at build time, so upstream stays the single place to make edits.

Current sources:

| Source | Repository | Directory | Branch |
| --- | --- | --- | --- |
| Content Sources Backend | [content-services/content-sources-backend](https://github.com/content-services/content-sources-backend) | `docs/` | `main` |
| Content Sources Frontend | [content-services/content-sources-frontend](https://github.com/content-services/content-sources-frontend) | `docs/` | `main` |
| Patchman Engine | [RedHatInsights/patchman-engine](https://github.com/RedHatInsights/patchman-engine) | `docs/md/` | `master` |
| Patchman UI | [RedHatInsights/patchman-ui](https://github.com/RedHatInsights/patchman-ui) | `docs/` | `master` |

Patchman Engine reads from `docs/md/` rather than `docs/`, because the level
above it holds generated OpenAPI JSON and Go sources rather than prose.

## Getting started

```bash
npm install
npm run dev      # syncs the remote docs, then serves on http://localhost:4321/content-overflow/
```

| Command | What it does |
| --- | --- |
| `npm run sync` | Pull the remote docs into `src/content/docs/` |
| `npm run dev` | Sync, then start the dev server |
| `npm run build` | Sync, build to `dist/`, then fail on any broken internal link |
| `npm run check:links` | Re-run the link check against an existing `dist/` |
| `npm run clean` | Delete the synced output, the clone cache and the build caches |

Add `--offline` to `npm run sync` to rebuild from the clone cache without
fetching, and `--source=<id>` to sync a single repository.

## Adding another repository

Add one entry to `docs.sources.mjs`:

```js
{
  id: 'content-sources-frontend',
  label: 'Content Sources Frontend',
  repo: 'content-services/content-sources-frontend',
  ref: 'main',
  path: 'docs',
  dest: 'content-sources-frontend',
  order: 2,
}
```

Then run `npm run sync`. The sidebar group, the landing page card and the
`.gitignore` entries are all derived from that entry, so nothing else needs
editing.

Useful optional fields:

| Field | Purpose |
| --- | --- |
| `pages` | Ordered list of page paths; listed pages sort first in the sidebar |
| `rename` | Map an upstream path to a different output path |
| `exclude` | Glob patterns, relative to `path`, to skip |
| `include` | Extra non-image file types to copy as assets |
| `titles` | Set a page's title when it opens with a section heading, not a title |
| `groups` | Label a nested sidebar group, keyed by its directory path |
| `collapsed` | Start the sidebar group collapsed |
| `embedCode` | Set to `false` to leave GitHub permalinks as plain links |
| `url` | Clone URL override, for hosts other than github.com |

A private source repository needs a `DOCS_SYNC_TOKEN` secret with read access.
Public sources need no credentials.

## How the sync works

`scripts/sync-docs.mjs` makes remote markdown that was written for GitHub's
renderer work as Starlight content.

1. **Fetch.** Each source is cloned into `.cache/remote/<id>` with a blobless
   sparse clone, so only the docs directory is checked out while the full
   commit history stays available for per-file dates.
2. **Plan.** Every input file is mapped to its output path before anything is
   written. Output paths are already slug-shaped, so the URL Astro derives from
   a file path is exactly the URL the script computed for it.
3. **Frontmatter.** Starlight needs a title, which upstream files do not have.
   The script takes the first heading, derives a description from the opening
   paragraph, sets `editUrl` to the upstream file and sets `lastUpdated` from
   that file's last commit. Existing frontmatter keys are never overwritten.
4. **Headings.** The heading that became the title is removed. If a document
   still contains a level-one heading, every heading is demoted one level so it
   nests under the page title rather than competing with it.
5. **Links.** Relative links between documents become real site URLs. Links to
   files that are not published here, such as a repository's README or a
   PlantUML source, become links to the upstream repository.
6. **Assets.** Images are copied into `public/_assets/<dest>/` and references
   are rewritten to match.
7. **Permalinks.** A GitHub blob link with a line anchor, alone on its line,
   is replaced with the code it points at, shown with the original line numbers
   and a link back. This is the shape GitHub expands into a snippet in a
   comment, and upstream authors write it expecting that. Targets in the
   source's own repository are read from the clone, so a pinned commit resolves
   exactly; anything else is fetched over HTTP. A permalink used inside a
   sentence stays an ordinary link.
8. **Sidebar.** The sync records every page's title, slug and directory in a
   manifest, and `scripts/sidebar.mjs` builds the navigation from it. Starlight's
   own `autogenerate` would label nested groups with the raw directory name,
   which puts headings like `tasking-system` in the sidebar.

Content inside fenced and inline code is replaced with placeholders before any
of this runs, so code samples are never rewritten.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`, on a daily schedule, and on demand. Enable it once under
**Settings → Pages → Build and deployment → Source → GitHub Actions**.

The site URL and base path come from `actions/configure-pages`, so moving to a
custom domain needs no code change. Locally those values come from
`site.config.mjs`, overridable with the `SITE_URL` and `BASE_PATH` environment
variables.

Upstream edits reach the site on the next scheduled build. To publish them
immediately, have the source repository send a dispatch:

```bash
gh api repos/johnelliott626/content-overflow/dispatches -f event_type=docs-updated
```

`.github/workflows/ci.yml` runs the same sync, build and link check on pull
requests.

## Generated output

These paths are build output and are gitignored. `npm run sync` keeps the
ignore rules in step with the configured sources.

```
.cache/                 clone cache for each source repository
src/content/docs/<dest> synced markdown
public/_assets/<dest>   synced images
src/generated/          sync manifest used by the landing page
```
