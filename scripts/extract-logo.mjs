// One-off: knock out the cream background of the new logo PNG and save as
// transparent PNG into src/assets/. Uses corner-pixel sampling + tolerance
// band so antialiased edges stay soft instead of jaggy.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const input = path.join(root, "generated-image (6).png");
const output = path.join(root, "src/assets/logo-schoch-cosmetic.png");

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

// Average the 4 corners → robust background sample
const corners = [
  [0, 0],
  [width - 1, 0],
  [0, height - 1],
  [width - 1, height - 1],
];
let bgR = 0, bgG = 0, bgB = 0;
for (const [x, y] of corners) {
  const i = (y * width + x) * channels;
  bgR += data[i];
  bgG += data[i + 1];
  bgB += data[i + 2];
}
bgR = Math.round(bgR / 4);
bgG = Math.round(bgG / 4);
bgB = Math.round(bgB / 4);

// Distance band: < lo  → fully transparent
//                > hi  → fully opaque
//                in between → linear alpha (soft antialiased edge)
const lo = 28;
const hi = 70;

for (let i = 0; i < data.length; i += channels) {
  const dr = data[i] - bgR;
  const dg = data[i + 1] - bgG;
  const db = data[i + 2] - bgB;
  const dist = Math.sqrt(dr * dr + dg * dg + db * db);
  let alpha;
  if (dist <= lo) alpha = 0;
  else if (dist >= hi) alpha = 255;
  else alpha = Math.round(((dist - lo) / (hi - lo)) * 255);
  data[i + 3] = alpha;
}

await sharp(data, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log(
  `wrote ${output}  (${width}×${height}, bg sample rgb(${bgR},${bgG},${bgB}))`
);
