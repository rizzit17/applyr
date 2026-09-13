import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// Table for CRC32 calculation
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(4 + 4 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const crcTarget = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  buf.writeUInt32BE(crc32(crcTarget), 8 + len);
  return buf;
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: 13 bytes
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Raw scanlines: width * 4 bytes + 1 filter byte per line
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData.writeUInt8(r, offset++);
      rawData.writeUInt8(g, offset++);
      rawData.writeUInt8(b, offset++);
      rawData.writeUInt8(a, offset++);
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Icon design: Rounded modern gradient square with an 'A' or bolt emblem
function drawIconPixel(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const radius = w * 0.44;
  const cornerRadius = w * 0.22;

  // Check rounded rect boundaries
  const dx = Math.abs(x - cx);
  const dy = Math.abs(y - cy);
  const maxD = radius;
  const cornerDist = Math.hypot(Math.max(0, dx - (maxD - cornerRadius)), Math.max(0, dy - (maxD - cornerRadius)));
  if (cornerDist > cornerRadius) {
    return [0, 0, 0, 0]; // Transparent outside rounded squircle
  }

  // Gradient: Indigo to Violet (#4F46E5 -> #7C3AED)
  const grad = (x + y) / (w + h);
  const r = Math.round(79 * (1 - grad) + 124 * grad);
  const g = Math.round(70 * (1 - grad) + 58 * grad);
  const b = Math.round(229 * (1 - grad) + 237 * grad);

  // Lightning / Autofill bolt in center (white with slight opacity)
  const nx = (x - w * 0.25) / (w * 0.5); // 0 to 1 in center box
  const ny = (y - h * 0.2) / (h * 0.6);

  let isEmblem = false;
  if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
    // Upper triangle of bolt
    if (ny < 0.55 && nx > 0.35 - ny * 0.2 && nx < 0.85 - ny * 0.35) isEmblem = true;
    // Lower triangle of bolt
    if (ny >= 0.45 && nx > 0.15 + (1 - ny) * 0.3 && nx < 0.65 + (1 - ny) * 0.2) isEmblem = true;
  }

  if (isEmblem) {
    return [255, 255, 255, 255]; // Crisp white emblem
  }

  return [r, g, b, 255];
}

const iconsDir = path.resolve('public', 'icons');
fs.mkdirSync(iconsDir, { recursive: true });

const sizes = [16, 48, 128];
for (const size of sizes) {
  const buf = createPng(size, size, drawIconPixel);
  const filePath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(filePath, buf);
  console.log(`Generated ${filePath} (${buf.length} bytes)`);
}
console.log('All icons generated successfully.');
