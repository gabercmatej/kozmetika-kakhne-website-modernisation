# Integrations and backend assumptions

This storefront is a complete front end. The commerce systems it needs to talk
to run on the existing `rencof.com` platform, which is not reachable from this
codebase. Everything below states exactly what is real, what is stubbed, and
where a real implementation attaches.

---

## What is real

| Area | Status |
|---|---|
| Catalogue (82 products) | Real. Scraped from the live site into `content/products.json`. |
| Prices, volumes, stock flags | Real, as published at scrape time. |
| Product copy, INCI, benefits, cross-sells | Real, verbatim. |
| Skin type / concern / age tags | Real. Derived from the live site's own filter endpoint. |
| Editorial, expert Q&A, legal copy | Real, verbatim. |
| Reviews and the 4.8 aggregate | Real. Enquiries filtered out (see `lib/content.ts`). |
| Hero campaign photography | Real. The ten banner images the live homepage runs, in `content/banners.json`. |
| Cart | Fully functional, persisted in `localStorage`, synced across tabs. |
| Filtering, search, routine finder | Fully functional, server-rendered. |

## What is stubbed

| Area | Status |
|---|---|
| Order submission | `app/api/narocilo/route.ts`. Validates, recomputes totals from the catalogue, returns a reference. **Takes no payment and reserves no stock.** |
| Payment | Not implemented. The four card logos in the footer are the ones the source site displays; the processor is not identifiable from the front end. |
| Accounts | Not implemented. `/prijava` says so plainly and routes to guest checkout. |
| Newsletter | `components/layout/newsletter-form.tsx` validates and confirms locally. The live site posts to Squalomail; no list credential exists here. |
| Enquiry and loyalty-card forms | `app/api/sporocilo/route.ts`. Validates both submissions and returns a reference. **Sends no mail.** |
| Delivery pricing | Not implemented, because the source site does not publish it. |

---

## Where to attach a real backend

### 1. Orders — `app/api/narocilo/route.ts`

The route already does the parts that must not live on the client: field
validation, and **recomputing every line total from the server-side catalogue
rather than trusting prices in the request body**. Replace the block after
validation:

```ts
// Currently:
const reference = `KK-${Date.now().toString(36).toUpperCase()}`;
console.info("[narocilo:stub] ...");

// Replace with a call to the real order API, then return its reference.
```

Remove `stub: true` and the demo message from the response, and remove the
demo notice in `components/commerce/checkout-form.tsx` (search for
`predstavitvena blagajna`).

### 2. Forms — `app/api/sporocilo/route.ts`

Both public forms — "Zastavite vprašanje" on `/kontakt` and the loyalty-card
application on `/kartica-zvestobe` — post to this one endpoint, discriminated
by `vrsta`, because on the live shop both end up as email to the orders inbox.
Validation already runs server-side; only delivery is missing.

Everything attaches inside `deliver()`:

```ts
// Currently:
async function deliver(kind: Kind, payload: Payload, reference: string) {
  console.info(`[sporocilo:stub] ${FORMS[kind].label}`, { ... });
}

// Replace the body with a mail send — Gmail API, SMTP or a transactional
// provider. `FORMS[kind].label` is a ready-made subject line.
```

Then remove `stub: true` from the response and reword the two `message`
strings, which currently tell the visitor that no mail was sent.

Credentials belong in environment variables, never in the bundle: this route
is server-only, so nothing it reads reaches the client.

### 3. Payment

Add the provider between validation and order creation. The checkout form
already collects everything a redirect-style provider needs and preserves all
entered values on error.

### 4. Stock

`product.inStock` is a static flag from the scrape. For live stock, fetch on
the product page and in `app/api/narocilo/route.ts` before creating the order.
The out-of-stock UI already exists and is exercised by
`/produkt/set-popolni-osrecevalec`.

### 5. Delivery cost

`site.pickup` in `lib/site.ts` holds the real free-pickup rule. Delivery cost
is described as "calculated at checkout" in three places
(`cart-drawer.tsx`, `cart-page-view.tsx`, `checkout-form.tsx`). Once real
figures exist, add them to `lib/site.ts` and surface them in the checkout
summary.

### 6. Newsletter

Point the submit handler in `newsletter-form.tsx` at the Squalomail list
endpoint (the source site uses form id `15` on `4726.squalomail.net`).

### 7. Analytics

None is present on the source site, so nothing was removed. If tracking is
added, the natural events are: `add_to_cart` (`lib/cart.tsx`), filter changes
(`components/catalog/filter-controls.tsx`), search submissions
(`components/layout/search-dialog.tsx`) and order submission.

---

## Refreshing the data

The scrapers are idempotent and safe to re-run. They only read from the live
site and never write to it.

```bash
npm run data:catalog   # products, categories, filter tag map
npm run data:images    # downloads + converts new images only
npm run data:banners   # homepage campaign photography -> content/banners.json
npm run data:content   # articles, expert advice, informational and legal pages
node scripts/scrape-reviews.mjs
npm run data:video     # re-encodes assets-raw/brand-story-source.mp4
```

`scripts/scrape-catalog.mjs` reproduces the site's own `POST /search`
endpoint to recover the skin-type, concern and age tags, which are not exposed
as data anywhere else.

---

## Needs real business information

1. **Delivery costs and any free-shipping threshold.** Not published on the
   source site.
2. **Per-product ratings.** They do not exist; only the company-level 4.8.
3. **Payment provider.**
4. **Stock levels.** Only a binary `Na zalogi` / `Ni na zalogi` string is
   exposed.
5. **Whether the concern tagging should be tightened.** 58 of 82 products are
   currently tagged `rdečica`, which limits how useful that filter can be.
