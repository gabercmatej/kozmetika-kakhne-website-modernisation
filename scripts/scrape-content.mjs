/**
 * Pulls the editorial, informational and legal content from the live site into
 * content/articles.json, content/advice.json and content/pages.json.
 *
 * Legal copy is carried over verbatim. Nothing here is rewritten or invented.
 *
 * Run: npm run data:content
 */
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { get, getBuffer } from "./lib/fetch.mjs";
import { cheerio, clean, sanitizeHtml } from "./lib/parse.mjs";

const log = (...a) => console.log("[content]", ...a);

const PAGES = [
  { slug: "kozmeticna-hisa-kahne", title: "Kozmetika Kahne" },
  { slug: "vizija-in-poslanstvo", title: "Vizija in poslanstvo" },
  { slug: "o-izdelkih", title: "O izdelkih" },
  { slug: "partnerji", title: "Partnerji" },
  { slug: "kartica-zvestobe", title: "Kartica zvestobe" },
  { slug: "vodstvo", title: "Vodstvo" },
  { slug: "kontakt", title: "Kontakt" },
  { slug: "splosni-pogoji", title: "Splošni pogoji poslovanja" },
  { slug: "politika-zasebnosti", title: "Politika zasebnosti" },
  { slug: "nagradne-igre", title: "Nagradne igre" },
  { slug: "prirocnik/nega-koze", title: "Priročnik za nego kože" },
  { slug: "prirocnik/navodila-za-uporabo", title: "Navodila za uporabo" },
  { slug: "apartmaji", title: "Apartmaji" },
];

/** Download one editorial image into /public/vsebina and return its metadata. */
async function localiseImage(src, name) {
  if (!src) return null;
  const dir = fileURLToPath(new URL("../public/vsebina/", import.meta.url));
  await mkdir(dir, { recursive: true });
  const outFile = `${dir}/${name}.webp`;
  const publicPath = `/vsebina/${name}.webp`;
  try {
    if (existsSync(outFile)) {
      const meta = await sharp(outFile).metadata();
      return { src: publicPath, width: meta.width, height: meta.height };
    }
    const buf = await getBuffer(src);
    const info = await sharp(buf)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 82 })
      .toFile(outFile);
    return { src: publicPath, width: info.width, height: info.height };
  } catch (err) {
    log(`  ! image ${name}: ${err.message}`);
    return null;
  }
}

function pageMeta($) {
  const meta = (n) =>
    $(`meta[property="${n}"]`).attr("content") || $(`meta[name="${n}"]`).attr("content") || null;
  return {
    title: $("title").text().trim() || null,
    description: meta("description") || meta("og:description"),
  };
}

async function scrapeAdvice() {
  const $ = cheerio.load(await get("/nasveti-strokovnjakov"));
  const items = [];
  $("#faq > .card").each((i, el) => {
    const $c = $(el);
    const question = clean($c.find(".btn-header-link").first().text());
    const answerHtml = sanitizeHtml($, $c.find(".card-body").first().html());
    const answerText = clean($c.find(".card-body").first().text());
    if (!question || !answerHtml) return;
    items.push({
      id: `nasvet-${i + 1}`,
      question,
      answerHtml,
      words: answerText.split(/\s+/).length,
      readingMinutes: Math.max(1, Math.round(answerText.split(/\s+/).length / 200)),
    });
  });
  log(`advice: ${items.length} questions`);
  return { items, meta: pageMeta($) };
}

async function scrapeArticles() {
  const listing = cheerio.load(await get("/aktualno"));
  const slugs = [
    ...new Set(
      listing("a[href*='/novica/']")
        .map((_, el) => {
          const m = (listing(el).attr("href") || "").match(/\/novica\/([^/?#]+)/);
          return m ? decodeURIComponent(m[1]) : null;
        })
        .get()
        .filter(Boolean)
    ),
  ];

  const articles = [];
  for (const slug of slugs) {
    try {
      const $ = cheerio.load(await get(`/novica/${encodeURIComponent(slug)}`));
      const $c = $(".news_content").first();
      const additional = $c
        .find("ul.additional li")
        .map((_, el) => clean($(el).text()))
        .get();
      const date = additional.find((t) => /\d{1,2}\.\d{1,2}\.\d{4}/.test(t)) || null;
      const readingRaw = additional.find((t) => /minut branja/i.test(t)) || "";
      // "Št. minut branja: 0.5" - anchor on the colon so the period in "Št."
      // is not read as the start of the number.
      const readingMatch = readingRaw.match(/branja:\s*([\d]+(?:[.,][\d]+)?)/i);
      const bodyText = clean($c.find(".text").first().text());
      const published = date && !/^0?1\.0?1\.1970$/.test(date) ? date : null;

      articles.push({
        slug,
        title: clean($c.find("h1").first().text()) || null,
        date: published,
        readingMinutes: readingMatch
          ? Math.max(1, Math.round(Number(readingMatch[1].replace(",", "."))))
          : Math.max(1, Math.round(bodyText.split(/\s+/).length / 200)),
        image: await localiseImage($c.find(".img_box img").first().attr("src"), `novica-${slug}`),
        excerpt: bodyText.slice(0, 220).trim(),
        bodyHtml: sanitizeHtml($, $c.find(".text").first().html()),
        seo: pageMeta($),
      });
    } catch (err) {
      log(`  ! article ${slug}: ${err.message}`);
    }
  }
  log(`articles: ${articles.length}`);
  return articles;
}

async function scrapePages() {
  const pages = [];
  for (const page of PAGES) {
    try {
      const $ = cheerio.load(await get(`/${page.slug}`));
      const $text = $(".text").first();
      const bodyHtml = sanitizeHtml($, $text.html());
      if (!bodyHtml) {
        log(`  ! ${page.slug}: no .text block`);
        continue;
      }
      pages.push({
        slug: page.slug,
        title: clean($("h1").first().text()) || page.title,
        bodyHtml,
        image: await localiseImage(
          $(".img_box img").first().attr("src"),
          `stran-${page.slug.replace(/\//g, "-")}`
        ),
        seo: pageMeta($),
      });
    } catch (err) {
      log(`  ! page ${page.slug}: ${err.message}`);
    }
  }
  log(`pages: ${pages.length}`);
  return pages;
}

async function main() {
  const out = new URL("../content/", import.meta.url);
  await mkdir(out, { recursive: true });

  const advice = await scrapeAdvice();
  const articles = await scrapeArticles();
  const pages = await scrapePages();

  await writeFile(new URL("advice.json", out), JSON.stringify(advice, null, 2));
  await writeFile(new URL("articles.json", out), JSON.stringify(articles, null, 2));
  await writeFile(new URL("pages.json", out), JSON.stringify(pages, null, 2));
  log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
