import { products } from "./products";
import type { Product } from "./types";
import { fold } from "./utils";

/**
 * The catalogue's INCI lists, turned inside out.
 *
 * Seventy-nine products publish a full ingredient declaration, and the shop
 * prints it on the product page and nowhere else. Read one product at a time it
 * answers only "what is in this?"; the question a shopper actually arrives with
 * is the inverse — "which of these contain X", or "which are free of it" — and
 * that one cannot be answered without opening all seventy-nine pages.
 *
 * So this module inverts the relation. Nothing is added: every name here was
 * published by the shop, and a product appears under an ingredient only because
 * its own declaration names it.
 *
 * The source strings are dirty in four specific ways, each handled below and
 * each verified against the real data rather than guessed at.
 */

/**
 * Sets declare their members' lists end to end, and the scrape lost the space
 * after each full stop: `…Potassium Sorbate.Hialuron serum: Aqua, …`. A period
 * followed by a capital is therefore a segment break, never a decimal point —
 * no INCI name in the catalogue contains one.
 */
const SEGMENT_BREAK = /\.(?=\s*[A-ZČŠŽ])|\.\s*$/;

/**
 * `Termalna meglica: Aqua, Glycerin…` — the member's name, not an ingredient.
 *
 * Applied to whole segments and again to each comma-separated part, because one
 * set punctuates the label with a comma of its own (`Vitamin E, vitaminsko
 * olje: Macadamia…`). That comma splits the label in two, so the segment-level
 * strip cannot see it and the tail arrives still wearing its prefix.
 */
const MEMBER_PREFIX = /^[^:,]{0,60}:\s*/;

/**
 * Sixteen products decline to list anything and say so in Slovenian ("Sestavine
 * lahko preverite pri vsakem posamičnem izdelku iz kompleta"). Dropped whole:
 * a sentence is not an ingredient, and half of one is worse.
 */
const PROSE =
  /\b(sestavin|preverit|izdelk|pakiranj|odvisn|komplet|lahko|posamez|navedene|originaln|izbor|glede|kmalu|voljo|povezav|prosimo|tukaj)/i;

/**
 * Two serums close their declaration with the shop's claim block — `Citric
 * Acid.0% DIŠAV, ALERGENOV, BARVIL, PARABENOV, SILIKONOV100% INOVATIVNOST,
 * KAKOVOST, ZADOVOLJSTVO`. Those are marketing lines, not ingredients, and
 * comma-separated they would otherwise enter the index as seven of them.
 *
 * The block always opens on a percentage and nothing above it ever contains
 * one, so the first `%` is where the declaration ends.
 */
const CLAIM_TAIL = /\d\s*%/;

/**
 * `1,2-Hexanediol` and `2-Bromo-2-Nitropropane-1,3-Diol` carry a comma inside
 * the name, so a plain split on commas shears them in half. Both halves of such
 * a break end and begin with a digit, which nothing else in the data does.
 */
const rejoinNumeric = (parts: string[]): string[] => {
  const out: string[] = [];
  for (const part of parts) {
    const prev = out[out.length - 1];
    if (prev && /\d$/.test(prev) && /^\d/.test(part)) out[out.length - 1] = `${prev},${part}`;
    else out.push(part);
  }
  return out;
};

/**
 * Stripping the source's markup glued words together at the seam
 * (`PropyleneGlycol`, `Prunus AmygdalusDulcis`). A lower-to-upper boundary is
 * always such a seam here — no INCI name in the catalogue capitalises mid-word.
 */
const unglue = (value: string): string =>
  value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([A-Za-z])\(/g, "$1 (");

/**
 * Repairs for four places where the source's own text is broken, each verified
 * against the string that produces it. Nothing here renames an ingredient into
 * something the shop does not print elsewhere in the catalogue — every target
 * is the spelling used by the majority of the products that declare it.
 */
const ALIASES = new Map<string, string>([
  /* `Sodim` and `Pottasium` are typed once each, against 45 and 21 correct
     spellings. Left alone they open a second row for an ingredient the index
     already lists, which is the one thing an index must not do. */
  ["sodimbenzoate", "Sodium Benzoate"],
  ["pottasiumsorbate", "Potassium Sorbate"],
  /* One mini cream puts a comma inside `Hydroxyethyl Acrylate/Sodium
     Acryloyldimethyl Taurate Copolymer`, halving it. Both halves resolve to
     the whole, which the other products spell correctly. */
  ["hydroxyethyl", "Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer"],
  [
    "acrylatesodiumacryloyldimethyltauratecopolymer",
    "Hydroxyethyl Acrylate/Sodium Acryloyldimethyl Taurate Copolymer",
  ],
  /* `Parfum (Fragrance)` on twelve products, bare `Fragrance` on twenty. One
     ingredient under two names; the fuller spelling carries both. */
  ["fragrance", "Parfum (Fragrance)"],
]);

/** Longest plausible name in the data is ~45 characters; beyond that is prose. */
const MAX_NAME = 60;

