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

const __dirname: string = fileURLToPath(new URL(".", import.meta.url));
const POSTS_DIR: string = resolve(__dirname, "../src/content/posts");

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

function formatPubDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}:${month}:${year}`;
}

async function main(): Promise<void> {
  const title: string = await rl.question("Enter blog title: ");
  const description: string = await rl.question("Enter description: ");

  const slug: string = title
    .toLowerCase()
    .replace(/[^\w\s]/gi, "")
    .replace(/\s+/g, "-");

  const currentDate = new Date();
  const pubDate: string = formatPubDate(currentDate);
  const timestamp: string = getCurrentTimestamp();

  const postData: PostData = {
    title,
    description,
    pubDate,
    slug,
    timestamp,
  };

  const content: string = `
---
title: "${postData.title}"
pubDate: ${postData.pubDate}
description: "${postData.description}"
---
`;

  try {
    mkdirSync(POSTS_DIR, { recursive: true });
    const filename = `${timestamp}_${slug}.md`;
    writeFileSync(`${POSTS_DIR}/${filename}`, content);
    console.log(`\nCreated post: ${filename}\n`);
    console.log(`File path: content/posts/${filename}`);
  } catch (err: unknown) {
    console.error("Error creating post:", (err as Error).message);
  } finally {
    rl.close();
  }
}

main();
