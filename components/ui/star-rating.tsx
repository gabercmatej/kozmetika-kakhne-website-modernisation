import { cn } from "@/lib/utils";

const STAR =
  "M12 2.4l2.7 6 6.5.7-4.9 4.4 1.4 6.4L12 16.6 6.3 19.9l1.4-6.4L2.8 9.1l6.5-.7z";

/**
 * Fractional fill via a clip, so 4.8 reads as 4.8 rather than rounding to 5.
 * The label is always rendered for assistive technology.
 */
export function StarRating({
  value,
  max = 5,
  size = 16,
  label,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  label?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / max)) * 100;
  const id = `stars-${String(value).replace(".", "-")}-${size}`;

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size * max}
        height={size}
        viewBox={`0 0 ${24 * max} 24`}
        aria-hidden="true"
        focusable="false"
        className="shrink-0"
      >
        <defs>
          <clipPath id={id}>
            <rect x="0" y="0" width={`${(pct / 100) * 24 * max}`} height="24" />
          </clipPath>
        </defs>
        <g fill="currentColor" className="text-border-strong">
          {Array.from({ length: max }, (_, i) => (
            <path key={i} d={STAR} transform={`translate(${i * 24} 0)`} />
          ))}
        </g>
        <g fill="currentColor" className="text-gold-500" clipPath={`url(#${id})`}>
          {Array.from({ length: max }, (_, i) => (
            <path key={i} d={STAR} transform={`translate(${i * 24} 0)`} />
          ))}
        </g>
      </svg>
      <span className="sr-only">
        {label ?? `Ocena ${value.toLocaleString("sl-SI")} od ${max}`}
      </span>
    </span>
  );
}
