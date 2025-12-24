#!/usr/bin/env node
import * as readline from "node:readline/promises";
import { writeFileSync, mkdirSync } from "node:fs";
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function getCurrentTimestamp(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${day}${month}${year}_${hours}${minutes}${seconds}`;
}

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
  const title = await rl.question("Enter blog title: ");
  const description = await rl.question("Enter description: ");

  const slug = title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "-");

  const now = new Date();
  const pubDate = formatPubDate(now);
  const timestamp = getCurrentTimestamp();

  const content = `---
title: "${title}"
description: "${description}"
pubDate: ${pubDate}
---
`;

  try {
    mkdirSync(POSTS_DIR, { recursive: true });
    const filename = `${timestamp}_${slug}.md`;
    writeFileSync(`${POSTS_DIR}/${filename}`, content);
    console.log(`\nCreated post: ${filename}`);
  } catch (err) {
    console.error("Error creating post:", (err as Error).message);
  } finally {
    rl.close();
  }
}

main();