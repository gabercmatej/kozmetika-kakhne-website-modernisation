"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { AddToCartButton } from "@/components/commerce/add-to-cart";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Price } from "@/components/ui/price";
import { displayName } from "@/lib/format";
import { primaryImage } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * Quantity plus add-to-cart, and a sticky bar that only appears once the real
 * button has scrolled out of view. Using an observer on the primary button
 * means the bar can never cover the control it duplicates.
 */
export function ProductPurchase({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const reduce = useReducedMotion();
  const image = primaryImage(product);

  useEffect(() => {
    const node = anchorRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={anchorRef} className="grid gap-4">
        {product.inStock && product.price != null ? (
          <div className="flex flex-wrap items-center gap-3">
            <QuantityStepper
              value={quantity}
              onChange={setQuantity}
              label={`Količina za ${displayName(product.name)}`}
            />
            <AddToCartButton
              product={product}
              quantity={quantity}
              size="lg"
              className="min-w-[13rem] flex-1"
            />
          </div>
        ) : (
          <AddToCartButton product={product} size="lg" fullWidth />
        )}
      </div>

      <motion.div
        aria-hidden={!showSticky}
        initial={false}
        animate={
          reduce
            ? { opacity: showSticky ? 1 : 0 }
            : { y: showSticky ? 0 : 100, opacity: showSticky ? 1 : 0 }
        }
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-paper/97 px-4 pt-3 shadow-raised backdrop-blur-md lg:hidden"
        style={{ pointerEvents: showSticky ? "auto" : "none" }}
      >
        <div className="flex items-center gap-3">
          {/* Carried at every width. It was gated behind `xs:`, which is not a
              breakpoint this project defines, so the rule compiled to nothing
              and the phone — the only place this bar exists — was the one
              screen that never saw which product it was offering. */}
          {image ? (
            <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-white">
              <Image src={image.src} alt="" fill sizes="40px" className="object-contain" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="truncate text-small font-medium text-ink">
              {displayName(product.name)}
            </p>
            <Price value={product.price} listPrice={product.listPrice} size="sm" />
          </div>
          <AddToCartButton
            product={product}
            quantity={quantity}
            size="md"
            label="V košarico"
            className="shrink-0"
          />
        </div>
      </motion.div>
    </>
  );
}
