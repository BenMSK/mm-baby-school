// Rasterize the page's baby-face SVG symbol into PNG icons (no dependencies).
// usage: node makeicon.js <outdir>
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const outDir = process.argv[2];

function hex(h){ return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)]; }
const BG = hex("#FFE7D9"), SKIN = hex("#FFD9C2"), HAIR = hex("#6B4A3A"), INK = hex("#3B2F3A"), CHEEK = hex("#FFB3B3");

// geometry in the symbol's 64-unit space, scaled 1.2x about the head centre so the face fills the icon
const S = 1.2;
function tx(x){ return (x - 32) * S + 32; }
function ty(y){ return (y - 34) * S + 32; }
function dist(ax, ay, bx, by){ return Math.hypot(ax - bx, ay - by); }
function cubic(p0, p1, p2, p3, t){ const u = 1 - t; return [u*u*u*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t*t*t*p3[0], u*u*u*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t*t*t*p3[1]]; }
function quad(p0, p1, p2, t){ const u = 1 - t; return [u*u*p0[0] + 2*u*t*p1[0] + t*t*p2[0], u*u*p0[1] + 2*u*t*p1[1] + t*t*p2[1]]; }
// hair: M31 14 c-1-6 4-8 8-5  -> P0(31,14) P1(30,8) P2(35,6) P3(39,9); smile: M27 45 q5 4 10 0 -> (27,45) (32,49) (37,45)
const hairPts = [], smilePts = [];
for (let i = 0; i <= 60; i++) { hairPts.push(cubic([31,14],[30,8],[35,6],[39,9], i/60)); smilePts.push(quad([27,45],[32,49],[37,45], i/60)); }
function nearPolyline(pts, x, y, r){ for (const p of pts) if (dist(tx(p[0]), ty(p[1]), x, y) <= r) return true; return false; }

function shade(x, y){ // x,y in 64-unit space; returns [r,g,b]
  let c = BG.slice();
  if (dist(tx(32), ty(35), x, y) <= 22 * S) c = SKIN.slice();
  if (nearPolyline(hairPts, x, y, 1.5 * S)) c = HAIR.slice();
  if (dist(tx(24), ty(36), x, y) <= 2.4 * S || dist(tx(40), ty(36), x, y) <= 2.4 * S) c = INK.slice();
  if (dist(tx(18), ty(42), x, y) <= 3.6 * S || dist(tx(46), ty(42), x, y) <= 3.6 * S) c = c.map((v, i) => Math.round(v * 0.15 + CHEEK[i] * 0.85));
  if (nearPolyline(smilePts, x, y, 1.0 * S)) c = INK.slice();
  return c;
}

function render(W){
  const SS = 4, rows = [];
  for (let py = 0; py < W; py++) {
    const row = Buffer.alloc(1 + W * 3); row[0] = 0;
    for (let px = 0; px < W; px++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = (px + (sx + 0.5) / SS) * 64 / W, y = (py + (sy + 0.5) / SS) * 64 / W;
        const c = shade(x, y); r += c[0]; g += c[1]; b += c[2];
      }
      const n = SS * SS; row[1 + px*3] = Math.round(r/n); row[2 + px*3] = Math.round(g/n); row[3 + px*3] = Math.round(b/n);
    }
    rows.push(row);
  }
  return png(W, W, Buffer.concat(rows));
}

const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf){ let c = 0xFFFFFFFF; for (const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function chunk(type, data){ const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, "ascii"), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function png(w, h, raw){
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

for (const [name, size] of [["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]]) {
  const file = path.join(outDir, name); fs.writeFileSync(file, render(size)); console.log(name, size + "px", fs.statSync(file).size, "bytes");
}