const cleanName = (raw: string): string | null => {
  const name = unglue(raw)
    .replace(/\s+/g, " ")
    .replace(/^[\s.;·•-]+|[\s.;:,·•]+$/g, "")
    .trim();
  if (!name || name.length > MAX_NAME) return null;
  if (PROSE.test(name)) return null;
  if (!/[A-Za-z]/.test(name)) return null;
  if (name.split(" ").length > 6) return null;
  return ALIASES.get(fold(name).replace(/[^a-z0-9]/g, "")) ?? name;
};

/**
 * Dedupe keys. Spaces and hyphens always go, because the source punctuates them
 * inconsistently (`1,2 Hexanediol` against `1,2-Hexanediol`, `PEG-75` against
 * `PEG 75`).
 *
 * A gloss in brackets needs both readings, and neither alone is enough:
 *
 * - `Aqua (Water)` is `Aqua` — the bracket is an aside, so it must be dropped.
 * - `Calendula Officinalis (Flower) Extract` is `Calendula Officinalis Flower
 *   Extract` — the bracket is part of the name, so it must be kept.
 *
 * So each name carries two keys and two entries merge when they agree on
 * *either*. Dropping only would split the calendula; keeping only would split
 * the water.
 */
const keysOf = (name: string): [string, string] => [
  fold(name.replace(/\([^)]*\)/g, " ")).replace(/[^a-z0-9]/g, ""),
  fold(name).replace(/[^a-z0-9]/g, ""),
];

const keyOf = (name: string): string => keysOf(name)[0];

/** Every ingredient a single product declares, in the order the shop prints it. */
export function productIngredients(product: Product): string[] {
  if (!product.inci) return [];

  const names: string[] = [];
  const seen = new Set<string>();

  const declaration = product.inci.split(CLAIM_TAIL)[0];

  for (const segment of declaration.split(SEGMENT_BREAK)) {
    if (!segment || PROSE.test(segment.replace(MEMBER_PREFIX, ""))) continue;

    /* Names taken from this segment alone, so a mid-segment label can retract
       the token before it without reaching into the previous member's list. */
    const inSegment: string[] = [];

    for (const raw of rejoinNumeric(segment.replace(MEMBER_PREFIX, "").split(","))) {
      /* A label split across a comma leaves its first half looking like an
         ingredient ("Vitamin E"). It is only knowable as a label once the
         colon turns up in the part after it, so that part retracts it. */
      const labelled = MEMBER_PREFIX.test(raw);
      if (labelled && inSegment.length) {
        const dropped = inSegment.pop();
        if (dropped) {
          seen.delete(keyOf(dropped));
          names.splice(names.lastIndexOf(dropped), 1);
        }
      }

      const name = cleanName(labelled ? raw.replace(MEMBER_PREFIX, "") : raw);
      if (!name) continue;
      const key = keyOf(name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      names.push(name);
      inSegment.push(name);
    }
  }

  return names;
}

export type IngredientEntry = {
  key: string;
  /** The spelling the shop uses most often for it. */
  name: string;
  /** Products whose own declaration names it, in catalogue order. */
  products: Product[];
};

/**
 * Every declared ingredient, most widely used first.
 *
 * Ordering by reach rather than alphabetically puts the range's actual base —
 * glycerin, the preservative system, hyaluronate — at the top, which is the
 * shape of the range a reader learns something from. Alphabetical order would
 * open on whichever acid happens to start with A.
 */
export function ingredientIndex(): IngredientEntry[] {
  type Group = { key: string; spellings: Map<string, number>; products: Product[] };

  const groups: Group[] = [];
  /* Both readings of every name point at the group, so a later spelling that
     agrees on either one lands in it rather than starting a rival row. */
  const byKey = new Map<string, Group>();

  for (const product of products) {
    for (const name of productIngredients(product)) {
      const [dropped, kept] = keysOf(name);
      let group = byKey.get(dropped) ?? byKey.get(kept);
      if (!group) {
        group = { key: dropped, spellings: new Map(), products: [] };
        groups.push(group);
      }
      byKey.set(dropped, group);
      byKey.set(kept, group);

      group.spellings.set(name, (group.spellings.get(name) ?? 0) + 1);
      /* A set repeats its members' lists, so the same product can reach one
         ingredient twice under two spellings. Count the product once. */
      if (!group.products.includes(product)) group.products.push(product);
    }
  }

  return groups
    .map((group) => ({
      key: group.key,
      /* Most frequent spelling wins; the longer one breaks a tie, so a name
         that is only ever written with its gloss keeps it. */
      name: [...group.spellings.entries()].sort(
        (a, b) => b[1] - a[1] || b[0].length - a[0].length
      )[0][0],
      products: group.products,
    }))
    .sort((a, b) => b.products.length - a.products.length || a.name.localeCompare(b.name, "sl"));
}

/** Products carrying a published declaration at all — the index's denominator. */
export const declaredProducts = (): Product[] => products.filter((p) => productIngredients(p).length > 0);
