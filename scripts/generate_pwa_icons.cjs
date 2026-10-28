const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure public directory exists
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Create crisp Brand SVG
const brandSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c0e12" />
      <stop offset="50%" stop-color="#14171d" />
      <stop offset="100%" stop-color="#090b0e" />
    </linearGradient>
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="45%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#fbbf24" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Dark Obsidian Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  <rect width="504" height="504" x="4" y="4" rx="108" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="2" />

  <!-- Outer Ambient Glow Ring -->
  <circle cx="256" cy="256" r="148" fill="none" stroke="url(#ringGrad)" stroke-width="14" opacity="0.25" filter="url(#glow)" />

  <!-- Core Orbit Ring -->
  <circle cx="256" cy="256" r="132" fill="none" stroke="url(#ringGrad)" stroke-width="10" stroke-dasharray="16 8" />

  <!-- Mission Control Core Orb -->
  <circle cx="256" cy="256" r="88" fill="#12151b" stroke="rgba(255,255,255,0.12)" stroke-width="3" />
  <circle cx="256" cy="256" r="54" fill="url(#ringGrad)" />

  <!-- Center Python Synapse Dot -->
  <circle cx="256" cy="256" r="22" fill="#ffffff" />
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), brandSvg, 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), brandSvg, 'utf8');

// Function to generate uncompressed standard RGBA PNG file
function generatePng(width, height, isMaskable = false) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth: 8
  ihdrData[9] = 6; // color type: 6 (RGBA)
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #0c0e12
      let r = 12;
      let g = 14;
      let b = 18;
      let a = 255;

      const innerRatio = dist / maxR;

      if (innerRatio < 0.2) {
        // Bright White Center
        r = 255; g = 255; b = 255; a = 255;
      } else if (innerRatio < 0.45) {
        // Rose-Coral Gradient
        r = 244; g = 63; b = 94; a = 255;
      } else if (innerRatio < 0.58) {
        // Dark Inner Void
        r = 18; g = 21; b = 27; a = 255;
      } else if (innerRatio >= 0.58 && innerRatio < 0.68) {
        // Indigo / Rose Ring
        r = 99; g = 102; b = 241; a = 255;
      } else if (!isMaskable && dist > maxR * 0.95) {
        // Rounded corners for non-maskable
        const cornerDist = Math.max(Math.abs(dx), Math.abs(dy));
        if (cornerDist > maxR * 0.96) {
          a = 0;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[i] = c;
    }
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Generate PWA Icon files
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePng(180, 180, false));

console.log('Successfully generated PWA icon assets: icon.svg, pwa-192x192.png, pwa-512x512.png, pwa-maskable-512x512.png, apple-touch-icon.png');
