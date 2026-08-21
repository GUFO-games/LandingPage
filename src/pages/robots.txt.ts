import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '../i18n';

// Was a static public/robots.txt with the sitemap URL hardcoded to
// gufo-games.github.io. Now generated, so cat and prod each advertise their own
// sitemap instead of one of them lying about the other.
//
// Doctrine: AI crawlers are allowed deliberately (launch-seo-checklist v1.1).
// The Feedback Center is NOT Disallow-ed - a disallow line would advertise the
// URL publicly AND stop crawlers from ever reading its noindex tag.
const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

export const GET: APIRoute = () =>
  new Response(
    `User-agent: *
Allow: /

# The Feedback Center is an unlisted route. It is crawlable so its noindex tag
# can be read, but it is never linked from the site and stays out of the sitemap.

Sitemap: ${SITE_ORIGIN}${base}sitemap-index.xml
`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
