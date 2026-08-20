// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';

// This file is evaluated before Vite's env plugin runs, and import.meta.env.MODE
// is unreliable here (withastro/astro#6241). Parse --mode ourselves and load the
// matching .env file explicitly.
const flag = process.argv.indexOf('--mode');
const mode = flag !== -1 ? process.argv[flag + 1] : 'production';
const env = loadEnv(mode, process.cwd(), '');

// Defaults are production, so a bare `astro build` with no .env still produces
// a correct site rather than a subtly broken one.
const SITE = (env.PUBLIC_SITE_URL || 'https://gufo-games.labyrainth.com').replace(/\/+$/, '');
const BASE = env.SITE_BASE || '/';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  // Astro's HTML compression is separate from Vite's asset minification;
  // cat turns off both so the deployed output is readable end to end.
  compressHTML: env.MINIFY !== 'false',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'it', 'es', 'pt', 'fr', 'de', 'ru', 'ja', 'zh'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // feedback stays unlisted (one-way page); demo routes are review-only
      filter: (page) => !page.includes('/feedback') && !page.includes('/demo'),
    }),
  ],
  vite: {
    build: {
      // cat ships unminified so the deployed output is readable when debugging
      minify: env.MINIFY !== 'false',
    },
  },
});
