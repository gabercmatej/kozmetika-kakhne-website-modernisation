/**
 * Scrapes the live homepage's campaign banners.
 *
 * The source stages each campaign as a `.single_header` block: a photograph on
 * the left as a CSS background, and a coloured panel on the right carrying the
 * headline, sub-line and call to action. Those photographs are the shop's own
 * campaign photography — the only lifestyle imagery it publishes that is not
 * tied to a single product — so the rebuilt hero uses them rather than
 * packshots lifted out of the catalogue.
 *
 * Only the image and the campaign's own words are kept. The hero writes its own
 * copy from catalogue data (see components/sections/hero.tsx); `title` and
 * `subtitle` are recorded here so a human can see what the shop was actually
 * promoting when a banner is matched to a slide.
 *
 * Idempotent: already-converted files are measured, not re-downloaded.
 *
 * Run: npm run data:banners
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { get, getBuffer } from "./lib/fetch.mjs";
import { cheerio, clean, slugFromUrl } from "./lib/parse.mjs";

const MAX_WIDTH = 1600;
const OUT_DIR = fileURLToPath(new URL("../public/kampanje/", import.meta.url));
const OUT_JSON = fileURLToPath(new URL("../content/banners.json", import.meta.url));
const log = (...a) => console.log("[banners]", ...a);

/** Slovenian letters fold to ASCII so filenames and keys stay URL-safe. */
const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[čć]/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/** The banner URL is inside an inline `background-image: url('…')` rule. */
const backgroundUrl = (style = "") => style.match(/url\(['"]?([^'")]+)['"]?\)/)?.[1] ?? null;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  log("fetching homepage");
  const $ = cheerio.load(await get("/"));

  const banners = [];
  const seen = new Set();

  for (const node of $(".single_header").toArray()) {
    const $block = $(node);
    const src = backgroundUrl($block.find(".left").attr("style") ?? "");
    const title = clean($block.find("h1").first().text());
    if (!src || !title) continue;

    /* The sub-line is authored as rich text inside the h3; its line breaks are
       presentational, so they collapse to single spaces. */
    const subtitle = clean($block.find("h3").first().text()) || null;

    const $cta = $block.find(".body a").first();
    const href = $cta.attr("href") ?? null;
    const cta = href
      ? { label: clean($cta.text()) || null, href: new URL(href).pathname }
      : null;

    let slug = slugify(title);
    if (!slug) slug = slugFromUrl(href ?? "") || `kampanja-${banners.length + 1}`;
    /* Two campaigns have shared a headline before; keep both addressable. */
    let unique = slug;
    for (let n = 2; seen.has(unique); n++) unique = `${slug}-${n}`;
    seen.add(unique);

    banners.push({ slug: unique, source: src, title, subtitle, cta });
  }

  if (!banners.length) throw new Error("no .single_header banners found — markup changed?");
  log(`found ${banners.length} banners`);

  const records = [];
  for (const banner of banners) {
    const file = `${OUT_DIR}${banner.slug}.webp`;

    if (!existsSync(file)) {
      log(`downloading ${banner.slug}`);
      const buffer = await getBuffer(banner.source);
      await sharp(buffer)
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(file);
    }

    const { width, height } = await sharp(file).metadata();
    records.push({
      slug: banner.slug,
      src: `/kampanje/${banner.slug}.webp`,
      width,
      height,
      title: banner.title,
      subtitle: banner.subtitle,
      cta: banner.cta,
    });
    log(`  ${banner.slug}: ${width}×${height}`);
  }

  await writeFile(OUT_JSON, JSON.stringify(records, null, 2) + "\n");
  log(`wrote ${records.length} banners to content/banners.json`);
}

main().catch((err) => {
  console.error("[banners] failed:", err);
  process.exitCode = 1;
});