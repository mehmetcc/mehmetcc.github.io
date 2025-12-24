import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { config } from "../config";

export const GET: APIRoute = async () => {
  const posts = await getCollection("posts");
  const sortedPosts = posts.sort(
    (a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime(),
  );

  const postsPerPage = config.pagination.postsPerPage;
  const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

  // Generate URLs for all pages
  const urls: string[] = [config.site.url + "/"];

  // Add pagination pages
  for (let i = 2; i <= totalPages; i++) {
    urls.push(`${config.site.url}/${i}`);
  }

  // Add post URLs
  sortedPosts.forEach((post) => {
    urls.push(`${config.site.url}/posts/${post.slug}`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === config.site.url + "/" ? "1.0" : "0.8"}</priority>
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
