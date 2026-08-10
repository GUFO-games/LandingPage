/**
 * Builds public/og.png (1200x630) from owned assets: a darkened gameplay still,
 * the studio logo, and the LABYRAINTH wordmark with the AI pair in magenta.
 * Run manually when the art changes: node scripts/make-og.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;

const overlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#05030a" stop-opacity="0.62"/>
      <stop offset="55%" stop-color="#05030a" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#05030a" stop-opacity="0.95"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.5" cy="0.1" r="0.75">
      <stop offset="0%" stop-color="#3b0f5e" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#3b0f5e" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <rect width="${W}" height="${H}" fill="url(#bloom)"/>

  <text x="86" y="300" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="118" font-weight="700"
        letter-spacing="6" fill="#f2eefc">LABYR<tspan fill="#ff2975">AI</tspan>NTH</text>

  <text x="90" y="360" font-family="Consolas, Menlo, monospace" font-size="23" letter-spacing="5.5" fill="#22d3ee">
    STEAM EARLY ACCESS · BOOMER SHOOTER · ROGUELITE
  </text>

  <text x="90" y="437" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="27" fill="#d6cdea">
    Navigate procedurally generated alien labyrinths. Survive. Escape.
  </text>

  <rect x="86" y="500" width="286" height="62" rx="31" fill="#ff2975"/>
  <text x="229" y="540" text-anchor="middle" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="22"
        font-weight="700" letter-spacing="2.4" fill="#14030d">PLAY ON STEAM</text>

  <text x="1006" y="538" text-anchor="end" font-family="Segoe UI, Arial, Helvetica, sans-serif" font-size="21"
        font-weight="700" letter-spacing="3.4" fill="#a99cc9">G.U.F.O. GAMES</text>
</svg>`;

const logo = await sharp(join(root, 'src/assets/GUFO.png')).resize(78, 78, { fit: 'contain' }).png().toBuffer();

await sharp(join(root, 'src/assets/screenshots/ImmagineProvaAlienWorld.png'))
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .modulate({ brightness: 0.52, saturation: 1.15 })
  .composite([
    { input: Buffer.from(overlay), top: 0, left: 0 },
    { input: logo, top: 483, left: 1030 },
  ])
  .png({ quality: 90 })
  .toFile(join(root, 'public/og.png'));

console.log('public/og.png written');
