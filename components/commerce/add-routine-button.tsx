"use client";

import { Basket, Check } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { getProducts } from "@/lib/products";
import { productCount } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Adds every step of a routine in one action, skipping anything unavailable. */
export function AddRoutineButton({
  slugs,
  label = "Dodaj celotno rutino",
  variant = "primary",
}: {
  slugs: string[];
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const { addMany } = useCart();
  const [confirmed, setConfirmed] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const available = getProducts(slugs).filter((p) => p.inStock && p.price != null);
  if (!available.length) return null;

  return (
    <Button
      variant={variant}
      size="lg"
      onClick={(event) => {
        addMany(available, event.currentTarget);
        setConfirmed(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setConfirmed(false), 1800);
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
      {label}
      <span className="sr-only">, {productCount(available.length)}</span>
    </Button>
  );
}
