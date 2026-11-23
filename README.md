# mehmetcan.io

# Local development

Create a new post by running the script:

```bash
npm run create-post
```

The script creates a Markdown (`.md`) post in `src/content/posts/`. It requires a
title and description, deduplicates tags, safely escapes frontmatter values, and
refuses to overwrite an existing post with the same slug.

Pass `--mdx` to create an `.mdx` post instead, which is required if the post
needs to import components:

```bash
npm run create-post -- --mdx
```

In order to run locally:

```bash
npm run build
npm run preview
```

For some reason `npm run dev` runs too slow, because it tries to load all the logos we import for social media share buttons.

# TODO list

[x] Create tags

[x] Create comment functionality. Think of introducing utterances or giscus, where you setup a repo for comments and they are being posted automatically

[x] Create an RSS feed.

[x] Show tags and the RSS feed link at the right-hand side of the project.

[x] Make code blocks better: Add a copy button

[x] Make code blocks better: Add line numbers
