// @ts-check
import { defineConfig } from 'astro/config';
import rehypePrettyCode from 'rehype-pretty-code';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://mehmetcc.github.io',
  markdown: {
    rehypePlugins: [
      [rehypePrettyCode, {
        theme: 'github-dark',
        keepBackground: false,
      }]
    ]
  }
});
