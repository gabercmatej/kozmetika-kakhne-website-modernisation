"use client";

import { Basket, Check } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { displayName } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Adding never blocks on animation: the cart updates immediately and the
 * button confirms afterwards. The confirmation is purely visual because the
 * drawer already announces the change to screen readers.
 */
export function AddToCartButton({
  product,
  quantity = 1,
  variant = "primary",
  size = "md",
  fullWidth,
  label,
  className,
}: {
  product: Product;
  quantity?: number;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  label?: string;
  className?: string;
}) {
  const { add } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!product.inStock) {
    return (
      <Button variant="secondary" size={size} fullWidth={fullWidth} disabled className={className}>
        Trenutno ni na zalogi
      </Button>
    );
  }

  if (product.price == null) {
    return (
      <Button variant="secondary" size={size} fullWidth={fullWidth} disabled className={className}>
        Ni na voljo
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      onClick={(event) => {
        add(product, quantity, event.currentTarget);
        setConfirmed(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setConfirmed(false), 1600);
      }}
    >
      <span className="relative flex h-4 w-4 items-center justify-center">
        <Basket
          size={16}
          weight="light"
          aria-hidden="true"
          className={cn("absolute transition-all duration-200", confirmed && "scale-50 opacity-0")}
        />
        <Check
          size={16}
          weight="bold"
          aria-hidden="true"
          className={cn(
            "absolute transition-all duration-200",
            confirmed ? "scale-100 opacity-100" : "scale-50 opacity-0"
          )}
        />
      </span>
      {label ?? "Dodaj v košarico"}
      <span className="sr-only">: {displayName(product.name)}</span>
    </Button>
  );
}

/** Compact icon-only variant for product cards on pointer devices. */
export function QuickAddButton({ product }: { product: Product }) {
  const { add } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const disabled = !product.inStock || product.price == null;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        add(product, 1, event.currentTarget);
        setConfirmed(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setConfirmed(false), 1600);
      }}
      className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded border transition-all duration-200",
        disabled
          ? "cursor-not-allowed border-border text-faint"
          : "border-border-control bg-white text-ink hover:border-violet-700 hover:bg-violet-700 hover:text-white active:translate-y-px"
      )}
    >
      {confirmed ? (
        <Check size={17} weight="bold" aria-hidden="true" />
      ) : (
        <Basket size={17} weight="light" aria-hidden="true" />
      )}
      <span className="sr-only">
        {disabled ? "Ni na zalogi" : `Dodaj v košarico: ${displayName(product.name)}`}
      </span>
    </button>
  );
}
