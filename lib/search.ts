import { advice, articles } from "./content";
import { concernLabels, optionLabel, primaryImage, products, purposeLine } from "./products";
import { fold } from "./utils";

export type SearchEntry = {
  kind: "product" | "article" | "advice";
  slug: string;
  href: string;
  title: string;
  meta: string;
  price: number | null;
  /** Set only on a reduced product, so results show the offer as the shop does. */
  listPrice: number | null;
  image: string | null;
  /** Pre-folded haystack so the client does no normalisation work per keystroke. */
  terms: string;
};

/**
 * Built on the server and served from /api/iskanje, fetched by the search
 * dialog the first time it opens. Shipping it with every page added ~129 KB
 * to the payload of routes that may never open search.
 *
 * Term fields are capped: full INCI lists are the bulk of the weight and a
 * shopper searching an ingredient will type it early in the string anyway.
 */
const TERM_LIMIT = 600;

export function buildSearchIndex(): SearchEntry[] {
  const productEntries: SearchEntry[] = products.map((p) => ({
    kind: "product",
    slug: p.slug,
    href: `/produkt/${p.slug}`,
    title: p.name,
    meta: purposeLine(p) || p.volume || "",
    price: p.price,
    listPrice: p.listPrice,
    image: primaryImage(p)?.src ?? null,
    terms: fold(
      [
        p.name,
        p.lead ?? "",
        p.volume ?? "",
        ...concernLabels(p),
        ...p.tipKoze.map((v) => optionLabel("tipKoze", v)),
        p.kind === "set" ? "komplet set rutina paket" : "",
        p.kind === "mini" ? "mini potovalno testno" : "",
        ...p.benefits,
        p.inci ?? "",
      ].join(" ")
    ).slice(0, TERM_LIMIT),
  }));

  const articleEntries: SearchEntry[] = articles.map((a) => ({
    kind: "article",
    slug: a.slug,
    href: `/novica/${a.slug}`,
    title: a.title ?? a.slug,
    meta: a.readingMinutes ? `${a.readingMinutes} min branja` : "Aktualno",
    price: null,
    listPrice: null,
    image: a.image?.src ?? null,
    terms: fold([a.title ?? "", a.excerpt].join(" ")),
  }));

  const adviceEntries: SearchEntry[] = advice.map((a) => ({
    kind: "advice",
    slug: a.id,
    href: `/nasveti-strokovnjakov#${a.id}`,
    title: a.question,
    meta: "Nasvet strokovnjaka",
    price: null,
    listPrice: null,
    image: null,
    terms: fold(a.question),
  }));

  return [...productEntries, ...articleEntries, ...adviceEntries];
}

/**
 * Every token must appear somewhere. Results are ranked by where the match
 * lands: a title hit beats a hit buried in an ingredient list.
 */
export function searchIndex(index: SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const q = fold(query).trim();
  if (q.length < 2) return [];
  const tokens = q.split(/\s+/);

  const scored = index
    .map((entry) => {
      const title = fold(entry.title);
      if (!tokens.every((t) => entry.terms.includes(t))) return null;

      let score = 0;
      if (title.startsWith(q)) score += 100;
      else if (title.includes(q)) score += 60;
      if (tokens.every((t) => title.includes(t))) score += 30;
      if (entry.kind === "product") score += 12;
      if (entry.kind === "advice") score += 2;
      score -= Math.min(10, title.length / 12);
      return { entry, score };
    })
    .filter((r): r is { entry: SearchEntry; score: number } => r !== null)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((r) => r.entry);
}

/** Concern words a shopper is likely to type when they do not know a name. */
export const SEARCH_SUGGESTIONS: { label: string; href: string }[] = [
  { label: "Suha koža", href: "/produkti?tip=suha" },
  { label: "Gube", href: "/produkti?stanje=gube" },
  { label: "Akne", href: "/produkti?stanje=akne" },
  { label: "Pigmentni madeži", href: "/produkti?stanje=pigmentni-madezi" },
  { label: "Hialuron", href: "/produkti?q=hialuron" },
  { label: "Darilni seti", href: "/produkti?q=darilni" },
];
