/**
 * Builds the Starlight sidebar from the sync manifest.
 *
 * Starlight's own `autogenerate` labels a nested group with the raw directory
 * name, which leaves headings like "tasking-system" in the navigation. Because
 * the sync already records every page's title, slug and directory, the sidebar
 * can be assembled here with readable group labels instead.
 *
 * Falls back to `autogenerate` when the manifest is missing, so `astro build`
 * still works before a sync has run.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = path.join(ROOT, 'src', 'generated', 'sources.json');

/** Words that should keep their conventional casing in a group label. */
const ACRONYMS = new Map(
  ['api', 'cli', 'css', 'sql', 'ui', 'ux', 'db', 'rbac', 'http', 'yaml', 'json', 'rpm']
    .map((word) => [word, word.toUpperCase()]),
);

export function buildSidebar(sources) {
  const ordered = [...sources].sort(
    (a, b) => (a.order ?? 100) - (b.order ?? 100) || a.label.localeCompare(b.label),
  );

  const manifest = readManifest();
  if (!manifest) {
    return ordered.map((source) => ({
      label: source.label,
      collapsed: source.collapsed ?? false,
      items: [{ autogenerate: { directory: source.dest ?? source.id } }],
    }));
  }

  const byId = new Map(manifest.sources.map((record) => [record.id, record]));

  // A source with no synced pages is skipped: Starlight rejects an empty group.
  return ordered.flatMap((source) => {
    const record = byId.get(source.id);
    if (!record?.pages?.length) return [];
    return [{
      label: source.label,
      collapsed: source.collapsed ?? false,
      items: buildTree(record.pages, source),
    }];
  });
}

function readManifest() {
  try {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    return Array.isArray(manifest?.sources) ? manifest : null;
  } catch {
    return null;
  }
}

/** Nest pages under a group per directory, preserving the manifest's order. */
function buildTree(pages, source) {
  const root = { children: new Map(), items: [] };

  pages.forEach((page, rank) => {
    let node = root;
    const trail = [];

    for (const segment of page.dir ?? []) {
      trail.push(segment);
      const key = trail.join('/');
      if (!node.children.has(segment)) {
        node.children.set(segment, {
          label: source.groups?.[key] ?? humanise(segment),
          children: new Map(),
          items: [],
          rank: Number.MAX_SAFE_INTEGER,
        });
      }
      node = node.children.get(segment);
      node.rank = Math.min(node.rank, rank);
    }

    node.items.push({ label: page.title, link: `/${page.slug}/`, rank });
  });

  return flatten(root);
}

/**
 * Groups and pages share one ordering, taken from the manifest: a group sits
 * where its earliest page sits, so a source's `pages` order controls the shape
 * of the whole tree rather than just the top level.
 */
function flatten(node) {
  const groups = [...node.children.values()].map((child) => ({
    label: child.label,
    rank: child.rank,
    items: flatten(child),
  }));

  return [...node.items, ...groups]
    .sort((a, b) => a.rank - b.rank)
    .map(({ rank, ...entry }) => entry);
}

function humanise(segment) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => ACRONYMS.get(word) ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
