/**
 * Downloads product photography from the live site and normalises it into
 * public/izdelki/<slug>/<n>.webp, recording intrinsic dimensions back into
 * content/products.json so next/image can reserve space (no layout shift).
 *
 * Idempotent: already-converted files are measured, not re-downloaded.
 *
 * Run: npm run data:images
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { getBuffer } from "./lib/fetch.mjs";

const MAX_WIDTH = 1400;
const MAX_PER_PRODUCT = 6;
const log = (...a) => console.log("[images]", ...a);

/**
 * The studio packshots ship with a very wide white border baked in, which
 * makes every product read small inside a card or gallery well. Trim the
 * white and re-add a consistent 6% margin so products fill their frame.
 *
 * Lifestyle photographs have no uniform border, so trim finds nothing to
 * remove and they pass through untouched. A guard rejects any trim that would
 * remove more than 70% of the frame, which would indicate a misdetection.
 */
async function tightenPackshot(buffer) {
  const original = sharp(buffer).rotate();
  const meta = await original.metadata();

  try {
    const { data, info } = await sharp(buffer)
      .rotate()
      .trim({ background: "#ffffff", threshold: 8 })
      .toBuffer({ resolveWithObject: true });

    const areaRatio = (info.width * info.height) / (meta.width * meta.height);
    const trimmedSomething = info.width < meta.width - 8 || info.height < meta.height - 8;

    if (!trimmedSomething || areaRatio < 0.3) return sharp(buffer).rotate();

    const margin = Math.round(Math.max(info.width, info.height) * 0.06);
    return sharp(data).extend({
      top: margin,
      bottom: margin,
      left: margin,
      right: margin,
      background: "#ffffff",
    });
  } catch {
    return sharp(buffer).rotate();
  }
}

/**
 * The catalogue mixes studio packshots on white with lifestyle photography.
 * They cannot share one CSS object-fit: cropping a packshot slices the bottle,
 * and letterboxing a lifestyle shot leaves bars. Classify once here so cards,
 * galleries and tiles can frame each image correctly.
 *
 * A packshot is detected by sampling the border: if the frame edge is
 * overwhelmingly near-white, the subject floats on a studio background.
 */
async function classifyFit(file) {
  const image = sharp(file);
  const { width, height } = await image.metadata();
  const band = Math.max(2, Math.round(Math.min(width, height) * 0.04));

  const strips = await Promise.all([
    sharp(file).extract({ left: 0, top: 0, width, height: band }).stats(),
    sharp(file).extract({ left: 0, top: height - band, width, height: band }).stats(),
    sharp(file).extract({ left: 0, top: 0, width: band, height }).stats(),
    sharp(file).extract({ left: width - band, top: 0, width: band, height }).stats(),
  ]);

  const channels = strips.flatMap((s) => s.channels.slice(0, 3));

  // Measured against the real catalogue. Channel spread is the reliable
  // signal: a neutral studio background spreads 1-7 across R/G/B, while
  // lifestyle borders carry skin, fabric or sea tones and spread 13-48.
  // Standard deviation is not usable on its own because compositions where
  // the product touches the frame push it as high as 50 on a white ground.
  const means = channels.map((c) => c.mean);
  const bright = Math.min(...means) > 200;
  const neutral = Math.max(...means) - Math.min(...means) < 12;

  return bright && neutral ? "contain" : "cover";
}

async function main() {
  const contentDir = new URL("../content/", import.meta.url);
  const products = JSON.parse(await readFile(new URL("products.json", contentDir), "utf8"));

  let downloaded = 0;
  let reused = 0;
  let failed = 0;

  for (const product of products) {
    const dirUrl = new URL(`../public/izdelki/${encodeURIComponent(product.slug)}/`, import.meta.url);
    const dir = fileURLToPath(dirUrl);
    await mkdir(dir, { recursive: true });

    const sources = [...new Set(product.gallery ?? [])].slice(0, MAX_PER_PRODUCT);
    const images = [];

    for (let i = 0; i < sources.length; i++) {
      const outFile = `${dir}/${i}.webp`;
      const publicPath = `/izdelki/${encodeURIComponent(product.slug)}/${i}.webp`;
      try {
        if (existsSync(outFile)) {
          const meta = await sharp(outFile).metadata();
          images.push({
            src: publicPath,
            width: meta.width,
            height: meta.height,
            fit: await classifyFit(outFile),
          });
          reused++;
          continue;
        }
        const buf = await getBuffer(sources[i]);
        const prepared = await tightenPackshot(buf);
        const info = await prepared
          .resize({ width: MAX_WIDTH, withoutEnlargement: true, fit: "inside" })
          .webp({ quality: 82 })
          .toFile(outFile);
        images.push({
          src: publicPath,
          width: info.width,
          height: info.height,
          fit: await classifyFit(outFile),
        });
        downloaded++;
      } catch (err) {
        failed++;
        log(`  ! ${product.slug} image ${i}: ${err.message}`);
      }
    }

    product.images = images;
  }

  await writeFile(new URL("products.json", contentDir), JSON.stringify(products, null, 2));
  const withImages = products.filter((p) => p.images.length).length;
  log(`downloaded ${downloaded}, reused ${reused}, failed ${failed}`);
  log(`${withImages}/${products.length} products have at least one image`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
