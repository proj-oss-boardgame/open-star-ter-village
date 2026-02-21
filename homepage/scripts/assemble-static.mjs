/**
 * Assembles a static site from Next.js SSG build output.
 *
 * Next.js with i18n + getStaticProps generates pre-rendered HTML for all locales
 * at build time. This script collects those files into a flat directory suitable
 * for static hosting on Cloudflare Pages.
 *
 * Output structure (in ./out/):
 *   /_next/static/...              — JS/CSS chunks
 *   /_next/data/{buildId}/ja.json  — client-side navigation data
 *   /ja/index.html                 — default locale pages
 *   /en/index.html                 — English pages
 *   /zh-Hant/index.html            — Traditional Chinese pages
 *   /images/...                    — public assets
 *   /_redirects                    — Cloudflare Pages redirect rules
 */

import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = "out";
const NEXT_DIR = ".next";
const PUBLIC_DIR = "public";
const PAGES_DIR = join(NEXT_DIR, "server", "pages");

const LOCALES = ["ja", "en", "zh-Hant"];
const DEFAULT_LOCALE = "ja";

// Clean and create output directory
if (existsSync(OUT_DIR)) {
  rmSync(OUT_DIR, { recursive: true });
}
mkdirSync(OUT_DIR, { recursive: true });

// 1. Copy public/ assets
cpSync(PUBLIC_DIR, OUT_DIR, { recursive: true });

// 2. Copy _next/static/
cpSync(join(NEXT_DIR, "static"), join(OUT_DIR, "_next", "static"), {
  recursive: true,
});

// 3. Copy locale HTML and JSON data files
for (const locale of LOCALES) {
  const localeDir = join(PAGES_DIR, locale);
  if (!existsSync(localeDir)) continue;

  const outLocaleDir = join(OUT_DIR, locale);
  mkdirSync(outLocaleDir, { recursive: true });

  // Copy all HTML and JSON files from locale directory
  const files = readdirSync(localeDir);
  for (const file of files) {
    if (file.endsWith(".html") || file.endsWith(".json")) {
      cpSync(join(localeDir, file), join(outLocaleDir, file));
    }
  }

  // Copy root-level locale index (e.g., ja.html -> ja/index.html)
  const localeIndex = join(PAGES_DIR, `${locale}.html`);
  if (existsSync(localeIndex)) {
    cpSync(localeIndex, join(outLocaleDir, "index.html"));
  }
  const localeJson = join(PAGES_DIR, `${locale}.json`);
  if (existsSync(localeJson)) {
    cpSync(localeJson, join(outLocaleDir, "index.json"));
  }
}

// 4. Copy _next/data/{buildId}/ (for client-side navigation JSON)
const buildIdFile = join(NEXT_DIR, "BUILD_ID");
if (existsSync(buildIdFile)) {
  const buildId = readFileSync(buildIdFile, "utf8").trim();
  const nextDataDir = join(OUT_DIR, "_next", "data", buildId);
  mkdirSync(nextDataDir, { recursive: true });

  for (const locale of LOCALES) {
    // Root locale JSON: /_next/data/{buildId}/ja.json (for index page)
    const rootJson = join(PAGES_DIR, `${locale}.json`);
    if (existsSync(rootJson)) {
      cpSync(rootJson, join(nextDataDir, `${locale}.json`));
    }

    // Sub-page JSONs: /_next/data/{buildId}/ja/cards.json etc.
    const localeDir = join(PAGES_DIR, locale);
    if (!existsSync(localeDir)) continue;

    const localeDataDir = join(nextDataDir, locale);
    mkdirSync(localeDataDir, { recursive: true });

    const files = readdirSync(localeDir);
    for (const file of files) {
      if (file.endsWith(".json")) {
        cpSync(join(localeDir, file), join(localeDataDir, file));
      }
    }
  }
}

// 5. Create _redirects for Cloudflare Pages
const redirects = `/ /${DEFAULT_LOCALE}/ 302
`;
writeFileSync(join(OUT_DIR, "_redirects"), redirects);

console.log("Static site assembled in ./out/");
