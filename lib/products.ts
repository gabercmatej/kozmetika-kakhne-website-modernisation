import productsData from "@/content/products.json";
import categoriesData from "@/content/categories.json";
import filtersData from "@/content/filters.json";
import { ART_DIRECTION } from "./art-direction";
import type { Category, FilterGroups, FilterOption, Product } from "./types";
import { fold, seededPick } from "./utils";

/**
 * The hand-corrected framings from `lib/art-direction.ts` are folded in here,
 * once, rather than at each call site. Cards, galleries, the cart and the
 * search index all read `product.images`, and a photograph that is a packshot
 * in one of them is a packshot in all of them.
 *
 * Out-of-range positions are ignored rather than throwing. The table is
 * authored against a catalogue that is re-scraped, and a product losing a
 * photograph should cost that one override, not the page.
 */
const withArtDirection = (product: Product): Product => {
  const positions = ART_DIRECTION[product.slug]?.contain;
  if (!positions?.length) return product;

  const corrected = new Set(positions.map((n) => n - 1));
  return {
    ...product,
    images: product.images.map((image, i) =>
      corrected.has(i) ? { ...image, fit: "contain" as const } : image
    ),
  };
};

export const products = (productsData as Product[]).map(withArtDirection);

/** Two of the source category slugs are navigation aliases with no members. */
export const categories = (categoriesData as Category[]).filter((c) =>
  products.some((p) => p.categories.includes(c.slug))
);

export const filterGroups = filtersData as FilterGroups;

const bySlug = new Map(products.map((p) => [p.slug, p]));

export const getProduct = (slug: string): Product | undefined => bySlug.get(slug);

export const getProducts = (slugs: string[]): Product[] =>
  slugs.map((s) => bySlug.get(s)).filter((p): p is Product => Boolean(p));

export const getCategory = (slug: string): Category | undefined =>
  categories.find((c) => c.slug === slug);

export const optionLabel = (group: keyof FilterGroups, value: string): string =>
  filterGroups[group].find((o) => o.value === value)?.label ?? value;

/** Products that carry a real "Prodajna uspešnica" badge from the source. */
export const bestSellers = (limit = 8): Product[] =>
  products
    .filter((p) => p.badge === "Prodajna uspešnica" && p.inStock && p.price)
    .sort((a, b) => (b.images.length ? 1 : 0) - (a.images.length ? 1 : 0))
    .slice(0, limit);

export const newProducts = (limit = 4): Product[] =>
  products.filter((p) => p.badge === "Novo" && p.price).slice(0, limit);

export const expertPicks = (limit = 4): Product[] =>
  products.filter((p) => p.badge === "Priporočajo strokovnjaki" && p.price).slice(0, limit);

/**
 * The shop's real offers. Membership is not a tag we assign — a product is on
 * offer exactly when the source publishes a reduced price for it, so this list
 * always matches /akcijska-ponudba on the live site. Deepest cut first.
 */
export const discountedProducts = (limit?: number): Product[] => {
  const list = products
    .filter((p) => p.listPrice != null && p.price != null)
    .sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
  return limit ? list.slice(0, limit) : list;
};

export const isOnSale = (product: Product): boolean =>
  product.listPrice != null && product.price != null && product.listPrice > product.price;

/** Sets and routines, used by the routine section and the gifts navigation. */
export const routineSets = (limit = 6): Product[] =>
  products.filter((p) => p.kind === "set" && p.inStock && p.price).slice(0, limit);

export const productsByConcern = (concern: string, limit?: number): Product[] => {
  const list = products.filter((p) => p.stanjeKoze.includes(concern) && p.price);
  return limit ? list.slice(0, limit) : list;
};

/**
 * Related products for a detail page. The source's own "Odlično v kombinaciji"
 * list comes first because it is editorial, then same-concern products fill in.
 */
export function relatedProducts(product: Product, limit = 4): Product[] {
  const picked = new Map<string, Product>();

  for (const slug of product.crossSell) {
    const p = bySlug.get(slug);
    if (p && p.slug !== product.slug && p.price) picked.set(p.slug, p);
    if (picked.size >= limit) return [...picked.values()];
  }

  const sameConcern = products.filter(
    (p) =>
      p.slug !== product.slug &&
      p.price &&
      p.inStock &&
      !picked.has(p.slug) &&
      p.stanjeKoze.some((c) => product.stanjeKoze.includes(c))
  );
  for (const p of seededPick(sameConcern, limit, product.slug.length * 31)) {
    picked.set(p.slug, p);
    if (picked.size >= limit) break;
  }

  return [...picked.values()].slice(0, limit);
}

/**
 * A set lists its contents as benefit bullets on the source, in the form
 * "Hialuron serum (50 ml)". Resolve those back to real catalogue entries so
 * the detail page can show what is actually inside.
 */
