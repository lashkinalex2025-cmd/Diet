/**
 * Generates PWA PNG icons from an embedded green "leaf/plate" design.
 * Run: node scripts/generate-icons.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');
const publicDir = path.join(__dirname, '..', 'public');

fs.mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1;
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b, a = 255] = paint(x, y, size);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function paintIcon(x, y, size, { maskable = false } = {}) {
  const n = (v) => v / size;
  const cx = 0.5;
  const cy = 0.43;
  const dx = n(x) - cx;
  const dy = n(y) - cy;
  const r = Math.sqrt(dx * dx + dy * dy);

  // Background
  const edge = maskable ? 0.5 : 0.42;
  const inRounded =
    maskable ||
    (Math.abs(n(x) - 0.5) < edge &&
      Math.abs(n(y) - 0.5) < edge &&
      !(Math.abs(n(x) - 0.5) > 0.32 && Math.abs(n(y) - 0.5) > 0.32 && rCorner(x, y, size) > 0.18));

  function rCorner(px, py, s) {
    const nx = Math.abs(px / s - 0.5) - 0.32;
    const ny = Math.abs(py / s - 0.5) - 0.32;
    if (nx < 0 || ny < 0) return 0;
    return Math.sqrt(nx * nx + ny * ny);
  }

  if (!inRounded && !maskable) {
    // Soft rounded square via distance
    const rx = Math.abs(n(x) - 0.5);
    const ry = Math.abs(n(y) - 0.5);
    const rr = 0.38;
    const cr = 0.12;
    const qx = Math.max(rx - (rr - cr), 0);
    const qy = Math.max(ry - (rr - cr), 0);
    if (Math.sqrt(qx * qx + qy * qy) > cr) return [0, 0, 0, 0];
  }

  // Gradient green background
  const t = n(x) * 0.5 + n(y) * 0.5;
  const br = Math.round(34 + t * 10);
  const bg = Math.round(197 - t * 40);
  const bb = Math.round(94 - t * 20);

  // Plate circle
  if (r < 0.18) return [254, 252, 232, 255];
  if (r < 0.2) return [220, 252, 231, 255];

  // Base arc (bowl)
  const bowlY = 0.68;
  const bowlDx = n(x) - 0.5;
  const bowlDy = n(y) - bowlY;
  if (bowlDy > -0.02 && bowlDy < 0.12 && Math.abs(bowlDx) < 0.22 - bowlDy * 0.4) {
    return [254, 252, 232, 255];
  }

  return [br, bg, bb, 255];
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  const png = createPng(size, (x, y, s) => paintIcon(x, y, s));
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
}

const maskable = createPng(512, (x, y, s) => paintIcon(x, y, s, { maskable: true }));
fs.writeFileSync(path.join(outDir, 'icon-512-maskable.png'), maskable);

const apple = createPng(180, (x, y, s) => paintIcon(x, y, s));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), apple);

console.log('Icons generated in public/icons and apple-touch-icon.png');
