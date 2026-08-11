/**
 * Raster -> SVG tracer for FLAT logo art (no glow, no blur).
 *
 * Why this exists: converting a neon/blurred logo export to SVG is hopeless —
 * the glow is a raster effect with no edge to follow, so autotracers smear it
 * into dozens of muddy blobs. The FLAT artwork has hard edges, so it traces
 * exactly; the neon is then re-applied in CSS, where it stays sharp at any size
 * and can be themed per locale/section.
 *
 *   node scripts/trace-logo.mjs <input.png> <output.svg> [--colors=2]
 *
 * Ink is split into colour groups (default 2) so an accent — the AI pair in the
 * LABYRAINTH wordmark — keeps its own path and can be recoloured from CSS.
 */
import sharp from 'sharp';
import potrace from 'potrace';
import { writeFileSync } from 'node:fs';
import { promisify } from 'node:util';

const args = process.argv.slice(2);
const [input, output] = args.filter((a) => !a.startsWith('--'));
const nColors = Number((args.find((a) => a.startsWith('--colors=')) || '--colors=2').split('=')[1]);

if (!input || !output) {
  console.error('usage: node scripts/trace-logo.mjs <input.png> <output.svg> [--colors=2]');
  process.exit(1);
}

const INK_LUMA_MAX = 170;   // below this = ink; excludes anti-aliased fringe
const ALPHA_MIN = 160;

// Upscaling before thresholding lets the source anti-aliasing act as sub-pixel
// edge information, so potrace lands smoother, straighter contours.
const SCALE = Number((args.find((a) => a.startsWith('--scale=')) || '--scale=3').split('=')[1]);
const meta = await sharp(input).metadata();
// Take dimensions from the decoded buffer: metadata() on a pipeline still
// reports the SOURCE size, which silently desyncs the pixel indexing.
const { data: raw, info } = await sharp(input)
  .trim()                                   // drop the flat border so the viewBox hugs the mark
  .resize({ width: Math.round(meta.width * SCALE), kernel: 'lanczos3' })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;

/* ---- dominant ink colours by histogram (AA pixels are rare, so they lose) ---- */
const hist = new Map();
for (let i = 0; i < raw.length; i += 4) {
  const [r, g, b, a] = [raw[i], raw[i + 1], raw[i + 2], raw[i + 3]];
  if (a < ALPHA_MIN) continue;
  if (0.299 * r + 0.587 * g + 0.114 * b > INK_LUMA_MAX) continue;
  const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);   // 4 bits/channel
  const e = hist.get(key) || { r: 0, g: 0, b: 0, n: 0 };
  e.r += r; e.g += g; e.b += b; e.n++;
  hist.set(key, e);
}
if (!hist.size) { console.error('no ink pixels found (is the art on a light background?)'); process.exit(1); }

const buckets = [...hist.values()]
  .map((e) => ({ r: (e.r / e.n) | 0, g: (e.g / e.n) | 0, b: (e.b / e.n) | 0, n: e.n }))
  .sort((a, b) => b.n - a.n);

const dist2 = (a, b) => (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
const centers = [];
for (const b of buckets) {
  if (centers.length >= nColors) break;
  if (centers.every((c) => dist2(c, b) > 70 * 70)) centers.push(b);   // keep them distinct
}
if (!centers.length) centers.push(buckets[0]);

/* ---- one binary mask per colour, then potrace it ---- */
const traceBuffer = promisify((buf, opts, cb) => potrace.trace(buf, opts, cb));
const groups = [];

for (const c of centers) {
  const mask = Buffer.alloc(W * H, 255);                     // white = background
  for (let p = 0, i = 0; i < raw.length; i += 4, p++) {
    const [r, g, b, a] = [raw[i], raw[i + 1], raw[i + 2], raw[i + 3]];
    if (a < ALPHA_MIN) continue;
    if (0.299 * r + 0.587 * g + 0.114 * b > INK_LUMA_MAX) continue;
    const px = { r, g, b };
    let nearest = 0;
    for (let k = 1; k < centers.length; k++) {
      if (dist2(px, centers[k]) < dist2(px, centers[nearest])) nearest = k;
    }
    if (centers[nearest] === c) mask[p] = 0;                 // black = ink
  }

  const png = await sharp(mask, { raw: { width: W, height: H, channels: 1 } }).png().toBuffer();
  const svg = await traceBuffer(png, {
    threshold: 128,
    turdSize: 6,        // drop specks
    alphaMax: 0.6,      // keep hard corners crisp; this art is angular
    optCurve: true,
    optTolerance: 0.2,
    color: '#000000',
    background: 'transparent',
  });

  // potrace emits 3 decimals. At this viewBox one unit is ~0.27 CSS px in the
  // hero, so rounding to integers is invisible and roughly halves the payload —
  // which matters because the mark is inlined into every page.
  const d = [...svg.matchAll(/ d="([^"]+)"/g)]
    .map((m) => m[1].replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n)))))
    .join(' ');
  if (!d.trim()) continue;
  const hex = '#' + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, '0')).join('');
  groups.push({ hex, d, weight: c.n });
}

groups.sort((a, b) => b.weight - a.weight);   // body colour first, accent paints on top

const body = groups
  .map((g, i) => `  <path class="mark-${i}" fill="${g.hex}" fill-rule="evenodd" d="${g.d}"/>`)
  .join('\n');

const svgOut = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img">\n${body}\n</svg>\n`;
writeFileSync(output, svgOut, 'utf8');

console.log(`traced ${input} -> ${output}`);
groups.forEach((g, i) => console.log(`  mark-${i}: ${g.hex}  (${g.weight} px, ${g.d.length} path chars)`));
