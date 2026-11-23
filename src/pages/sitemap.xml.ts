import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { config } from "../config";
import { tagToSlug } from "../utils/tags";

const encodePath = (path: string) =>
  path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

const toLastmod = (date: Date) => date.toISOString().split("T")[0];

export const GET: APIRoute = async () => {
  const posts = await getCollection("posts");
  const sortedPosts = [...posts].sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const postsPerPage = config.pagination.postsPerPage;
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);
  const latestPostDate = sortedPosts[0]?.data.pubDate ?? new Date();
  const siteLastmod = toLastmod(latestPostDate);

  // Collect all unique tags
  const tags = [...new Set(posts.flatMap((post) => post.data.tags || []))];

  const entries: { loc: string; lastmod: string }[] = [
    { loc: "/", lastmod: siteLastmod },
  ];

  // Add pagination pages for the index
  for (let i = 2; i <= totalPages; i++) {
    entries.push({ loc: `/${i}`, lastmod: siteLastmod });
  }

  // Add category index page
  entries.push({ loc: "/categories", lastmod: siteLastmod });

  // Add individual tag pages
  tags.forEach((tag) => {
    const tagPosts = sortedPosts.filter((post) =>
      post.data.tags?.includes(tag),
    );
    const tagLastmod = toLastmod(tagPosts[0]?.data.pubDate ?? latestPostDate);

    entries.push({
      loc: encodePath(`/categories/${tagToSlug(tag)}`),
      lastmod: tagLastmod,
    });

    const tagPages = Math.ceil(tagPosts.length / postsPerPage);
    for (let i = 2; i <= tagPages; i++) {
      entries.push({
        loc: encodePath(`/categories/${tagToSlug(tag)}/${i}`),
        lastmod: tagLastmod,
      });
    }
  });

  // Add post URLs
  sortedPosts.forEach((post) => {
    entries.push({
      loc: encodePath(`/posts/${post.slug}`),
      lastmod: toLastmod(post.data.pubDate),
    });
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${config.site.url}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${loc === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
