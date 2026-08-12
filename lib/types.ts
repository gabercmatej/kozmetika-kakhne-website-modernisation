export type ProductKind = "single" | "set" | "mini" | "voucher" | "accessory";

export type ProductImage = {
  src: string;
  width: number;
  height: number;
  /**
   * How the image should be framed. Studio packshots sit on a white ground
   * and must never be cropped; lifestyle photography must fill its frame.
   * Classified at build time in scripts/fetch-images.mjs.
   */
  fit?: "contain" | "cover";
};

export type ProductSection = {
  title: string;
  html: string | null;
};

export type Product = {
  slug: string;
  sourceId: string | null;
  name: string;
  /** What the shopper pays. Already reduced when the product is on offer. */
  price: number | null;
  /** The struck-through original, set only while an offer is running. */
  listPrice: number | null;
  /** The reduction exactly as the shop prints it, e.g. 20 for "-20%". */
  discountPercent: number | null;
  badge: string | null;
  volume: string | null;
  stock: string | null;
  inStock: boolean;
  kind: ProductKind;
  categories: string[];
  tipKoze: string[];
  stanjeKoze: string[];
  starost: string[];
  lead: string | null;
  benefits: string[];
  intro: string[];
  crossSell: string[];
  related: string[];
  inci: string | null;
  sections: ProductSection[];
  seo: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  images: ProductImage[];
  gallery?: string[];
};

export type Category = {
  slug: string;
  label: string;
  short: string;
};

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterGroups = {
  tipKoze: FilterOption[];
  stanjeKoze: FilterOption[];
  starost: FilterOption[];
};

/**
 * A campaign photograph published on the source homepage's banner rail.
 * `title` and `subtitle` are the shop's own words for that campaign; they are
 * recorded for traceability and are not rendered.
 */
export type Banner = {
  slug: string;
  src: string;
  width: number;
  height: number;
  title: string;
  subtitle: string | null;
  cta: { label: string | null; href: string } | null;
};

/** A retailer that stocks the range. The source publishes no link for any. */
export type Partner = {
  slug: string;
  name: string;
  src: string;
  width: number;
  height: number;
};

export type Article = {
  slug: string;
  title: string | null;
  date: string | null;
  readingMinutes: number | null;
  image: ProductImage | null;
  excerpt: string;
  bodyHtml: string | null;
  seo: { title: string | null; description: string | null };
};

export type AdviceItem = {
  id: string;
  question: string;
  answerHtml: string;
  words: number;
  readingMinutes: number;
};

export type Page = {
  slug: string;
  title: string;
  bodyHtml: string;
  image: ProductImage | null;
  seo: { title: string | null; description: string | null };
};

export type Review = {
  author: string;
  stars: number;
  body: string;
  kind: "testimonial" | "enquiry";
};

/** One person on the leadership page, recovered from that page's own markup. */
export type LeaderProfile = {
  /** The two-letter monogram the source itself prints beside each name. */
  initials: string;
  name: string;
  role: string;
  bio: string;
};

export type CartLine = {
  slug: string;
  quantity: number;
};
