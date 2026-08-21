/**
 * Refuses to build while a preview server is serving dist/.
 *
 * On Windows the running server holds file handles inside dist/, so Astro's
 * clean step hits EPERM. It has been observed to fail *partially* — the HTML
 * is rewritten with fresh hashed image names while some image variants are
 * never emitted, producing 404s that every local check passes because the
 * browser still has the old files cached. Fail loudly instead.
 */
import { createConnection } from 'node:net';

const PORTS = [4321, 4322];

const inUse = (port) =>
  new Promise((resolve) => {
    const sock = createConnection({ port, host: '127.0.0.1' });
    const done = (v) => { sock.destroy(); resolve(v); };
    sock.setTimeout(400);
    sock.on('connect', () => done(true));
    sock.on('timeout', () => done(false));
    sock.on('error', () => done(false));
  });

const busy = (await Promise.all(PORTS.map(async (p) => ((await inUse(p)) ? p : null)))).filter(Boolean);

if (busy.length) {
  console.error(
    `\nBuild blocked: a dev/preview server is still listening on ${busy.join(', ')}.\n` +
      `On Windows it locks files in dist/ and the image pipeline emits an incomplete set,\n` +
      `which ships as 404s. Stop the preview (preview_stop) and build again.\n`
  );
  process.exit(1);
}
