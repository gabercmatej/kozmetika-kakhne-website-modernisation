/**
 * The live site shows a rotating sample of customer opinions, so this polls
 * the homepage and product pages repeatedly and collects the unique ones.
 *
 * Two things worth knowing about this data:
 *  - There are no per-product ratings anywhere on the source site. The same
 *    site-wide block renders on every product page. Only the aggregate
 *    ("4,8" over "Preko 1200 mnenj") is real, so nothing here is attached
 *    to an individual product.
 *  - Some entries are customer enquiries rendered with five stars rather
 *    than testimonials. They are kept but flagged, and the storefront only
 *    presents the testimonial ones as reviews.
 *
 * Run: node scripts/scrape-reviews.mjs
 */
import { writeFile } from "node:fs/promises";
import { get } from "./lib/fetch.mjs";
import { cheerio, clean } from "./lib/parse.mjs";

const PATHS = [
  "/",
  "/produkt/hialuron-serum",
  "/produkt/krema-s-hialuronsko-kislino",
  "/produkt/dotox",
  "/produkt/naravno-mazilo-iz-morskih-alg",
  "/produkt/zlati-serum-z-argirelinom",
  "/kartica-zvestobe",
  "/aktualno",
];

const ROUNDS = 4;

/** An enquiry asks the company something; a testimonial reports an outcome. */
const looksLikeEnquiry = (text) =>
  /\?\s*$/.test(text.trim()) ||
  /\b(bi prosil|prosim za|lepo prosi|kdaj bo|ali lahko|zanima me|bi rada vedela|prosila bi)\b/i.test(text);

async function main() {
  const seen = new Map();
  for (let round = 0; round < ROUNDS; round++) {
    for (const path of PATHS) {
      try {
        const $ = cheerio.load(await get(path, { delay: 120 }));
        $(".opinion_card").each((_, el) => {
          const $c = $(el);
          const author = clean($c.find(".author").first().text());
          const stars = $c.find("ul.ratings li").length;
          const body = clean($c.clone().find(".author, ul.ratings").remove().end().text());
          if (!body || body.length < 20) return;
          const key = `${author}::${body.slice(0, 60)}`;
          if (!seen.has(key)) {
            seen.set(key, { author, stars, body, kind: looksLikeEnquiry(body) ? "enquiry" : "testimonial" });
          }
        });
      } catch {
        /* a single miss does not matter, the loop resamples */
      }
    }
    console.log(`[reviews] round ${round + 1}: ${seen.size} unique so far`);
  }

  const all = [...seen.values()];
  const payload = {
    aggregate: { rating: 4.8, countLabel: "Preko 1200 mnenj", countApprox: 1200 },
    reviews: all,
  };
  await writeFile(new URL("../content/reviews.json", import.meta.url), JSON.stringify(payload, null, 2));
  console.log(
    `[reviews] wrote ${all.length} (${all.filter((r) => r.kind === "testimonial").length} testimonials, ` +
      `${all.filter((r) => r.kind === "enquiry").length} enquiries)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
