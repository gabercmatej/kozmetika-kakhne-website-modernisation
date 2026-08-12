/**
 * Builds content/products.json, categories.json and filters.json from the live
 * kozmetikakahne.com site. Everything written here is real published data:
 * names, prices, volumes, copy, INCI lists, badges and cross-sells.
 *
 * The skin-type / concern / age tags are not exposed as data anywhere, so they
 * are derived by asking the site's own filter endpoint which products come back
 * for each filter value, then inverting that into per-product tags.
 *
 * Run: npm run data:catalog
 */
import { writeFile, mkdir } from "node:fs/promises";
import { get, searchProducts } from "./lib/fetch.mjs";
import { parseProductCards, parseProductPage, clean } from "./lib/parse.mjs";

const CATEGORIES = [
  { slug: "best-sellerji-in-predlogi-za-specificne-potrebe-koze", label: "Best sellerji", short: "Best sellerji" },
  { slug: "izdelki-za-ciscenje-koze", label: "Izdelki za čiščenje kože", short: "Čiščenje" },
  { slug: "podlage-ali-osrecevalci", label: "Podlage ali osrečevalci", short: "Podlage" },
  { slug: "podlage-za-nanos-pred-kremo", label: "Podlage za nanos pred kremo", short: "Podlage pred kremo" },
  { slug: "kreme-in-olja-za-obraz", label: "Kreme in olja za obraz", short: "Kreme in olja" },
  { slug: "testna-potovalna-pakiranja-darilni-boni-darilna-embalaza", label: "Testna in potovalna pakiranja, darilni boni", short: "Darila in mini" },
  { slug: "darilna-pakiranja-potovalna-pakiranja-in-testerji", label: "Darilna pakiranja in testerji", short: "Darilna pakiranja" },
];

const SKIN_TYPES = [
  { value: "suha", label: "Suha" },
  { value: "obcutljiva", label: "Občutljiva" },
  { value: "normalna", label: "Normalna" },
  { value: "mesana", label: "Mešana" },
  { value: "problematicna", label: "Problematična" },
  { value: "mastna", label: "Mastna" },
];

const SKIN_CONCERNS = [
  { value: "pigmentni-madezi", label: "Pigmentni madeži" },
  { value: "podocnjaki", label: "Podočnjaki" },
  { value: "povesene-veke", label: "Povešene veke" },
  { value: "gube", label: "Gube" },
  { value: "akne", label: "Akne" },
  { value: "rdecica", label: "Rdečica" },
];

const AGES = [
  { value: "20_35", label: "20-35 let" },
  { value: "36_55", label: "36-55 let" },
  { value: "56_70", label: "56-70 let" },
  { value: "70_more", label: "Več kot 70 let" },
];

const log = (...a) => console.log("[catalog]", ...a);

/**
 * Sets, minis and single products need different card and page treatments.
 * Derived from the names the shop already uses, not invented taxonomy.
 */
function classifyKind(name = "", volume = "") {
  const n = name.toLowerCase();
  if (/^mini\b|mini /.test(n)) return "mini";
  if (/darilni bon/.test(n)) return "voucher";
  if (/\bset\b|komplet|paket|pakiranje|duo|trio|rutina|koktejl|zaščitnik|zascitnik/.test(n)) return "set";
  if (/vrečka|vrecka|torbic/.test(n)) return "accessory";
  if (volume && /\+/.test(volume)) return "set";
  return "single";
}

