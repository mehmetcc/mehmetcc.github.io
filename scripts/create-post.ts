#!/usr/bin/env node
import * as readline from "node:readline/promises";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

interface PostData {
  title: string;
  description: string;
  pubDate: string;
  slug: string;
  timestamp: string;
}

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const POSTS_DIR = resolve(__dirname, "../src/content/posts");
const extension = process.argv.includes("--mdx") ? "mdx" : "md";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * YAML-native date format (YYYY-MM-DD)
 * Parses correctly into a Date object by Astro
 */
function formatPubDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function main(): Promise<void> {
  const title = (await rl.question("Enter blog title: ")).trim();
  const description = (await rl.question("Enter description: ")).trim();
  const tagsInput = await rl.question("Enter tags (comma-separated): ");
  const tags = [
    ...new Set(
      tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  ];

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");

  if (!title || !description || !slug) {
    console.error(
      "Title and description are required, and the title must contain at least one letter or number.",
    );
    process.exitCode = 1;
    rl.close();
    return;
  }

  const now = new Date();
  const pubDate = formatPubDate(now);

  const content = `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
pubDate: ${pubDate}
tags: [${tags.map((tag) => JSON.stringify(tag)).join(", ")}]
---
`;

  try {
    const filename = `${slug}.${extension}`;
    const filepath = `${POSTS_DIR}/${filename}`;

    if (existsSync(filepath)) {
      console.error(`Post already exists: ${filename}`);
      process.exitCode = 1;
      return;
    }

    mkdirSync(POSTS_DIR, { recursive: true });
    writeFileSync(filepath, content);
    console.log(`\nCreated post: ${filename}`);
  } catch (err) {
    console.error("Error creating post:", (err as Error).message);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
