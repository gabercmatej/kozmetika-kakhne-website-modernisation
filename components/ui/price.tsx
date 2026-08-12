import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { now: "text-base", was: "text-small" },
  md: { now: "text-title", was: "text-base" },
  lg: { now: "text-h3", was: "text-lead" },
} as const;

/**
 * A reduced product shows the original struck through beside what it now
 * costs, in the order the shop itself uses. The strike-through is decoration
 * only, so the relationship between the two numbers is also stated for screen
 * readers rather than left to the styling.
 */
export function Price({
  value,
  listPrice = null,
  size = "md",
  className,
  withVat = false,
}: {
  value: number | null;
  listPrice?: number | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  withVat?: boolean;
}) {
  if (value == null) {
    return <span className={cn("text-muted", className)}>Cena na povpraševanje</span>;
  }

  const reduced = listPrice != null && listPrice > value;
  const sizes = SIZES[size];

  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      {reduced ? (
        <s className={cn("tabular-nums text-faint decoration-faint/70", sizes.was)}>
          <span className="sr-only">Redna cena </span>
          {formatPrice(listPrice)}
        </s>
      ) : null}
      <span
        className={cn(
          "font-display tabular-nums",
          sizes.now,
          reduced ? "font-semibold text-violet-700" : "text-ink"
        )}
      >
        {reduced ? <span className="sr-only">, znižana cena </span> : null}
        {formatPrice(value)}
      </span>
      {withVat ? <span className="text-small text-muted">z DDV</span> : null}
    </span>
  );
}

/**
 * The reduction as a filled disc, matching the mark the source site places in
 * the top corner of a discounted photograph. The figure is the shop's own —
 * never derived here, so its rounding is preserved.
 */
export function DiscountMark({
  percent,
  size = "md",
  className,
}: {
  percent: number | null;
  size?: "sm" | "md";
  className?: string;
}) {
  if (percent == null) return null;
  return (
    <span
      className={cn(
        "pointer-events-none inline-flex shrink-0 items-center justify-center rounded-full",
        "bg-violet-700 font-sans font-semibold tabular-nums leading-none text-white shadow-card",
        size === "sm" ? "h-11 w-11 text-small" : "h-[3.75rem] w-[3.75rem] text-body",
        className
      )}
    >
      <span className="sr-only">Znižano za </span>
      {`-${percent}%`}
    </span>
  );
}
