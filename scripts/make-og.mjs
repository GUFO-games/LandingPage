/**
 * Builds public/og.png (1200x630) from owned assets: a darkened gameplay still,
 * the studio logo, and the LABYRAINTH wordmark with the AI pair in magenta.
 *
 * Typography is rendered with resvg, which can load font files directly —
 * sharp/librsvg can only reach fonts installed on the machine, which is why an
 * earlier version fell back to Segoe UI.
 *
 * Run when the art or the copy changes: node scripts/make-og.mjs
 */
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
// resvg reads TTF/OTF only (woff/woff2 load silently but render nothing), so the
// OG card ships its own static cuts: Space Grotesk Bold for display/bold text,
// Inter variable (regular default) for the two body lines.
const fonts = [join(root, 'scripts/fonts/SpaceGrotesk-Bold.otf'), join(root, 'scripts/fonts/Inter.ttf')];
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

  <text x="86" y="302" font-family="Space Grotesk" font-size="112" font-weight="700"
        letter-spacing="2" fill="#f2eefc">LABYR<tspan fill="#ff2975">AI</tspan>NTH</text>

  <text x="90" y="356" font-family="Inter" font-size="20" font-weight="500"
        letter-spacing="5.2" fill="#22d3ee">STEAM EARLY ACCESS · BOOMER SHOOTER · ROGUELITE</text>

  <text x="90" y="434" font-family="Inter" font-size="26" font-weight="400" fill="#d6cdea">
    Navigate procedurally generated alien labyrinths. Survive. Escape.
  </text>

  <rect x="86" y="500" width="292" height="62" rx="31" fill="#ff2975"/>
  <text x="232" y="540" text-anchor="middle" font-family="Space Grotesk" font-size="21"
        font-weight="700" letter-spacing="2.2" fill="#14030d">PLAY ON STEAM</text>

  <text x="1006" y="538" text-anchor="end" font-family="Space Grotesk" font-size="20"
        font-weight="700" letter-spacing="3.2" fill="#a99cc9">G.U.F.O. GAMES</text>
</svg>`;

// Rasterise the typography layer with the real brand fonts.
const textLayer = new Resvg(overlay, {
  fitTo: { mode: 'width', value: W },
  font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: 'Inter' },
})
  .render()
  .asPng();

const logo = await sharp(join(root, 'src/assets/GUFO.png')).resize(78, 78, { fit: 'contain' }).png().toBuffer();

await sharp(join(root, 'src/assets/screenshots/ImmagineProvaAlienWorld.png'))
  .resize(W, H, { fit: 'cover', position: 'attention' })
  .modulate({ brightness: 0.52, saturation: 1.15 })
  .composite([
    { input: textLayer, top: 0, left: 0 },
    { input: logo, top: 483, left: 1030 },
  ])
  .png({ quality: 90 })
  .toFile(join(root, 'public/og.png'));

console.log('public/og.png written with Space Grotesk + Inter');

