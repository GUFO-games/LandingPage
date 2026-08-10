/**
 * Asset integrity gate: every local URL referenced by the built HTML must exist in dist/.
 * Catches the class of bug where an image variant is referenced but never emitted —
 * invisible locally with a warm cache, a 404 in production.
 * Run after `astro build`: node scripts/check-assets.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const BASE = '/LandingPage/';

const htmlFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith('.html')) htmlFiles.push(p);
  }
})(dist);

const refPattern = /(?:src|href)="([^"]+)"|url\(['"]?([^'")]+)['"]?\)|srcset="([^"]+)"/g;
const missing = new Map();
let checked = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const urls = new Set();

  for (const match of html.matchAll(refPattern)) {
    const raw = match[1] || match[2] || match[3];
    if (!raw) continue;
    // srcset carries several candidates: "a.webp 960w, b.webp 1920w"
    for (const part of raw.split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (!url || !url.startsWith(BASE)) continue; // skip external URLs and bare anchors
      urls.add(url.split('#')[0].split('?')[0]);
    }
  }

  for (const url of urls) {
    checked++;
    const rel = url.slice(BASE.length);
    if (existsSync(join(dist, rel)) || existsSync(join(dist, rel, 'index.html'))) continue;
    if (!missing.has(url)) missing.set(url, new Set());
    missing.get(url).add(file.replace(dist, '').replace(/\\/g, '/'));
  }
}

console.log(`checked ${checked} local references across ${htmlFiles.length} pages`);
if (missing.size) {
  console.error(`\nMISSING ${missing.size} asset(s):`);
  for (const [url, pages] of missing) {
    console.error(`  ${url}\n    referenced by: ${[...pages].slice(0, 4).join(', ')}`);
  }
  process.exit(1);
}
console.log('all referenced assets exist');
