// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import { sources } from './docs.sources.mjs';
import { buildSidebar } from './scripts/sidebar.mjs';
import { base, repositoryUrl, site, siteName } from './site.config.mjs';

import markdoc from '@astrojs/markdoc';

// General is authored in this repository. Remote groups come from the sync
// manifest and follow each repository's directory layout. See scripts/sidebar.mjs.
const remoteSections = buildSidebar(sources);

export default defineConfig({
  site,
  base: base || undefined,
  trailingSlash: 'always',
  integrations: [starlight({
    title: siteName,
    description: 'Documentation gathered from across the Content Services repositories.',
    favicon: '/favicon.svg',
    social: [
      {
        icon: 'github',
        label: 'GitHub',
        href: repositoryUrl,
      },
    ],
    sidebar: [
      {
        label: 'General',
        items: [{ autogenerate: { directory: 'general' } }],
      },
      ...remoteSections,
    ],
    lastUpdated: true,
    pagination: true,
    credits: false,
    components: {
      // Shows which upstream repository a page came from.
      Footer: './src/components/Footer.astro',
    },
  }), markdoc()],
});