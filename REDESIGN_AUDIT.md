# Kozmetika Kahne — redesign audit

Audit of the live site at `kozmetikakahne.com`, carried out before rebuilding.
Everything below was observed directly in the served HTML, CSS and JavaScript,
not inferred from screenshots.

---

## 0. Starting position

The brief assumed an existing repository. There is none. The working folder
contained a single generated `.mp4` and nothing else.

The live site runs on a **closed platform** built by `rencof.com`: jQuery 3.5,
Bootstrap 4.6, slick-carousel, fancybox, server-rendered PHP-style templates,
newsletter through Squalomail. There is no public API, no source access and no
admin access. The footer still reads `2022 ©`.

Consequences that shaped the whole project:

- Checkout, payments, accounts and inventory live on that platform and cannot
  be "preserved" in a new codebase. They are reimplemented as a front end with
  a documented stub (see `INTEGRATIONS.md`).
- Product data had to be recovered by scraping. All 82 products, their copy,
  prices, volumes, INCI lists, badges and cross-sells come from the live site.
- **No analytics or tag manager is present on any page.** There was nothing to
  port. If tracking exists it is server-side and needs to be supplied.

---

## 1. Current visual problems

**Typography.** Bebas Neue, a condensed all-caps display face, is used for
headings and product names. Every product title on the site is shouted
(`HIALURON SERUM`, `DARILNO PAKIRANJE NARAVNO MAZILO IZ MORSKIH ALG IN 2 MINI
KREMI PO IZBORU`). Body copy is Roboto Condensed at 22px with a 60px h1, so the
scale is loud but flat, with very little difference between levels.

**Colour.** The brand's deep aubergine violet `#46166B` and muted gold
`#AB9B4E` are genuinely distinctive and are visible on the packaging, but the
site puts them on pure white with pure black text. The result reads as a 2015
template rather than as a skincare brand. The gold barely appears at all.

**Hero.** The homepage opens with a slick carousel of **eight** unrelated
promotional slides (`Priprava na sonce`, `Zakladi morja`, `Potovalna pakiranja`,
`Poletna prijatelja`, `Zaščitnik kože`, `Dotox`, `Suha koža`, `Moška nega`)
on a 3-second autoplay. There is no single proposition and no stable CTA.

**Density and rhythm.** Sections have near-identical padding and share one
layout family (a slick row of cards), so the page reads as one long
undifferentiated strip. A second infinite marquee (`landing_categories_slider`,
`speed: 9000, autoplaySpeed: 0`) scrolls continuously with no purpose.

**Photography.** Product photography is genuinely good — clean packshots plus
real lifestyle shots and a real photograph of the founder — but it is rendered
small, inside fixed-height card wells, and cropped inconsistently.

---

## 2. Current UX friction

**Filtering is the worst offender.** The listing exposes three useful facets
(`Tip kože`, `Stanje kože`, `Starost`) but:

- Selecting a filter fires `buildSearchUrl()`, which POSTs to `/search` and
  then renders the response inside a **hardcoded `setTimeout(..., 1000)`**.
  Every single filter interaction costs a mandatory extra second.
- On mobile the panel is opened with `showFilter()` and closed with a button
  labelled `Določite parametre iskanja` / `confirm_mobile`, so users must hunt
  for a confirm control that does not actually apply anything.
- There is a real bug in `search.js`: the URL-parameter branch assigns to
  `GlobalSearchSkinTypes` (plural) while `buildSearchUrl()` reads
  `GlobalSearchSkinType` (singular). Arriving on a URL that already carries a
  skin-type filter therefore silently ignores it. The same file has a
  `GlobalSearchGlobalSearchUsageGender` typo in the usage branch.
- Facet counts do not exist, so it is possible to select a combination that
  returns nothing with no warning.

**Add to cart.** `add_to_cart()` navigates away from the current page. Adding a
product from a listing means losing your place in the listing.

**Navigation.** Six top-level items, four of them full-caps
(`BEST SELLERJI`, `OSREČEVALCI`, `DARILA`, `ZNIŽANO`), two sentence case.
The mobile menu links `OSREČEVALCI` and `DARILA` to *different* category slugs
than the desktop menu does — `podlage-za-nanos-pred-kremo` and
`darilna-pakiranja-potovalna-pakiranja-in-testerji`, neither of which returns
any products.

**Product pages.** Long-form copy is good and clearly written by someone who
knows the subject, but it is delivered as three Bootstrap accordions with
inline styles pasted from a word processor. Raw URLs appear as plain text in
the body copy. There is no indication of what a product is *for* until you
open an accordion.

**Reviews.** The same site-wide block of customer quotes renders on every
product page, presented with five stars each. Several of those "reviews" are
actually **customer enquiries** — one asks when a discontinued cream will be
back in stock — rendered with a five-star rating.

---

## 3. What could be preserved

- **All product data.** Names, prices, volumes, benefit bullets, long
  descriptions, usage notes, INCI lists, badges and the editorial
  "Odlično v kombinaciji" cross-sell lists.
- **The category structure**, which is unusually good: cleansing → podlage
  ("osrečevalci") → creams and oils is already a routine, and the rebuild uses
  it as one.
- **The three real badges**: `Prodajna uspešnica`, `Priporočajo strokovnjaki`,
  `Novo`.
- **URL structure.** `/produkt/{slug}`, `/produkti?category={slug}`,
  `/novica/{slug}`, `/prirocnik/{slug}` and all informational and legal routes
  are preserved exactly.
