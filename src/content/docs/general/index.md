---
title: Overview
description: Documentation written in this repository.
sidebar:
  order: 1
---

Pages in this section are written in the Content Overflow repository and published with the rest of the site. The other sidebar sections are copied from their own repositories at build time.

## Adding a page

Create a Markdown file in `src/content/docs/general/`. The file name is the last part of the URL, and the sidebar label comes from the title.

```md
---
title: Writing guidelines
description: How pages in this section should be written.
---

Page content.
```

`writing-guidelines.md` is served at `/general/writing-guidelines/`. A folder of files becomes a nested sidebar group, and `index.md` inside that folder is its landing page.

Set `sidebar.order` to control where a page sits. Lower numbers come first. This page uses `1`, and a page without an order is listed after the ordered ones.

The sync script only replaces directories named by a remote source. Files added here stay in git.
