import { cn } from "@/lib/utils";

/**
 * The four-petal device from the Kahne wordmark, redrawn as a vector so it can
 * scale and inherit colour. Used as a quiet section marker and as the heritage
 * seal, never as a decorative blob.
 */
export function PetalMark({ className, ...rest }: { className?: string } & React.SVGProps<SVGSVGElement>) {
  const petal =
    "M50 50 C50 30 44 12 30 8 C14 3 4 14 6 28 C9 44 28 50 50 50 Z";
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      focusable="false"
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      {...rest}
    >
      {[0, 90, 180, 270].map((deg) => (
        <path key={deg} d={petal} transform={`rotate(${deg} 50 50)`} />
      ))}
    </svg>
  );
}

/**
 * "19 87" set as the source site sets it on product pages, rebuilt as a
 * typographic seal rather than an image.
 */
export function HeritageSeal({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-px font-display text-title leading-none text-gold-700",
        className
      )}
    >
      <span aria-hidden="true">19</span>
      <span aria-hidden="true">87</span>
      <span className="sr-only">Od leta 1987</span>
    </span>
  );
}
