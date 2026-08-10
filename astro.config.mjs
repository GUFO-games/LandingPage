// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://gufo-games.github.io',
  base: '/LandingPage',
  trailingSlash: 'always',
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
});
