/**
 * Generates icon-192.png and icon-512.png from the Architect sprite.
 * Run once: node scripts/build-icons.js
 * No npm packages required — uses only Node built-ins (zlib, fs).
 */
import zlib from 'zlib';
import fs   from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT  = path.join(ROOT, 'icons');
fs.mkdirSync(OUT, { recursive: true });

// ── CRC32 ────────────────────────────────────────────────────────────────────
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  CRC_TABLE[i] = c;
}
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (const b of buf) crc = CRC_TABLE[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ── PNG encoder (RGBA) ───────────────────────────────────────────────────────
function pngChunk(type, data) {
  const tb  = Buffer.from(type);
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([len, tb, data, crc]);
}

function makePNG(w, h, getPixel) {
  // Build raw scanlines: filter_byte(0) + RGBA per pixel
  const raw = Buffer.alloc(h * (1 + w * 4));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 4)] = 0;          // filter: None
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = getPixel(x, y);
      const i = y * (1 + w * 4) + 1 + x * 4;
      raw[i] = r; raw[i+1] = g; raw[i+2] = b; raw[i+3] = a;
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 });
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),  // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

// ── Sprite data ──────────────────────────────────────────────────────────────
const SPRITE = [
  "....#..#....",
  "...######...",
  "..########..",
  "..#......#..",
  ".##########.",
  ".##########.",
  ".##########.",
  "############",
  "..########..",
  "..########..",
  "...######...",
  "...######..."
];

// ── Pixel renderer ───────────────────────────────────────────────────────────
const SHELL  = [139, 127, 168, 255]; // #8B7FA8  device purple
const BEZEL  = [ 70,  62,  94, 255]; // #463E5E  screen bezel
const SCREEN = [ 31,  36,  33, 255]; // #1F2421  screen bg
const INK    = [232, 163,  61, 255]; // #E8A33D  sprite amber
const CLEAR  = [  0,   0,   0,   0]; // transparent

function inRR(px, py, rx, ry, rw, rh, r) {
  if (px < rx || px >= rx + rw || py < ry || py >= ry + rh) return false;
  const cx = px - rx, cy = py - ry;
  if (cx < r    && cy < r   ) return Math.hypot(cx - r,      cy - r)      <= r;
  if (cx >= rw-r && cy < r  ) return Math.hypot(cx - (rw-r), cy - r)      <= r;
  if (cx < r    && cy >= rh-r) return Math.hypot(cx - r,      cy - (rh-r)) <= r;
  if (cx >= rw-r && cy >= rh-r) return Math.hypot(cx - (rw-r), cy - (rh-r)) <= r;
  return true;
}

function makeIconPixel(size) {
  const outerR  = Math.round(size * 0.208);  // ~40 @ 192
  const bezX    = Math.round(size * 0.146);  // ~28
  const bezW    = size - bezX * 2;
  const bezR    = Math.round(size * 0.094);  // ~18
  const scrX    = Math.round(size * 0.188);  // ~36
  const scrW    = size - scrX * 2;
  const scrR    = Math.round(size * 0.063);  // ~12
  const cellSz  = Math.floor(scrW * 0.74 / 12);
  const sprPx   = cellSz * 12;
  const sprX    = scrX + Math.floor((scrW - sprPx) / 2);
  const sprY    = scrX + Math.floor((scrW - sprPx) / 2);

  return (px, py) => {
    // Sprite pixels
    const sx = px - sprX, sy = py - sprY;
    if (sx >= 0 && sy >= 0 && sx < sprPx && sy < sprPx) {
      const col = Math.floor(sx / cellSz);
      const row = Math.floor(sy / cellSz);
      if (row < 12 && col < 12 && SPRITE[row][col] === '#') return INK;
    }
    // Screen
    if (inRR(px, py, scrX, scrX, scrW, scrW, scrR)) return SCREEN;
    // Bezel
    if (inRR(px, py, bezX, bezX, bezW, bezW, bezR)) return BEZEL;
    // Shell
    if (inRR(px, py, 0, 0, size, size, outerR)) return SHELL;
    return CLEAR;
  };
}

// ── Generate ─────────────────────────────────────────────────────────────────
for (const size of [192, 512]) {
  const buf  = makePNG(size, size, makeIconPixel(size));
  const file = path.join(OUT, `icon-${size}.png`);
  fs.writeFileSync(file, buf);
  console.log(`✓  icons/icon-${size}.png  (${(buf.length / 1024).toFixed(1)} KB)`);
}
console.log('Done. Icons saved to icons/');
