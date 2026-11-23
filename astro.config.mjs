// @ts-check
import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import mdx from "@astrojs/mdx";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

// https://astro.build/config
export default defineConfig({
  site: "https://mehmetcan.io",
  redirects: {
    "/categories/Data Structures": "/categories/data-structures",
    "/categories/Bloom Filters": "/categories/bloom-filters",
  },
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark" ? '[data-theme="dark"]' : ":root",
      styleOverrides: {
        borderRadius: "6px",
        borderColor: "var(--color-gray-medium)",
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