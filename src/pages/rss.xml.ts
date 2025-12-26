import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { config } from "../config";

export async function GET(context) {
  const posts = await getCollection("posts");
  return rss({
    title: config.site.title,
    description: config.site.description,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/posts/${post.slug}`,
    })),
    customData: `<language>en-us</language>`,
  });
}
