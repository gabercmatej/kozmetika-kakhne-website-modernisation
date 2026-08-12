# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A rebuilt storefront for Kozmetika Kahne, a Slovenian skincare company founded in 1987.

The **live site at kozmetikakahne.com is a separate, closed platform** (built by rencof.com; jQuery/Bootstrap, no API, no source access). This repo is a new Next.js front end built against that site as the reference. Read `REDESIGN_AUDIT.md` for what the original does and why things were changed, and `INTEGRATIONS.md` for what is real versus stubbed.

All content is in Slovenian.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build (also type-checks)
npm run start        # serve the production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
```

There is no test runner. Verification is done by building, then driving the running site with Playwright (see Verification below).

### Data pipeline

The catalogue is scraped from the live site, not authored here. Scripts are idempotent, read-only against the source, and their output is committed.

```bash
npm run data:catalog   # products.json, categories.json, filters.json
npm run data:images    # downloads + converts new images only (skips existing)
npm run data:banners   # banners.json + public/kampanje (homepage campaign photos)
npm run data:content   # articles.json, advice.json, pages.json
node scripts/scrape-reviews.mjs
npm run data:video     # re-encodes assets-raw/brand-story-source.mp4
```

`data:images` mutates `content/products.json` in place, adding an `images` array. **Re-run `data:catalog` before `data:images` if `products.json` looks incomplete** — the two are ordered and the second depends on `gallery` URLs written by the first.

### Running lib logic from the command line

`scripts/lib/ts-loader.mjs` resolves the `@/` alias, extensionless imports and JSON import attributes so plain `node` can exercise `lib/` directly. Useful for checking filter, routine or formatting logic without a browser:

```bash
node --import ./scripts/lib/ts-loader.mjs some-check.mjs
```

## Architecture

### Data flow

`content/*.json` (scraped) → `lib/products.ts`, `lib/content.ts` (typed accessors, single source of truth) → server components.

The hero's photography comes from `content/banners.json` — the campaign images
the live homepage runs on its own banner rail — read through `bannerImage()` in
`lib/content.ts`. `components/sections/hero.tsx` names a banner per slide and
falls back to catalogue imagery if that banner is ever retired, so a re-scrape
can never leave a slide with an empty frame.

Never hardcode product data in a component. `lib/products.ts` and `lib/content.ts` are the only modules that import the JSON.

`content/products.json` is ~470 KB. `app/layout.tsx` deliberately passes a **stripped catalogue** (long copy, INCI and SEO fields nulled) to the cart provider, because that payload ships to every page.

#### Prices and reductions

`price` is always **what the shopper pays**. When the shop has reduced an item, `listPrice` carries the struck-through original and `discountPercent` the figure the shop prints in its own badge — kept verbatim rather than recomputed, because its rounding is part of the published offer. Nothing in this repo decides what is reduced: `discountedProducts()` in `lib/products.ts` returns exactly the products whose source price box carried a reduction, so `/akcijska-ponudba` cannot disagree with the live shop.

The source renders two different price boxes (`.price`, or `.old_price` + `.new_price`), and the discount badge lives over the photograph rather than in the box. `parsePriceBox` in `scripts/lib/parse.mjs` reads both shapes from a **scoped** container. It must stay scoped: a page-wide `.price` lookup picks up the related-products carousel, and the text fallback it replaced silently wrote whatever number appeared first in the body — that produced nine wrong prices, including `dotox` at 9,90 € and `hranljivo-mleko-za-telo` at 77,70 €.

#### Art direction

`lib/art-direction.ts` holds the hand-made framing decisions the scrape cannot make: which photograph a card reveals on hover, and which images the build-time classifier mis-framed. It cannot live in `content/products.json` — `npm run data:images` rewrites that file wholesale, including every `fit`, so a re-scrape would erase the corrections silently.

`lib/products.ts` folds it in on the way out: `withArtDirection` rewrites `fit` when the exported `products` array is built, so a photograph that is a packshot in a card is a packshot in the gallery, the cart and the search index too. `hoverImage(product)` resolves the hover frame, defaulting to the second photograph. Positions in the table are **1-based**, matching how someone counting pictures on the product page would name them; the accessors convert. Out-of-range positions are ignored rather than thrown, so a product losing a photograph costs that one override and not the page.

The `contain` corrections exist because `classifyFit` in `scripts/fetch-images.mjs` rejects any border band whose channels spread more than 12. That is right for the catalogue as a whole and wrong for the gold-and-beige gift bags and the bare-shouldered model shots, which carry enough warmth at the frame edge to read as lifestyle and were cropped to fill a 4:5 card, losing about a third of their width.

### Client boundary

Pages are server components. `components/layout/shell.tsx` is the single client boundary and hydrates only the header, search dialog and cart drawer. Interactive pieces below that are isolated leaves (`components/catalog/*`, `components/commerce/*`, a few `components/ui/*`).

**`Drawer` portals its overlay into `document.body`, and that is load-bearing.** `position: fixed` resolves against the nearest ancestor carrying a filter, transform or `backdrop-filter` — not against the viewport — and `header` is `backdrop-blur-md`. The mobile navigation is invoked from inside it, so before the portal the drawer was laid out inside the header's own 93px box: tapping the hamburger produced a panel squashed into the top strip with its contents spilling down the page unclipped. Anything else `fixed` that is rendered from inside the header needs the same treatment.

### Cart

`lib/cart-store.ts` is a module-level external store (subscribe / getSnapshot / getServerSnapshot) backed by `localStorage` and synced across tabs via the `storage` event. `lib/cart.tsx` wraps it with `useSyncExternalStore`.

This shape exists specifically to avoid writing state from an effect during hydration. `react-hooks/set-state-in-effect` is enforced by lint — when you need a browser-only value, use `lib/use-client-only.ts` or the adjust-state-during-render pattern (compare a previous value held in state), not an effect.

### Filtering

Filter state lives entirely in the URL. `lib/filters.ts` owns parse / serialize / apply. The routes read `searchParams` and filter **on the server**, so results are in the initial HTML; `components/catalog/filter-controls.tsx` is a client island that only pushes new URLs.

`components/catalog/product-listing.tsx` is the shop view itself, shared by
`/produkti` and `/akcijska-ponudba`. Reductions are a *scope* on the listing,
not a page of their own: the sale route passes `discountedProducts()` as
`scope.products` and `/akcijska-ponudba` as `scope.base`, so filters, sort and
search all stay on that route instead of dropping the visitor into the full
catalogue. `filterHref(state, base)` is why the base has to be threaded through
`FilterControls` and `FilterRail`.

The `category` query parameter keeps its original name so existing kozmetikakahne.com links resolve. Facet counts are computed against every *other* active facet, so a shown count never promises an empty result.

`/prirocnik/navodila-za-uporabo` follows the same division for the same reason. Its 77 instruction blocks are ~60 KB of the shop's own markup, so filtering them in the browser would ship all of it a second time inside the flight payload in order to hide most of it; `usageByCategory(query)` filters on the server and `components/catalog/usage-search.tsx` only pushes the URL.

The function claims a product for its first matching category *before* applying the query. That ordering is defensive rather than load-bearing today — the current scrape puts every product in exactly one category, so nothing can double — but it is what keeps the guarantee true if that ever changes: filtering first would let a product excluded from its own category reappear under the next one that lists it.

### Routine engine

`lib/routine.ts` maps four questions onto the catalogue's real `tipKoze` / `stanjeKoze` / `starost` tags and returns products with a plain-language reason. It powers both `/rutina` and the homepage routine section. Keep recommendation logic here — do not duplicate scoring into components.

### Ingredient index

`lib/ingredients.ts` inverts the catalogue's INCI declarations: 72 products publish one, and the shop prints it on the product page and nowhere else, so "which of these contain X" is unanswerable without opening all 72. It powers the `/prirocnik/nega-koze` handbook, which used to be four grids of links and no information of its own.

The parser exists because the source strings are dirty in five specific ways, each fixed against the string that produces it and each documented at its rule: sets concatenate their members' lists with the space after the full stop lost; member labels are punctuated with a colon, sometimes with a comma inside the label; two names carry a comma of their own (`1,2-Hexanediol`); two products append a `0% PARABENOV…` marketing block; and sixteen decline to list anything and say so in Slovenian prose. **Do not "simplify" these into a generic tokeniser** — a plain split on commas alone reintroduces sheared names, marketing words and half-labels as ingredients.

Two readings of every name are keyed, one dropping bracketed glosses and one keeping them, and entries merge on either. Both are needed: `Aqua (Water)` is `Aqua` only if brackets are dropped, `Calendula Officinalis (Flower) Extract` is `Calendula Officinalis Flower Extract` only if they are kept. A small `ALIASES` table repairs four source typos and spelling splits; every target is a spelling the shop already uses on the majority of products that declare it.

Nothing states what an ingredient does. That would be a claim the shop has not made — the page says only where each one appears, and how an EU label is ordered and named.

### Design system

Tokens live in `@theme` in `app/globals.css`. Colours are extracted from the real brand (violet `#46166B`, gold `#AB9B4E`); neutrals carry a violet undertone by design.

Five things that bite:

- **Custom `text-*` size tokens must be registered in `extendTailwindMerge` in `lib/utils.ts`.** Otherwise `tailwind-merge` classifies them as text *colours* and silently drops a preceding colour class. This once turned white button text near-black.
- Use `--color-border-control` (3.01:1 against paper) for anything that is an interactive boundary; `--color-border` is decorative only and fails WCAG 2.2 SC 1.4.11.
- **Tailwind has no theme namespace for z-index.** The `--z-*` tokens in
  `@theme` generate no utilities by themselves; they are turned into real
  classes by an `@layer utilities` block right below them. Without it `z-toast`
  compiled to nothing and the cart-flight layer sat at `z-index: auto` under
  the sticky header. Use the named classes, not raw numbers.
- **A heading on a dark ground needs `text-white` on the heading itself.** The
  base layer gives every `h1`–`h4` `color: var(--color-ink)`, which beats a
  colour inherited from an ancestor — so `<section className="bg-violet-900
  text-white"><h2>` renders the h2 near-black. The booklet band shipped that
  way at roughly 1.2:1. Paragraphs and spans inherit normally; only headings
  carry the rule.
- **Grid items default to `min-width: auto`,** which floors them at min-content
  — and `truncate` sets `white-space: nowrap`, whose min-content is the whole
  untruncated string. A `truncate`d product name nested in a grid therefore
  *widens* its container instead of ellipsing inside it: the checkout summary's
  grid refused to go below 651px in a 467px panel and every row hung out past
  the border. Release it with `[&>*]:min-w-0` on the grid, and prefer
  `line-clamp-*` over `truncate` for anything that can run long.

Only `gold-700` passes AA for body text on paper; `gold-500`/`gold-600` are for fills and large type.

The page is **light-theme only, deliberately** — a storefront selling on packshots should not invert.

### Motion

`components/ui/reveal.tsx`.

Adding to the cart throws the product's photograph on a parabola into the
header basket, plays a short synthesised chime (`lib/sfx.ts`), then opens the
drawer with a confetti burst behind it. All of it is orchestrated from
`lib/cart.tsx`; `launch()` declines — and the drawer opens immediately — when
there is no origin element, no basket (`data-cart-target`), or reduced motion
is requested.

- **The arc** (`components/commerce/cart-flight.tsx`) samples a quadratic at 24
  points and plays them back linearly. Three keyframes with an easeOut/easeIn
  pair puts a visible corner at the apex. Apex height scales with *horizontal*
  travel and is clamped inside the viewport, or a basket near the top of the
  screen sends the ball off-screen mid-flight.
- **The sound** is synthesised, not loaded: no asset, no network, no licence.
  It is a bling — a C major arpeggio rolled upwards over ~0.1s, each note
  doubled and detuned 7 cents. The AudioContext must be created inside the
  click (`primeCartSound`), not at landing, or the browser refuses it.
  `onAnimationComplete` fires for the exit fade as well as the throw, so
  landings are deduplicated by id in `cart-flight.tsx`; without that the sound
  plays twice and the basket bounces twice.
- **The confetti** (`components/commerce/confetti-burst.tsx`) is fired from a
  cannon inside the drawer panel's own footprint and drawn on a canvas passed
  to `Drawer`'s `backdrop` slot — between the scrim and the panel, which is the
  only way to be over the dim but under the panel from outside its stacking
  context. It is keyed on `adds`, never on `count`: emptying a basket must not
  celebrate.

Ambient video (`components/ui/ambient-video.tsx`) carries no scrim of its own;
the section owns it, so a video band and a photographic band share one recipe.
Two rules keep it invisible as an object:

- Its feather mask uses radii of **60%** of the box, which puts the box's own
  edge past the last gradient stop. Radii near 100% leave roughly half the
  alpha standing at the edge — the visible rectangle the mask exists to remove.
- The band needs a **white ground under the whole section**, not just behind
  the clip. Scrim-over-video and scrim-over-bare-violet are different colours,
  which is what made the video's footprint readable as a patch.

`npm run data:video` builds a seamless loop: the turntable does not complete a
revolution, so the clip's tail is dissolved into its own head and it now ends
on the frame it starts on (measured seam 1.14/255 against 0.74 for an ordinary
frame step; the uncrossfaded source was 10.8). The poster is extracted from the
encoded loop, not the source, or the video jumps the instant it starts.

**The crossfade length is a framing decision, not just a smoothing one.** The
shot opens and closes front-on, so the first and last frames are the only pair
sharing a rotation angle and the dissolve has to join those — it cannot be moved
off the front. It can only be made shorter. At the 1.2s it once ran, the
dissolve swallowed the whole front-facing arc (~1.9s of the 6.6s source) and the
label was never seen clean; the rotation appeared to accelerate through the front
and emerge already turning away. It is now 0.35s. Do not lengthen it back: the
camera also dollies in across the shot, so the two sides differ in scale, and a
longer blend reads as two bottles — at 0.7s the label is legibly doubled. The
step metric alone will argue for a longer fade; the eye is the tiebreak. Never swap a `motion.*` component for a plain element when reduced motion is detected: React cannot clear the server-rendered `opacity: 0` inline style, and the content stays invisible. Keep the component type stable and set `initial={false}` instead.

Long-form CMS copy renders through `Prose` in `components/ui/misc.tsx`, which linkifies bare URLs and rewrites absolute kozmetikakahne.com links to internal routes.

### The booklet

The shop's own "Osebni priročnik za nego kože" is a 29-page FlipHTML5 publication, not a PDF: FlipHTML5 hosts it, there is no file on kozmetikakahne.com to serve ourselves, and the reader **is** the artefact. The source embeds it on `/prirocnik/nega-koze` and promotes it from a violet band above the footer on every page. Both live in `components/ui/booklet.tsx`; the URL, title and the source's own promo wording are in `site.booklet`, kept verbatim for the same reason as the map embed — a publisher-issued identifier cannot be reconstructed from the title.

`BookletBanner` runs on the homepage only, where the source runs it site-wide: the offer is the same offer each time, and a band under all eighty-odd product pages is repetition rather than emphasis. It carries `-mb-24` to cancel the footer's `mt-24` and takes the footer's own `violet-900`, so the two meet as one closing block instead of as a coloured strip stacked on a darker one.

The frame is landscape at every width. FlipHTML5 always lays the booklet out as a two-page spread and never falls back to single pages on a narrow screen, so the portrait frame it was first given bought nothing but grey — at 348×464 the book filled 215px of it.

The four routine steps live on `/rutina` only. They were once written there and again on the handbook, one page apart; the handbook's treatment survived and moved, the duplicate went. The targeted step has no category of its own, so it links to the handbook rather than to a listing.

## Constraints

- **Never invent product claims, prices, ingredients, reviews, ratings, discounts or delivery figures.** Everything visible must trace to the scraped data or to `lib/site.ts`. Where the source publishes nothing (delivery cost), the UI says so rather than guessing. Reductions are shown, but only the nine the shop publishes — see Prices and reductions above. `lib/art-direction.ts` is the one hand-authored file that touches the catalogue, and it only ever *chooses between* and *frames* photographs the shop already publishes.
- **There is no per-product rating data.** The 4.8 / 1200+ figure is company-level and belongs on the organisation schema only.
- All existing live URLs are preserved: `/produkt/{slug}`, `/produkti?category={slug}`, `/akcijska-ponudba`, `/novica/{slug}`, `/prirocnik/{slug}`, plus informational and legal routes served by the `app/[...slug]` catch-all from `content/pages.json`. Legacy URLs without an equivalent are redirected in `next.config.ts`. `/akcijska-ponudba` keeps its name even though it now renders the shared listing — the route is the shop's, not ours to rename.
- `app/api/sporocilo/route.ts` is a documented stub shared by both public
  forms (`/kontakt`, `/kartica-zvestobe`), discriminated by `vrsta`. It
  validates server-side but sends no mail; `deliver()` is the single function a
  real transport replaces. Its `stub: true` flag and the "pošta še ni
  povezana" wording in the two response messages must go together.
- `app/kontakt/page.tsx` and `app/kartica-zvestobe/page.tsx` deliberately
  shadow the `[...slug]` catch-all so those original URLs keep resolving; both
  slugs are excluded from the catch-all's `generateStaticParams`.
- `app/api/narocilo/route.ts` is a documented stub. It validates and recomputes totals server-side from the catalogue (never trusting client prices) but takes no payment. Its `stub: true` response and the demo notice in `checkout-form.tsx` must be removed together when a real backend is attached.

## Verification

Build, then drive the production server. `npm run dev` will not surface prerender or payload problems.

```bash
npm run build && npm run start
```

Check for a stale process first — a leftover server bound to :3000 will silently serve an old build:

```bash
lsof -ti:3000 | xargs kill -9
```

Then exercise the journeys with Playwright at 1440 / 1024 / 390 / 320: concern tile → filtered listing → product → cart drawer, filter round-trip through the URL, search by name and by concern, routine finder, checkout validation and submission, keyboard-only navigation, and `prefers-reduced-motion`. Screenshots from the last pass are in `screenshots/`.

When capturing full-page screenshots, scroll the page first (capturing a fixed height read once up front, not `scrollHeight` inside the loop) or lazy images render as empty wells.
