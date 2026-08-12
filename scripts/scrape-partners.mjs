/**
 * Scrapes the retail partners the shop lists on /partnerji.
 *
 * The source renders each partner as a `.single_shop` tile: the logo is a CSS
 * background on an `.img_box` div and the name is the `h3` beside it. Neither
 * carries a link — the live page is a plain list of where the range is stocked,
 * not a directory — so only the name and the logo are kept.
 *
 * The logos arrive as a mix of transparent PNG, JPEG and one .JPG, at wildly
 * different sizes. They are normalised onto a white ground at a common width so
 * a grid of them reads as one row of marks rather than a jumble; the alpha is
 * flattened deliberately, because a violet logo knocked out of a transparent
 * PNG would otherwise sit on the card's own tint and lose contrast.
 *
 * Idempotent: already-converted files are measured, not re-downloaded.
 *
 * Run: npm run data:partners
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { get, getBuffer } from "./lib/fetch.mjs";
import { cheerio, clean } from "./lib/parse.mjs";

const MAX_WIDTH = 480;
const OUT_DIR = fileURLToPath(new URL("../public/partnerji/", import.meta.url));
const OUT_JSON = fileURLToPath(new URL("../content/partners.json", import.meta.url));
const log = (...a) => console.log("[partners]", ...a);

/** Slovenian letters fold to ASCII so filenames and keys stay URL-safe. */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const backgroundUrl = (style = "") => style.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] ?? null;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  log("fetching /partnerji");
  const $ = cheerio.load(await get("/partnerji"));

  const partners = [];
  const seen = new Set();

  for (const node of $(".single_shop").toArray()) {
    const $tile = $(node);
    const name = clean($tile.find("h3").first().text());
    const source = backgroundUrl($tile.find(".img_box").attr("style") ?? "");
    if (!name || !source) continue;

    let slug = slugify(name) || `partner-${partners.length + 1}`;
    let unique = slug;
    for (let n = 2; seen.has(unique); n++) unique = `${slug}-${n}`;
    seen.add(unique);

    partners.push({ slug: unique, name, source });
  }

  if (!partners.length) throw new Error("no .single_shop tiles found — markup changed?");
  log(`found ${partners.length} partners`);

  const records = [];
  for (const partner of partners) {
    const file = `${OUT_DIR}${partner.slug}.webp`;

    if (!existsSync(file)) {
      log(`downloading ${partner.slug}`);
      /* The source URLs carry unencoded Slovenian characters in one filename
         (`small-TušDrogerija.jpeg`), which `fetch` rejects verbatim. */
      const buffer = await getBuffer(encodeURI(partner.source));
      await sharp(buffer)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .webp({ quality: 88 })
        .toFile(file);
    }

    const { width, height } = await sharp(file).metadata();
    records.push({
      slug: partner.slug,
      name: partner.name,
      src: `/partnerji/${partner.slug}.webp`,
      width,
      height,
    });
    log(`  ${partner.slug}: ${width}×${height}`);
  }

  await writeFile(OUT_JSON, JSON.stringify(records, null, 2) + "\n");
  log(`wrote ${records.length} partners to content/partners.json`);
}

main().catch((err) => {
  console.error("[partners] failed:", err);
  process.exitCode = 1;
});
