// Generates public/og-default.png (1200x630) — the social preview image.
// Run: node scripts/og-image.mjs
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const svg = await readFile(fileURLToPath(new URL('./og-image.svg', import.meta.url)), 'utf8');

const outDir = fileURLToPath(new URL('../public/', import.meta.url));
await mkdir(outDir, { recursive: true });
await writeFile(
  new URL('og-default.png', `file://${outDir}`),
  await sharp(Buffer.from(svg)).png().toBuffer(),
);

console.log('public/og-default.png written');
