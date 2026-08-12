"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { useId } from "react";
import { cn } from "@/lib/utils";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "Količina",
  size = "md",
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  const dims = size === "sm" ? "h-9" : "h-11";
  const btn = size === "sm" ? "w-9" : "w-11";

  return (
    <div className={cn("inline-flex items-stretch border border-border-control bg-white", dims, className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={`Zmanjšaj količino, trenutno ${value}`}
        aria-controls={id}
        className={cn(
          "flex items-center justify-center text-ink transition-colors",
          "hover:bg-surface disabled:text-faint disabled:hover:bg-transparent",
          btn
        )}
      >
        <Minus size={15} weight="bold" aria-hidden="true" />
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (Number.isFinite(next)) onChange(Math.min(max, Math.max(min, Math.round(next))));
        }}
        className={cn(
          "w-11 border-x border-border bg-transparent text-center text-base font-medium tabular-nums",
          "[appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={`Povečaj količino, trenutno ${value}`}
        aria-controls={id}
        className={cn(
          "flex items-center justify-center text-ink transition-colors",
          "hover:bg-surface disabled:text-faint disabled:hover:bg-transparent",
          btn
        )}
      >
        <Plus size={15} weight="bold" aria-hidden="true" />
      </button>
    </div>
  );
}
