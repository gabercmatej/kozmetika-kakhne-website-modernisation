"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { useClientFlag } from "@/lib/use-client-only";
import { cn } from "@/lib/utils";

/**
 * A decorative texture layer, never content. It is deliberately skipped when
 * it would cost more than it gives: under reduced motion, on narrow screens,
 * and when the connection reports save-data. In all of those cases the poster
 * still renders, so the section never looks empty.
 *
 * The layer carries no scrim of its own — the section it sits in owns that, so
 * a video band and a photographic band can share one recipe and read as the
 * same surface. What it does own is the edge treatment: the clip is contained
 * rather than cropped, and a radial mask fades it out well before its frame,
 * so there is no rectangle to spot against the flat ground.
 */
export function AmbientVideo({
  srcMp4,
  srcWebm,
  poster,
  className,
  fit = "cover",
}: {
  srcMp4: string;
  srcWebm: string;
  poster: string;
  className?: string;
  fit?: "cover" | "contain";
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);

  const affordable = useClientFlag(() => {
    const wide = window.matchMedia("(min-width: 768px)").matches;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
    ).connection;
    const cheap = !connection?.saveData && !/2g/.test(connection?.effectiveType ?? "");
    return wide && cheap;
  });

  const play = affordable && !reduce;

  useEffect(() => {
    if (!play) return;
    const node = ref.current;
    if (!node) return;
    /* Autoplay can still be refused; the poster underneath covers that. */
    void node.play().catch(() => undefined);
  }, [play]);

  /*
   * The ellipse radii are 60% of the box, which puts the box's own half-width
   * at roughly 83% along the ramp — past the last stop. That is what makes the
   * layer reach zero *before* its frame rather than at it. Radii near 100%
   * leave about half the alpha standing at the edge, which is exactly the
   * visible rectangle this mask exists to remove.
   */
  const stops = "#000 0%, rgb(0 0 0 / 0.55) 45%, transparent 80%";
  const feather = {
    maskImage: `radial-gradient(60% 60% at 50% 50%, ${stops})`,
    WebkitMaskImage: `radial-gradient(60% 60% at 50% 50%, ${stops})`,
  } as const;

  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)} style={feather}>
      <div
        className={cn(
          "absolute inset-0 bg-center bg-no-repeat",
          fit === "contain" ? "bg-contain" : "bg-cover"
        )}
        style={{ backgroundImage: `url(${poster})` }}
      />
      {play ? (
        <video
          ref={ref}
          muted
          loop
          playsInline
          preload="none"
          poster={poster}
          tabIndex={-1}
          className={cn(
            "absolute inset-0 h-full w-full",
            fit === "contain" ? "object-contain" : "object-cover"
          )}
        >
          <source src={srcWebm} type="video/webm" />
          <source src={srcMp4} type="video/mp4" />
        </video>
      ) : null}
    </div>
  );
}
