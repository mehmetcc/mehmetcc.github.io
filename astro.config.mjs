// @ts-check
import { defineConfig } from 'astro/config';
import rehypePrettyCode from 'rehype-pretty-code';
import github from '@astrojs/github-pages';

// https://astro.build/config
export default defineConfig({
  site: 'https://mehmetcan.io',
  integrations: [github()],
  markdown: {
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: 'github-dark',
        keepBackground: false,
      }]
    ]
  }
});
