/**
 * Hand-authored framing decisions for individual products.
 *
 * Everything else about the catalogue is scraped, and `npm run data:images`
 * rewrites `content/products.json` wholesale — including the `fit` it guesses
 * for every photograph. So these choices cannot live in that file: a
 * re-scrape would erase them silently and nobody would notice until a card
 * looked wrong. They live here, are applied by `lib/products.ts` on the way
 * out, and survive any number of re-scrapes.
 *
 * Two kinds of decision, both made by eye against the real photographs:
 *
 * `hover` — which frame a product card crossfades to when pointed at. The
 * default is the second photograph, which for most of the range is the
 * lifestyle shot. Where the shop's own gallery order puts something better
 * further down — a model holding the bottle, the set laid out, the texture
 * swatch — that frame is named here instead.
 *
 * `contain` — photographs the build-time classifier called `cover` that are
 * in fact studio packshots on white. `classifyFit` in scripts/fetch-images.mjs
 * reads the border band and rejects anything whose channels spread more than
 * 12, which is the right test for the catalogue as a whole but misfires on
 * this handful: the gold-and-beige gift bags and the bare-shouldered model
 * shots carry enough warmth at the frame edge to read as lifestyle. Cropped
 * to fill a 4:5 card they lost about a third of their width. Listed here they
 * are shown whole, on the white ground their own background merges into.
 *
 * Indexes are 1-based, matching the gallery position a person counting
 * pictures on the product page would give. `lib/products.ts` converts.
 */
export type ArtDirection = {
  /** Gallery position (1-based) to reveal on hover, instead of the second. */
  hover?: number;
  /** Gallery positions (1-based) that must not be cropped. */
  contain?: number[];
};

export const ART_DIRECTION: Record<string, ArtDirection> = {
  "zascitnik-koze--skin-defender": { contain: [2] },
  "hialuron-serum": { hover: 5 },
  "zlati-serum-z-argirelinom": { hover: 6 },
  "krema-proti-pigmentnim-madezem": { hover: 5 },
  "stabilni-vitamin-c": { hover: 3 },
  dotox: { hover: 3 },
  "hranljivo-mleko-za-telo": { hover: 3 },
  "moski-special-edition-serum-in-krema": { hover: 3 },
  "moski-special-edition-super-serum-4v1": { hover: 3 },
  "darilni-set-vecna-zvestoba": { hover: 5, contain: [1, 2, 3] },
  "darilni-set-cudovita-brezmadeznost": { hover: 4, contain: [2, 3] },
  "darilni-set-eliksir-mladosti": { hover: 4, contain: [1, 2, 3] },
  "darilno-pakiranje-zlati-serum-in-1-mini-krema-po-izboru": { hover: 3 },
  "darilno-pakiranje-hialuron-serum-in-1-mini-krema-po-izboru": { hover: 3 },
  "darilno-pakiranje-naravno-mazilo-iz-morskih-alg-in-1-mini-krema-po-izboru": { hover: 3 },
  "darilno-pakiranje-naravno-mazilo-iz-morskih-alg-in-2-mini-kremi-po-izboru": { hover: 3 },
  "darilno-pakiranje-vitaminsko-olje-in-1-mini-krema-po-izboru": { hover: 3 },
  "hranljivo-mleko-za-telo-3x": { hover: 3 },
  "termalna-meglica-z-aloe-vero": { hover: 4 },
  "top-performer-duo": { hover: 5 },
  "bio-arganovo-olje-s-hialuronsko-kislino": { hover: 3 },
  "darilna-skatla-bela-z-motivom": { hover: 3 },
  "mini-hialuron-serum": { hover: 3 },
};