async function main() {
  await mkdir(new URL("../content/", import.meta.url), { recursive: true });

  // 1. Full catalogue baseline.
  log("fetching full catalogue");
  const baseCards = parseProductCards(await searchProducts({ category: "all" }));
  const bySlug = new Map();
  for (const c of baseCards) bySlug.set(c.slug, { ...c, categories: [], tipKoze: [], stanjeKoze: [], starost: [] });
  log(`${bySlug.size} unique products`);

  // 2. Category membership.
  for (const cat of CATEGORIES) {
    const cards = parseProductCards(await searchProducts({ category: cat.slug }));
    if (cards.length === baseCards.length) {
      log(`  ! ${cat.slug} returned the full catalogue, skipping as unfiltered`);
      continue;
    }
    for (const c of cards) bySlug.get(c.slug)?.categories.push(cat.slug);
    log(`  category ${cat.slug}: ${cards.length}`);
  }

  // 3. Derive the filter tag map from the site's own filter endpoint.
  const dimensions = [
    ["tipKoze", SKIN_TYPES, (v) => ({ types: [v] })],
    ["stanjeKoze", SKIN_CONCERNS, (v) => ({ status: [v] })],
    ["starost", AGES, (v) => ({ years: [v] })],
  ];
  for (const [key, options, toQuery] of dimensions) {
    for (const opt of options) {
      const cards = parseProductCards(await searchProducts({ category: "all", ...toQuery(opt.value) }));
      if (cards.length === baseCards.length) {
        log(`  ! ${key}=${opt.value} matched everything, treating as untagged`);
        continue;
      }
      for (const c of cards) bySlug.get(c.slug)?.[key].push(opt.value);
      log(`  ${key}=${opt.value}: ${cards.length}`);
    }
  }

  // 4. Per-product detail pages.
  const products = [];
  const slugs = [...bySlug.keys()];
  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const card = bySlug.get(slug);
    try {
      const html = await get(`/produkt/${encodeURIComponent(slug)}`);
      const d = parseProductPage(html, slug);
      const inciSection = d.sections.find((s) => /sestavin/i.test(s.title));

      products.push({
        slug,
        sourceId: card.sourceId,
        name: clean(d.name || card.name),
        /* `price` is always what the shopper pays. When the shop has reduced
           an item, `listPrice` carries the struck-through original and
           `discountPercent` the figure it prints in its own badge. */
        price: d.price ?? card.price,
        listPrice: d.listPrice ?? card.listPrice ?? null,
        discountPercent: d.discountPercent ?? card.discountPercent ?? null,
        badge: card.badge || d.badge || null,
        volume: d.volume,
        stock: d.stock,
        inStock: !/ni na zalogi|razprodano/i.test(d.stock || ""),
        kind: classifyKind(d.name || card.name, d.volume),
        categories: card.categories,
        tipKoze: card.tipKoze,
        stanjeKoze: card.stanjeKoze,
        starost: card.starost,
        lead: d.short.lead,
        benefits: d.short.bullets,
        intro: d.short.paragraphs,
        crossSell: d.crossSell.filter((s) => bySlug.has(s)).slice(0, 8),
        related: d.related.filter((s) => bySlug.has(s)).slice(0, 8),
        inci: d.inci || (inciSection ? inciSection.text : null),
        sections: d.sections
          .filter((s) => !/sestavin/i.test(s.title))
          .map((s) => ({ title: s.title, html: s.html })),
        seo: {
          title: d.metaTitle,
          description: d.metaDescription,
          keywords: d.keywords,
        },
        listImage: card.image,
        gallery: d.gallery.length ? d.gallery : card.image ? [card.image.replace("/small-", "/large-")] : [],
      });
      if ((i + 1) % 10 === 0) log(`  detail ${i + 1}/${slugs.length}`);
    } catch (err) {
      log(`  ! failed ${slug}: ${err.message}`);
    }
  }

  const filters = {
    tipKoze: SKIN_TYPES,
    stanjeKoze: SKIN_CONCERNS,
    starost: AGES,
  };

  const out = new URL("../content/", import.meta.url);
  await writeFile(new URL("products.json", out), JSON.stringify(products, null, 2));
  await writeFile(new URL("categories.json", out), JSON.stringify(CATEGORIES, null, 2));
  await writeFile(new URL("filters.json", out), JSON.stringify(filters, null, 2));
  log(`wrote ${products.length} products`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
