import { cn } from "@/lib/utils";

/**
 * A Google Maps embed, boxed so it can never dictate the layout around it.
 *
 * The source site drops a raw `<iframe>` into its copy, which arrives at the
 * browser's default 300×150 and then stretches on its own terms. Here the frame
 * is absolutely filled inside a container the caller shapes, so the map takes
 * the aspect ratio it is given at every breakpoint and nothing reflows when it
 * finishes loading.
 *
 * `loading="lazy"` matters more than usual: this is a third-party frame that
 * pulls scripts and cookies from Google, and the map sits well below the fold
 * on every viewport. Deferring it keeps that off the initial load entirely.
 */
export function MapEmbed({
  src,
  title,
  className,
}: {
  src: string;
  /** Named for screen readers — an untitled frame is announced as "iframe". */
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden border border-border bg-surface", className)}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  );
}
