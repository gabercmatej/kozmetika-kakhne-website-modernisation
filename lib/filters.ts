import type { Product } from "./types";
import { filterGroups, optionLabel } from "./products";
import { fold } from "./utils";

export type SortKey = "priporoceno" | "cena-nizja" | "cena-visja" | "ime";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "priporoceno", label: "Priporočeno" },
  { value: "cena-nizja", label: "Cena: naraščajoče" },
  { value: "cena-visja", label: "Cena: padajoče" },
  { value: "ime", label: "Ime: A do Ž" },
];

export type FilterState = {
  /** Kept as `category` so existing kozmetikakahne.com links keep working. */
  category: string | null;
  tip: string[];
  stanje: string[];
  starost: string[];
  zaloga: boolean;
  q: string | null;
  sort: SortKey;
};

export const EMPTY_FILTERS: FilterState = {
  category: null,
  tip: [],
  stanje: [],
  starost: [],
  zaloga: false,
  q: null,
  sort: "priporoceno",
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined): string | null =>
  (Array.isArray(v) ? v[0] : v)?.trim() || null;

const list = (v: string | string[] | undefined, allowed: Set<string>): string[] => {
  const raw = first(v);
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => allowed.has(s));
};

const ALLOWED = {
  tip: new Set(filterGroups.tipKoze.map((o) => o.value)),
  stanje: new Set(filterGroups.stanjeKoze.map((o) => o.value)),
  starost: new Set(filterGroups.starost.map((o) => o.value)),
};

export function parseFilters(params: RawParams): FilterState {
  const sortRaw = first(params.sort) as SortKey | null;
  const category = first(params.category);
  return {
    category: category && category !== "all" ? category : null,
    tip: list(params.tip, ALLOWED.tip),
    stanje: list(params.stanje, ALLOWED.stanje),
    starost: list(params.starost, ALLOWED.starost),
    zaloga: first(params.zaloga) === "1",
    q: first(params.q),
    sort: SORT_OPTIONS.some((o) => o.value === sortRaw) ? (sortRaw as SortKey) : "priporoceno",
  };
}

/** Serialises to a stable, shareable query string. Defaults are omitted. */
export function serializeFilters(state: FilterState): string {
  const p = new URLSearchParams();
  if (state.category) p.set("category", state.category);
  if (state.tip.length) p.set("tip", state.tip.join(","));
  if (state.stanje.length) p.set("stanje", state.stanje.join(","));
  if (state.starost.length) p.set("starost", state.starost.join(","));
  if (state.zaloga) p.set("zaloga", "1");
  if (state.q) p.set("q", state.q);
  if (state.sort !== "priporoceno") p.set("sort", state.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * `base` exists because the listing is served from two routes. `/znizano` is
 * the same view over a pre-filtered set, and touching a filter there must keep
 * the visitor on that route rather than dropping them into the full catalogue.
 */
export const filterHref = (state: FilterState, base = "/produkti") =>
  `${base}${serializeFilters(state)}`;

export const activeFilterCount = (state: FilterState): number =>
  state.tip.length + state.stanje.length + state.starost.length + (state.zaloga ? 1 : 0);

export function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

function matchesQuery(product: Product, query: string): boolean {
  const q = fold(query);
  if (!q) return true;
  const haystack = [
    product.name,
    product.lead ?? "",
    product.volume ?? "",
    product.inci ?? "",
    ...product.benefits,
    ...product.tipKoze.map((v) => optionLabel("tipKoze", v)),
    ...product.stanjeKoze.map((v) => optionLabel("stanjeKoze", v)),
  ]
    .map(fold)
    .join(" ");
  return q.split(/\s+/).every((token) => haystack.includes(token));
}

export function applyFilters(all: Product[], state: FilterState): Product[] {
  const result = all.filter((p) => {
    if (state.category && !p.categories.includes(state.category)) return false;
    if (state.tip.length && !state.tip.every((v) => p.tipKoze.includes(v))) return false;
    if (state.stanje.length && !state.stanje.every((v) => p.stanjeKoze.includes(v))) return false;
    if (state.starost.length && !state.starost.some((v) => p.starost.includes(v))) return false;
    if (state.zaloga && !p.inStock) return false;
    if (state.q && !matchesQuery(p, state.q)) return false;
    return true;
  });

  switch (state.sort) {
    case "cena-nizja":
      return result.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    case "cena-visja":
      return result.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    case "ime":
      return result.sort((a, b) => a.name.localeCompare(b.name, "sl"));
    default:
      /* Recommended: badged and in-stock products first, then the rest. */
      return result.sort((a, b) => score(b) - score(a));
  }
}

const score = (p: Product): number => {
  let s = 0;
  if (p.badge === "Prodajna uspešnica") s += 6;
  if (p.badge === "Priporočajo strokovnjaki") s += 5;
  if (p.badge === "Novo") s += 4;
  if (p.inStock) s += 2;
  if (p.images.length > 1) s += 1;
  if (p.kind === "mini" || p.kind === "accessory") s -= 3;
  return s;
};

/** Human-readable chips for the active filters, with removal targets. */
export function activeChips(state: FilterState): { key: string; label: string; next: FilterState }[] {
  const chips: { key: string; label: string; next: FilterState }[] = [];

  for (const v of state.tip) {
    chips.push({
      key: `tip-${v}`,
      label: optionLabel("tipKoze", v),
      next: { ...state, tip: state.tip.filter((x) => x !== v) },
    });
  }
  for (const v of state.stanje) {
    chips.push({
      key: `stanje-${v}`,
      label: optionLabel("stanjeKoze", v),
      next: { ...state, stanje: state.stanje.filter((x) => x !== v) },
    });
  }
  for (const v of state.starost) {
    chips.push({
      key: `starost-${v}`,
      label: optionLabel("starost", v),
      next: { ...state, starost: state.starost.filter((x) => x !== v) },
    });
  }
  if (state.zaloga) {
    chips.push({ key: "zaloga", label: "Na zalogi", next: { ...state, zaloga: false } });
  }
  return chips;
}
