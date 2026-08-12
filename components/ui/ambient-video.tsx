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

  /*
   * Graded so the clip reads *through* the section's scrim without becoming a
   * bright spot in it. Those are two different problems and only contrast
   * solves both.
   *
   * Brightness cannot: the clip's own mean is rgb(176,182,188), already
   * brighter than the ground the band paints behind it, so raising brightness
   * only pushes it further away. At the 1.55 this once carried, every channel
   * clipped to 255 — a 102-point error against the ground — and the clip
   * showed up as a white disc floating in the middle of a dark violet band,
   * flat inside because everything above the clip point had been crushed
   * together.
   *
   * So brightness is pulled *down* to sit the mean on the ground's tone, and
   * contrast is doubled to carry the detail that brightness is no longer
   * providing. Measured on the composited page: the clip's centre reads
   * rgb(57,40,73) against a ground of rgb(53,35,69) — a delta of four, below
   * the threshold where an edge is visible — while its luminance range stays
   * at 241 of 255, so the bottle and its label are as legible as before.
   *
   * Applied to the poster as well as the video, or the section would step a
   * shade at the moment playback starts.
   */
  const grade = { filter: "brightness(0.66) saturate(1.1) contrast(2.1)" } as const;

  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)} style={feather}>
      <div
        className={cn(
          "absolute inset-0 bg-center bg-no-repeat",
          fit === "contain" ? "bg-contain" : "bg-cover"
        )}
        style={{ backgroundImage: `url(${poster})`, ...grade }}
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
          style={grade}
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