export function setContents(product: Product): { product: Product; note: string }[] {
  if (product.kind !== "set") return [];
  const out: { product: Product; note: string }[] = [];

  for (const line of product.benefits) {
    const label = fold(line.replace(/\(.*?\)/g, ""));
    if (label.length < 5) continue;
    const match = products.find((p) => {
      if (p.slug === product.slug || p.kind === "set") return false;
      const name = fold(p.name);
      return label.includes(name) || name.includes(label.replace(/[^a-z0-9 ]/g, "").trim());
    });
    const sizeMatch = line.match(/\(([^)]*m[lg][^)]*)\)/i);
    if (match && !out.some((o) => o.product.slug === match.slug)) {
      out.push({ product: match, note: sizeMatch ? sizeMatch[1] : (match.volume ?? "") });
    }
  }
  return out;
}

/** Concern facets present on a product, as display-ready labels. */
export const concernLabels = (product: Product): string[] =>
  product.stanjeKoze.map((v) => optionLabel("stanjeKoze", v));

export const skinTypeLabels = (product: Product): string[] =>
  product.tipKoze.map((v) => optionLabel("tipKoze", v));

/**
 * Short "what it is for" line used on cards, derived from real tags.
 * Sentence case is applied here rather than with a `capitalize` utility,
 * which would also capitalise the conjunction ("Podočnjaki In Povešene Veke").
 */
export function purposeLine(product: Product): string {
  const sentence = (value: string) =>
    value.charAt(0).toLocaleUpperCase("sl") + value.slice(1);

  const concerns = concernLabels(product);
  if (concerns.length) {
    return sentence(concerns.slice(0, 2).join(" in ").toLocaleLowerCase("sl"));
  }
  const types = skinTypeLabels(product);
  if (types.length) {
    return sentence(`za ${types.slice(0, 2).join(" in ").toLocaleLowerCase("sl")} kožo`);
  }
  return product.volume ?? "";
}

export const primaryImage = (product: Product) => product.images[0] ?? null;

/**
 * The frame a product card crossfades to when pointed at.
 *
 * The second photograph is the default because for most of the range it is
 * the lifestyle shot — the product in a hand, on a shelf, in use. Where the
 * shop's gallery order buries the better frame further down, the product
 * names its own position in `lib/art-direction.ts`.
 *
 * Returns null rather than the packshot when a product has only one
 * photograph: crossfading an image to itself is a hover that does nothing.
 */
export function hoverImage(product: Product) {
  const chosen = ART_DIRECTION[product.slug]?.hover;
  const index = chosen != null && product.images[chosen - 1] ? chosen - 1 : 1;
  return product.images[index] ?? null;
}

/**
 * The shop writes a "Namigi za uporabo" block on almost every product page —
 * how much to use, in what order, how often. Scattered one product at a time it
 * is only ever read by someone already on that product; collected, it is the
 * instruction manual the handbook route needs, and every word of it is the
 * shop's own.
 *
 * Five of the eighty-two products carry no such block (gift wrap, vouchers and
 * the like). They are absent rather than padded out.
 */
const USAGE_TITLE = /namigi za uporabo/i;

export const usageHtml = (product: Product): string | null =>
  product.sections.find((s) => USAGE_TITLE.test(s.title))?.html ?? null;

export type UsageGroup = { category: Category; items: { product: Product; html: string }[] };

/**
 * Products with usage notes, grouped under the category each belongs to.
 *
 * A product can sit in several categories; it is listed under the first one it
 * matches so the manual never prints the same instructions twice. Categories
 * are walked in `categories` order, which is the shop's own — cleansers before
 * the layer that goes over them, creams last — so the grouping doubles as the
 * order the products are applied in.
 */
const plainText = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ");

export function usageByCategory(query?: string | null): UsageGroup[] {
  const needle = query ? fold(query.trim()) : "";
  const claimed = new Set<string>();

  return categories
    .map((category) => {
      const items = products
        .filter((p) => p.categories.includes(category.slug) && !claimed.has(p.slug))
        .map((product) => ({ product, html: usageHtml(product) }))
        .filter((entry): entry is { product: Product; html: string } => entry.html !== null);

      /* Claimed before the query is applied. Defensive rather than load-bearing
         against the current scrape, in which every product sits in exactly one
         category — but filtering first would let a product excluded from its own
         category reappear under the next one that lists it, which is the
         guarantee the claim set exists to make. */
      items.forEach((entry) => claimed.add(entry.product.slug));

      const shown = needle
        ? items.filter((entry) =>
            /* The instruction body is searched as well as the name: the shop
               writes "zjutraj" and "po čiščenju" in it, which is how somebody
               looks for the step rather than the bottle. */
            fold(`${entry.product.name} ${entry.product.volume ?? ""} ${plainText(entry.html)}`).includes(
              needle
            )
          )
        : items;

      return { category, items: shown };
    })
    .filter((group) => group.items.length > 0);
}

export type { Product, Category, FilterOption, FilterGroups };
