"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Trash } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { Drawer, DrawerHeader } from "@/components/ui/drawer";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCart } from "@/lib/cart";
import { displayName, formatPrice, productCount } from "@/lib/format";
import { getProduct, primaryImage } from "@/lib/products";
import { site } from "@/lib/site";
import { AddToCartButton } from "@/components/commerce/add-to-cart";
import { ConfettiBurst } from "@/components/commerce/confetti-burst";

/**
 * Opens on add so nobody has to leave the page to confirm an item landed.
 * Carries at most one cross-sell, taken from the added product's own
 * "Odlično v kombinaciji" list rather than from a generic recommendation.
 */
export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, count, subtotal, lastAdded, setQuantity, remove, openedByAdd, adds } =
    useCart();

  const crossSellSlug = lastAdded?.crossSell.find(
    (slug) => !items.some((i) => i.product.slug === slug)
  );
  const crossSell = crossSellSlug ? getProduct(crossSellSlug) : undefined;

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      side="right"
      labelledBy="cart-drawer-title"
      /* Only when something landed — opening the basket to look at it, or
         emptying it, is not an occasion. Keyed on the add counter so a second
         add fires a fresh burst but a removal fires nothing. */
      backdrop={openedByAdd ? <ConfettiBurst key={adds} /> : null}
    >
      <DrawerHeader
        title="Košarica"
        id="cart-drawer-title"
        onClose={closeDrawer}
        hint={count > 0 ? productCount(count) : undefined}
      />

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-display text-h3">Košarica je prazna</p>
          <p className="max-w-xs text-base text-muted">
            Poiščite izdelek po tipu kože ali po tem, kar vas na koži najbolj moti.
          </p>
          <ButtonLink href="/produkti" variant="primary" onClick={closeDrawer}>
            Poglejte izdelke
          </ButtonLink>
        </div>
      ) : (
        <>
          <ul className="flex-1 divide-y divide-border overflow-y-auto overscroll-contain px-5">
            {items.map(({ product, quantity, lineTotal }) => {
              const image = primaryImage(product);
              return (
                <li key={product.slug} className="flex gap-4 py-4">
                  <Link
                    href={`/produkt/${product.slug}`}
                    onClick={closeDrawer}
                    className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface"
                  >
                    {image ? (
                      <Image src={image.src} alt="" fill sizes="80px" className="object-cover" />
                    ) : null}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/produkt/${product.slug}`}
                          onClick={closeDrawer}
                          className="block text-base font-medium leading-snug text-ink transition-colors hover:text-violet-700"
                        >
                          {displayName(product.name)}
                        </Link>
                        {product.volume ? (
                          <p className="text-small text-muted">{product.volume}</p>
                        ) : null}
                        {/* Only shown on an offer: the line total alone would
                            hide that the item is reduced. */}
                        {product.listPrice != null ? (
                          <p className="text-small tabular-nums">
                            <s className="text-faint">{formatPrice(product.listPrice)}</s>{" "}
                            <span className="font-medium text-violet-700">
                              {formatPrice(product.price)}
                            </span>
                          </p>
                        ) : null}
                      </div>
                      <p className="shrink-0 text-base font-medium tabular-nums">
                        {formatPrice(lineTotal)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <QuantityStepper
                        size="sm"
                        value={quantity}
                        onChange={(next) => setQuantity(product.slug, next)}
                        label={`Količina za ${displayName(product.name)}`}
                      />
                      <button
                        type="button"
                        onClick={() => remove(product.slug)}
                        className="flex h-9 w-9 items-center justify-center rounded text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                      >
                        <Trash size={16} weight="light" aria-hidden="true" />
                        <span className="sr-only">Odstrani {displayName(product.name)}</span>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {crossSell ? (
            <div className="border-t border-border bg-violet-50 px-5 py-4">
              <p className="mb-3 text-small font-medium text-violet-800">
                Odlično se ujame z vašo izbiro
              </p>
              <div className="flex items-center gap-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden bg-white">
                  {primaryImage(crossSell) ? (
                    <Image
                      src={primaryImage(crossSell)!.src}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/produkt/${crossSell.slug}`}
                    onClick={closeDrawer}
                    className="block truncate text-base font-medium text-ink hover:text-violet-700"
                  >
                    {displayName(crossSell.name)}
                  </Link>
                  <p className="text-small tabular-nums text-muted">
                    {crossSell.listPrice != null ? (
                      <s className="mr-1.5 text-faint">{formatPrice(crossSell.listPrice)}</s>
                    ) : null}
                    <span className={crossSell.listPrice != null ? "font-medium text-violet-700" : undefined}>
                      {formatPrice(crossSell.price)}
                    </span>
                  </p>
                </div>
                <AddToCartButton product={crossSell} size="sm" variant="secondary" label="Dodaj" />
              </div>
            </div>
          ) : null}

          <div className="safe-bottom border-t border-border bg-paper px-5 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-base text-muted">Skupaj izdelki</span>
              <span className="font-display text-title tabular-nums">{formatPrice(subtotal)}</span>
            </div>
            <p className="mt-1 flex items-start gap-1.5 text-small text-muted">
              <MapPin size={14} weight="light" aria-hidden="true" className="mt-0.5 shrink-0" />
              Stroški dostave se izračunajo na blagajni. {site.pickup.label} je brezplačen.
            </p>

            <div className="mt-4 grid gap-2">
              <ButtonLink href="/blagajna" variant="primary" size="lg" fullWidth onClick={closeDrawer}>
                Na blagajno
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="min-h-11 text-base text-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink"
                >
                  Nadaljuj z nakupovanjem
                </button>
                <Link
                  href="/kosarica"
                  onClick={closeDrawer}
                  className="min-h-11 text-base font-medium leading-[2.75rem] text-violet-700 hover:underline"
                >
                  Odpri košarico
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </Drawer>
  );
}
