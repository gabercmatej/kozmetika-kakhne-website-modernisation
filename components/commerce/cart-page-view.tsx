"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Tag, Trash } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Input } from "@/components/ui/field";
import { useCart } from "@/lib/cart";
import { displayName, formatPrice, productCount } from "@/lib/format";
import { primaryImage } from "@/lib/products";
import { site } from "@/lib/site";

export function CartPageView() {
  const { items, count, subtotal, ready, setQuantity, remove } = useCart();
  const [promo, setPromo] = useState("");
  const [promoNote, setPromoNote] = useState<string | null>(null);

  if (!ready) {
    return (
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid gap-4">
          {Array.from({ length: 2 }, (_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <span className="sr-only" role="status">
          Nalagam košarico
        </span>
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        className="mt-10"
        title="Košarica je prazna"
        description="Poiščite izdelke po tipu kože ali po tem, kar vas na koži najbolj moti."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/produkti" variant="primary">
              Poglejte izdelke
            </ButtonLink>
            <ButtonLink href="/rutina" variant="secondary">
              Poiščite svojo rutino
            </ButtonLink>
          </div>
        }
      />
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
      <div>
        <p className="text-base text-muted">{productCount(count)}</p>

        <ul className="mt-4 divide-y divide-border border-y border-border">
          {items.map(({ product, quantity, lineTotal }) => {
            const image = primaryImage(product);
            return (
              <li key={product.slug} className="flex gap-4 py-6 sm:gap-6">
                <Link
                  href={`/produkt/${product.slug}`}
                  className="relative h-32 w-24 shrink-0 overflow-hidden bg-white sm:h-36 sm:w-28"
                >
                  {image ? (
                    <Image
                      src={image.src}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-contain p-2"
                    />
                  ) : null}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="font-sans text-body font-medium leading-snug">
                        <Link
                          href={`/produkt/${product.slug}`}
                          className="text-ink transition-colors hover:text-violet-700"
                        >
                          {displayName(product.name)}
                        </Link>
                      </h2>
                      {product.volume ? (
                        <p className="text-small text-muted">{product.volume}</p>
                      ) : null}
                      <p className="mt-1 text-small tabular-nums text-faint">
                        {product.listPrice != null ? (
                          <s className="mr-1.5">{formatPrice(product.listPrice)}</s>
                        ) : null}
                        <span className={product.listPrice != null ? "font-medium text-violet-700" : undefined}>
                          {formatPrice(product.price)}
                        </span>{" "}
                        / kos
                      </p>
                    </div>
                    <p className="shrink-0 font-display text-title tabular-nums text-ink">
                      {formatPrice(lineTotal)}
                    </p>
                  </div>

                  {/* Wraps rather than overflows. The stepper is 132px of
                      fixed 44px targets and "Odstrani" is another ~100, which
                      is more than the 168px left beside the thumbnail once the
                      page padding is taken off a 320px screen — the row hung
                      6px past the edge at 360 and 46px at 320. Neither control
                      is shrunk to fit; the second one drops to its own line. */}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <QuantityStepper
                      value={quantity}
                      onChange={(next) => setQuantity(product.slug, next)}
                      label={`Količina za ${displayName(product.name)}`}
                    />
                    <button
                      type="button"
                      onClick={() => remove(product.slug)}
                      className="inline-flex min-h-11 items-center gap-1.5 rounded px-2 text-small text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                    >
                      <Trash size={15} weight="light" aria-hidden="true" />
                      Odstrani
                      <span className="sr-only">{displayName(product.name)}</span>
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <Link
            href="/produkti"
            className="inline-flex min-h-11 items-center text-base text-violet-700 underline decoration-violet-200 underline-offset-4 transition-colors hover:decoration-violet-700"
          >
            Nadaljuj z nakupovanjem
          </Link>
        </div>
      </div>

      <aside aria-label="Povzetek naročila" className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-border bg-white p-6">
          <h2 className="font-sans text-body font-medium text-ink">Povzetek</h2>

          <dl className="mt-4 grid gap-2 text-base">
            <div className="flex items-baseline justify-between">
              <dt className="text-muted">Izdelki</dt>
              <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex items-baseline justify-between">
              <dt className="text-muted">Dostava</dt>
              <dd className="text-small text-muted">Izračun na blagajni</dd>
            </div>
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-base font-medium">Skupaj</span>
            <span className="font-display text-h3 tabular-nums">{formatPrice(subtotal)}</span>
          </div>
          <p className="mt-1 text-small text-muted">Cene vključujejo DDV.</p>

          <ButtonLink href="/blagajna" variant="primary" size="lg" fullWidth className="mt-5">
            Na blagajno
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </ButtonLink>

          <p className="mt-4 flex items-start gap-2 text-small text-muted">
            <MapPin size={14} weight="light" aria-hidden="true" className="mt-0.5 shrink-0" />
            {site.pickup.label} na naslovu {site.pickup.address}.
          </p>
        </div>

        {/* Understated by design: a promo field should not compete with the
            checkout button or imply a discount exists. */}
        <details className="mt-4 border border-border bg-white">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 text-base text-ink-soft transition-colors hover:text-violet-700">
            <Tag size={15} weight="light" aria-hidden="true" />
            Imate promocijsko kodo?
          </summary>
          <div className="border-t border-border px-4 py-4">
            <div className="flex gap-2">
              <Input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="Vnesite kodo"
                aria-label="Promocijska koda"
              />
              <Button
                variant="secondary"
                onClick={() =>
                  setPromoNote(
                    promo.trim()
                      ? "Kode preverimo ob oddaji naročila."
                      : "Vnesite kodo, preden jo uveljavite."
                  )
                }
              >
                Uveljavi
              </Button>
            </div>
            {promoNote ? (
              <p role="status" className="mt-2 text-small text-muted">
                {promoNote}
              </p>
            ) : null}
          </div>
        </details>
      </aside>
    </div>
  );
}
