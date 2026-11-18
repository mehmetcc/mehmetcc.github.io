// @ts-check
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import mdx from "@astrojs/mdx";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// https://astro.build/config
export default defineConfig({
  site: "https://mehmetcan.io",
  integrations: [
    expressiveCode({
      themes: ["github-light"],
      styleOverrides: {
        borderRadius: "6px",
        borderColor: "#dee2e6",
        frames: {
          frameBoxShadowCssValue: "none",
        },
      },
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
});