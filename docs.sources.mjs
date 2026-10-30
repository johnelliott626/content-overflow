/**
 * Registry of remote documentation sources.
 *
 * Each entry pulls a directory out of a remote git repository and renders it as
 * a section of this site. Adding a repo means adding one object here and
 * running `npm run sync` -- nothing else needs to change.
 *
 * Fields:
 *   id        Stable identifier. Used for the clone cache directory and logs.
 *   label     Sidebar group heading.
 *   repo      GitHub "owner/name". Used for clone, edit and fallback links.
 *   ref       Branch, tag or commit to read docs from.
 *   path      Directory inside the repo holding the docs ('.' for the root).
 *   readme    Optional. Publish the repository's README as the landing page of
 *             this section, ahead of the documents under `path`. `true` takes
 *             README.md from the repository root; a string names another file.
 *             Override its title through `titles`, keyed by that same path.
 *   dest      Directory under src/content/docs, and the first URL segment.
 *   order     Optional. Sidebar order of this group relative to other sources.
 *   collapsed Optional. Start the sidebar group collapsed. Defaults to false.
 *   include   Optional. Extra non-markdown globs to copy (images are automatic).
 *   exclude   Optional. Glob patterns, relative to `path`, to skip entirely.
 *   pages     Optional. Ordered list of page slugs (no extension), relative to
 *             `path`. Listed pages sort first in that order; the rest follow
 *             alphabetically.
 *   rename    Optional. Map an upstream file path to a different output path.
 *   titles    Optional. Map an upstream file path to a page title. Use this
 *             when a document opens with a section heading rather than a
 *             title; the heading then stays in the body where it belongs.
 */

/** @type {import('./scripts/sync-docs.mjs').DocSource[]} */
export const sources = [
  {
    id: 'content-sources-backend',
    label: 'Content Sources Backend',
    repo: 'content-services/content-sources-backend',
    ref: 'main',
    path: 'docs',
    readme: true,
    dest: 'content-sources-backend',
    order: 1,
    titles: {
      // Opens with "## Prep your environment", the first of four sibling
      // sections, which is not a title for the document as a whole.
      'register_client.md': 'Registering a client',
    },
    pages: [
      'overview',
      'architecture',
      'workflows/introspection',
      'workflows/snapshotting',
      'workflows/templates',
      'tasking_system/tasking_system',
      'metrics/metrics',
    ],
  },
  {
    id: 'content-sources-frontend',
    label: 'Content Sources Frontend',
    repo: 'content-services/content-sources-frontend',
    ref: 'main',
    path: 'docs',
    readme: true,
    dest: 'content-sources-frontend',
    order: 2,
    rename: {
      // A README is the index of the directory it sits in, so publish it as
      // one rather than as a page called "readme".
      'rules/README.md': 'rules/index.md',
      'skills/README.md': 'skills/index.md',
      'skills/kit/SKILL.md': 'skills/kit/index.md',
    },
  },
  {
    id: 'patchman-engine',
    label: 'Patchman Engine',
    repo: 'RedHatInsights/patchman-engine',
    ref: 'master',
    // The repository's docs/ also holds generated OpenAPI JSON and Go sources;
    // the prose lives one level down.
    path: 'docs/md',
    readme: true,
    dest: 'patchman-engine',
    order: 3,
  },
  {
    id: 'patchman-ui',
    label: 'Patchman UI',
    repo: 'RedHatInsights/patchman-ui',
    ref: 'master',
    path: 'docs',
    readme: true,
    dest: 'patchman-ui',
    order: 4,
    rename: {
      'rules/README.md': 'rules/index.md',
    },
  },
];

export default sources;
