#!/usr/bin/env node
/**
 * Verifies that every internal link in the built site points at a page or file
 * that was actually generated.
 *
 * Remote documentation is rewritten by scripts/sync-docs.mjs, and upstream
 * repositories move files without warning, so this runs after `astro build` to
 * catch rewrites that no longer land anywhere.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { base } from '../site.config.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

if (!fs.existsSync(DIST)) {
  console.error('check-links: dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const files = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(full);
  }
})(DIST);

const present = new Set(
  files.map((file) => `/${path.relative(DIST, file).split(path.sep).join('/')}`),
);

const htmlFiles = files.filter((file) => file.endsWith('.html'));
const prefix = base || '';
const broken = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    if (!raw.startsWith('/')) continue;
    if (raw.startsWith('//')) continue;
    if (prefix && !raw.startsWith(`${prefix}/`)) {
      broken.push({ file, link: raw, reason: `missing base path "${prefix}"` });
      continue;
    }

    const target = (prefix ? raw.slice(prefix.length) : raw).split(/[#?]/)[0];
    if (target === '' || target === '/') continue;

    const candidates = target.endsWith('/')
      ? [`${target}index.html`]
      : [target, `${target}/index.html`];

    if (!candidates.some((candidate) => present.has(candidate))) {
      broken.push({ file, link: raw, reason: 'no such page or file' });
    }
  }
}

console.log(`check-links: scanned ${htmlFiles.length} pages`);

if (broken.length > 0) {
  console.error(`\ncheck-links: ${broken.length} broken internal link(s):\n`);
  for (const entry of broken) {
    console.error(`  ${path.relative(DIST, entry.file)}\n    -> ${entry.link} (${entry.reason})`);
  }
  process.exit(1);
}

console.log('check-links: all internal links resolve');
