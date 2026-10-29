// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

import { sources } from './docs.sources.mjs';
import { buildSidebar } from './scripts/sidebar.mjs';
import { base, repositoryUrl, site, siteName } from './site.config.mjs';

// One sidebar group per remote source, nested to match each repository's own
// directory layout. See scripts/sidebar.mjs.
const remoteSections = buildSidebar(sources);

export default defineConfig({
  site,
  base: base || undefined,
  trailingSlash: 'always',
  integrations: [
    starlight({
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
      sidebar: remoteSections,
      expressiveCode: {
        // Line numbers are opt-in per block. The sync turns them on for code
        // embedded from a GitHub permalink, where the original line numbers
        // are the whole point of the reference.
        plugins: [pluginLineNumbers()],
        defaultProps: { showLineNumbers: false },
      },
      lastUpdated: true,
      pagination: true,
      credits: false,
      components: {
        // Shows which upstream repository a page came from.
        Footer: './src/components/Footer.astro',
      },
    }),
  ],
});
