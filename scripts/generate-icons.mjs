// Gera os icones PNG do PWA sem dependencias externas.
// Uso: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const BRAND_700 = [6, 95, 70];
const BRAND_800 = [2, 44, 34];
const BRAND_600 = [4, 120, 87];
const WHITE = [255, 255, 255];

function crc32(buffer) {
  let crc = ~0;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filtro none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function inRoundedRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const rx = Math.min(Math.max(x, x0 + r), x1 - r);
  const ry = Math.min(Math.max(y, y0 + r), y1 - r);
  if (x === rx && y === ry) return true;
  const dx = x - rx;
  const dy = y - ry;
  return dx * dx + dy * dy <= r * r;
}

function makeIcon(size, { maskable = false } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const bg = maskable ? BRAND_700 : BRAND_700;
  // Escala interna: icones maskable precisam de margem de seguranca.
  const scale = maskable ? 0.72 : 0.94;
  const cx = size / 2;
  const drawW = size * scale;

  const bodyX0 = cx - drawW * 0.36;
  const bodyX1 = cx + drawW * 0.36;
  const bodyY0 = size * 0.5 - drawW * 0.24;
  const bodyY1 = size * 0.5 + drawW * 0.26;

  const bumpX0 = cx - drawW * 0.14;
  const bumpX1 = cx + drawW * 0.14;
  const bumpY0 = bodyY0 - drawW * 0.1;
  const bumpY1 = bodyY0 + drawW * 0.02;

  const lensCx = cx;
  const lensCy = (bodyY0 + bodyY1) / 2;
  const lensR = drawW * 0.15;
  const lensInnerR = drawW * 0.07;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let color = bg;

      if (inRoundedRect(x, y, bodyX0, bodyY0, bodyX1, bodyY1, drawW * 0.06)) {
        color = WHITE;
      }
      if (inRoundedRect(x, y, bumpX0, bumpY0, bumpX1, bumpY1, drawW * 0.03)) {
        color = WHITE;
      }

      const dx = x - lensCx;
      const dy = y - lensCy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 <= lensR * lensR) color = BRAND_800;
      if (dist2 <= lensInnerR * lensInnerR) color = BRAND_600;

      const i = (y * size + x) * 4;
      rgba[i] = color[0];
      rgba[i + 1] = color[1];
      rgba[i + 2] = color[2];
      rgba[i + 3] = 255;
    }
  }

  return encodePng(size, size, rgba);
}

function write(relativePath, buffer) {
  const target = resolve(root, relativePath);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, buffer);
  console.log(`gerado: ${relativePath} (${buffer.length} bytes)`);
}

write("public/icons/icon-192.png", makeIcon(192));
write("public/icons/icon-512.png", makeIcon(512));
write("public/icons/icon-maskable-512.png", makeIcon(512, { maskable: true }));
write("public/icons/apple-touch-icon.png", makeIcon(180));
write("src/app/icon.png", makeIcon(512));
write("src/app/apple-icon.png", makeIcon(180));
