/**
 * Single source of truth for this site's identity and deployed URL.
 *
 * `astro.config.mjs`, the footer, the landing page and `scripts/sync-docs.mjs`
 * all read from here, so rewritten cross-document links always agree with the
 * site's base path and the branding stays consistent.
 */

/** Display name, used for the site title and the browser tab. */
export const siteName = 'Content Overflow';

/** This site's own repository, as "owner/name". */
export const repository = 'johnelliott626/content-overflow';

/** Convenience link to the repository above. */
export const repositoryUrl = `https://github.com/${repository}`;

/**
 * GitHub Pages project sites are served from `https://<owner>.github.io/<repo>`,
 * so `base` must match the repository name. The deploy workflow overrides both
 * values from `actions/configure-pages`, which means a custom domain or a
 * repository rename needs no change here.
 */
export const site = process.env.SITE_URL ?? 'https://johnelliott626.github.io';

/** Always normalised to a leading slash and no trailing slash ('' for root). */
export const base = normaliseBase(process.env.BASE_PATH ?? `/${repository.split('/')[1]}`);

function normaliseBase(value) {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (trimmed === '' || trimmed === '/') return '';
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/** Join a site-root-relative path onto the base path. */
export function withBase(path) {
  return `${base}/${path.replace(/^\/+/, '')}`;
}