- **SEO metadata**, per-product titles, descriptions and keywords.
- **Editorial content**: seven expert Q&As with real reading times, fifteen
  news articles, and the founder's story.
- **Brand assets**: the wordmark, the four-petal device and the violet/gold
  identity.

## 4. What needed rebuilding

Everything presentational, plus: the hero, the filter mechanism, the cart
interaction, the navigation labels and depth, product page information
hierarchy, the review presentation, and the footer.

---

## 5. Design system

| Decision | Value | Why |
|---|---|---|
| Primary | `#46166B` aubergine violet | Extracted from the wordmark and packaging. A genuine brand purple, not a default. |
| Secondary | `#AB9B4E` gold | On the packaging as a foil pattern. Rationed to heritage, rating and loyalty marks. |
| Neutrals | Violet-undertoned paper `#FAF8F9` → ink `#1A1218` | Deliberately *not* the warm cream/brass family every premium-consumer site defaults to. |
| Display | Newsreader | A reading serif, not a fashion Didone. This is a laboratory that publishes advice. |
| Text | Schibsted Grotesk | Legible at small sizes, handles long Slovenian product names. |
| Radius | 4px everywhere | The source site is already near-sharp; keeping it preserves recognition. |
| Theme | Light only, locked | A storefront that sells on packshots should not invert. |
| Motion | 150–500ms, opacity and transform only | Confirms actions and reveals hierarchy; never decorative. |

All text pairs were verified against WCAG AA numerically, not by eye. A
separate `--color-border-control` token exists at 3.01:1 against paper so
interactive boundaries satisfy WCAG 2.2 SC 1.4.11, which the decorative
hairline colour does not.

---

## 6. Information hierarchy

The homepage was reorganised from eight competing promotional slides into a
single funnel, with a different layout family per section so no two read the
same: proposition → credibility → discovery by problem → how products work
together → what sells → who makes them → expertise → proof → services →
editorial.

Discovery is expressed in customer language ("Kaj vas na koži najbolj moti?")
rather than in catalogue language, and every entry point lands on a correctly
pre-filtered listing.

---

## 7. Performance and accessibility risks

**Handled:**

- 238 product images downloaded, resized to max 1400px and converted to WebP.
  Intrinsic dimensions are stored per image so `next/image` reserves space and
  CLS stays at zero.
- The brand-story video was re-encoded from 10.2 MB with audio to **242 KB**,
  muted, and is skipped entirely under reduced motion, below 768px and under
  save-data; the poster covers all of those cases.
- Fonts self-hosted through `next/font` with `latin-ext` for Slovenian
  diacritics.
- Only the header, cart, search and a few interactive islands hydrate; product
  pages, listings and editorial pages are server-rendered.
- Filtering runs on the server from `searchParams`, so results are in the
  initial HTML and remain indexable.

**Residual risks:**

- **The source concern tags are loose.** 58 of 82 products are tagged
  `rdečica` and 55 are tagged `gube`. The facets are honest, and counts are
  shown, but they discriminate less than a customer would expect. Tightening
  the tagging is a data task for the business, not a front-end one.
- **No per-product ratings exist.** The 4.8 / 1200+ figure is company-level.
  It is published as an `AggregateRating` on the organisation and deliberately
  **not** on products, where it would be schema abuse.
- **Delivery pricing is not published anywhere on the source site**, so the
  checkout shows the free Ljubljana pickup as a concrete option and describes
  delivery cost as calculated at checkout, rather than inventing a figure.
- Two navigation category slugs on the source site return zero products; they
  are dropped rather than reproduced.

---

## 8. Bugs found in the source site

Worth passing to whoever maintains the current platform:

1. `search.js` assigns `GlobalSearchSkinTypes` but reads
   `GlobalSearchSkinType`, so skin-type filters in a shared URL are ignored.
2. `search.js` assigns `GlobalSearchGlobalSearchUsageGender` in the usage
   branch, which is dead.
3. A hardcoded `setTimeout(..., 1000)` delays every filter result by a second.
4. Desktop and mobile menus point `OSREČEVALCI` and `DARILA` at different
   category slugs; the mobile ones return no products.
5. One article (`mozolji-v-odrasli-dobi...`) has no `h1` and a `01.01.1970`
   date, i.e. a null publish date rendered as an epoch.
6. Customer enquiries are rendered as five-star reviews.
7. `/akcijska-ponudba` is reachable from the navigation as `ZNIŽANO` but its
   own heading reads `Akcijska ponudba`, and its breadcrumb reads
   `Aakcijska ponudba` — a typo in the template.

## 9. Reductions

The shop runs nine reductions, published as a struck original beside the new
price plus a violet disc over the photograph. They are carried across exactly:
`-20%` on DOTOX and its two kits, on the termalna meglica and on the 3× mazilo;
`-17%` on the 3× mleko; `-15%` on the 2× mazilo; `-10%` on the hialuron lifting
krema and the hranljivo mleko.

The rebuilt storefront shows them wherever a price appears — listing card, PDP,
cart drawer, cart, search — and `/akcijska-ponudba` lists exactly those nine
rather than the bundle grouping it previously showed. The percentage is the
shop's own figure, not one derived from the two prices, so its rounding is
preserved. In structured data the original is a `ListPrice`
`UnitPriceSpecification`, which is the only form search engines read as a
strikethrough.
