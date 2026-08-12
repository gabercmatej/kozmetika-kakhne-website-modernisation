import { cn } from "@/lib/utils";

export type BadgeTone = "bestseller" | "expert" | "new" | "sale" | "neutral" | "out";

/** Only the three badges the source catalogue actually uses, plus stock states. */
const TONES: Record<BadgeTone, string> = {
  bestseller: "bg-violet-700 text-white",
  expert: "bg-gold-500 text-violet-950",
  new: "bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-200",
  sale: "bg-danger text-white",
  neutral: "bg-surface text-ink-soft ring-1 ring-inset ring-border-strong",
  out: "bg-white text-muted ring-1 ring-inset ring-border-control",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-2 py-1 text-micro font-medium leading-none tracking-[0.02em]",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const SOURCE_BADGE_TONES: Record<string, BadgeTone> = {
  "Prodajna uspešnica": "bestseller",
  "Priporočajo strokovnjaki": "expert",
  Novo: "new",
};

/** Renders a badge straight from the catalogue value, or nothing. */
export function ProductBadge({ badge, className }: { badge: string | null; className?: string }) {
  if (!badge) return null;
  const tone = SOURCE_BADGE_TONES[badge] ?? "neutral";
  return (
    <Badge tone={tone} className={className}>
      {badge}
    </Badge>
  );
}
