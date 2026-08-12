import { products, productsByConcern } from "./products";
import type { Product } from "./types";

/**
 * Discovery entry points expressed the way customers describe their skin,
 * mapped onto the tags that already exist in the catalogue. The supporting
 * lines describe what the products address; they make no efficacy claims
 * beyond what the source site publishes.
 */
export type Concern = {
  value: string;
  label: string;
  blurb: string;
};

export const CONCERNS: Concern[] = [
  { value: "gube", label: "Gube", blurb: "Ciljna nega za izrazne in globlje gube." },
  { value: "pigmentni-madezi", label: "Pigmentni madeži", blurb: "Za bolj enakomerno polt." },
  { value: "akne", label: "Akne", blurb: "Za problematično kožo, nagnjeno k mozoljem." },
  { value: "rdecica", label: "Rdečica", blurb: "Pomirjanje občutljive, reaktivne kože." },
  { value: "podocnjaki", label: "Podočnjaki", blurb: "Nega tanke kože okrog oči." },
  { value: "povesene-veke", label: "Povešene veke", blurb: "Za čvrstost in tonus obočesnega predela." },
];

/**
 * Skin types, used as the second discovery axis. Kept separate from concerns
 * so the navigation does not mix "what my skin is" with "what bothers me".
 */
export const SKIN_TYPES: Concern[] = [
  { value: "suha", label: "Suha koža", blurb: "Vlaženje in obnova kožne bariere." },
  { value: "obcutljiva", label: "Občutljiva koža", blurb: "Brez dišav in barvil." },
  { value: "mesana", label: "Mešana koža", blurb: "Uravnoteženje T-predela." },
  { value: "mastna", label: "Mastna koža", blurb: "Lahke teksture brez mastnega filma." },
  { value: "problematicna", label: "Problematična koža", blurb: "Podpora pri mozoljih in nečistočah." },
  { value: "normalna", label: "Normalna koža", blurb: "Vzdrževanje in zaščita." },
];

export const concernCount = (value: string): number => productsByConcern(value).length;

export const skinTypeCount = (value: string): number =>
  products.filter((p) => p.tipKoze.includes(value)).length;

/** A representative product image for a concern tile, taken from the catalogue. */
export function concernImage(value: string, exclude: Set<string> = new Set()): Product | null {
  const candidates = productsByConcern(value).filter(
    (p) =>
      p.images.length > 0 &&
      p.inStock &&
      p.kind !== "mini" &&
      p.kind !== "accessory" &&
      !exclude.has(p.slug)
  );
  if (!candidates.length) return null;
  /* Editorial tiles are full-bleed, so lifestyle photography is preferred
     over a packshot that would be cropped into an abstract white field. */
  const lifestyle = candidates.find((p) => p.images[0]?.fit === "cover");
  const badged = candidates.find((p) => p.badge === "Prodajna uspešnica");
  return lifestyle ?? badged ?? candidates[0];
}

/**
 * Because most products carry several concern tags, picking independently
 * gives several tiles the same photograph. Assigning in one pass keeps each
 * tile visually distinct.
 */
export function concernTiles(): (Concern & { count: number; image: Product | null })[] {
  const used = new Set<string>();
  return CONCERNS.map((concern) => {
    const image = concernImage(concern.value, used);
    if (image) used.add(image.slug);
    return { ...concern, count: concernCount(concern.value), image };
  }).filter((t) => t.count > 0);
}

export const concernHref = (value: string) => `/produkti?stanje=${value}`;
export const skinTypeHref = (value: string) => `/produkti?tip=${value}`;
