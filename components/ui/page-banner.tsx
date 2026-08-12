import Image from "next/image";
import type { ReactNode } from "react";
import { Breadcrumbs } from "./misc";
import { PetalMark } from "./mark";
import { cn } from "@/lib/utils";
import type { ProductImage as ProductImageData } from "@/lib/types";

/**
 * The photographic band that opens a standalone page.
 *
 * It reuses the homepage hero's composition rather than inventing a second
 * one: copy on a tinted ground and the photograph bled to the right viewport
 * edge. Pages that carry a banner drop their own paper-ground header — the band
 * owns the breadcrumbs, the heading and the lead, which is what stops these
 * routes opening on a bare line of type over empty paper.
 *
 * Unlike the hero, the photograph meets the copy on a clean edge. The hero
 * feathers that seam because its picture changes underneath fixed type and the
 * dissolve keeps the join from flickering; a page banner is a still frame, and
 * a crisp edge there reads as deliberate rather than as a gradient nobody
 * asked for. The fade is the carousel's, not the house style's.
 *
 * The ground is `surface` rather than `paper` so the band separates from the
 * page body below it without the page changing temperature. A dark section
 * dropped into the middle of a light storefront reads as an accident; a
 * neighbouring tone from the same family reads as structure.
 *
 * Copy comes first in the DOM so breadcrumbs stay the first thing a screen
 * reader or a narrow viewport meets. The rail only leaves the flow from lg up,
 * where there is room to place it beside the copy instead of above it.
 */
export function PageBanner({
  crumbs,
  eyebrow,
  title,
  intro,
  action,
  visual,
  focal = "50% 50%",
  tall = false,
  frame = "cover",
  priority = true,
}: {
  crumbs: { label: string; href?: string }[];
  eyebrow: string;
  title: string;
  intro: ReactNode;
  action?: ReactNode;
  /**
   * Null is a supported state, not a bug: the campaign photography is scraped,
   * so a re-scrape can retire the image a page names. The band then falls back
   * to full-width copy on the tinted ground rather than reserving an empty
   * frame.
   */
  visual: ProductImageData | null;
  /** Where the photograph is anchored while it is cropped to the rail. */
  focal?: string;
  /**
   * Holds the band open, for a picture that needs height rather than width.
   * The copy centres in the taller band instead of stranding itself at the top
   * of it.
   */
  tall?: boolean;
  /**
   * Shows the whole picture instead of filling the rail with it.
   *
   * `cover` is right for landscape campaign photography, where the rail crops
   * the edges off a wide frame and loses nothing. It is wrong for a portrait:
   * the rail is a fixed 46% of the viewport, so a 2:3 picture is scaled until
   * its *width* matches and the head then overflows the band by several hundred
   * pixels. No focal point rescues that — anchor high and it cuts the chin,
   * anchor low and it takes the top of the head off, and either way the face is
   * enlarged to fill 660px. Contained, the picture sits whole on the same
   * tinted ground the copy is on, which reads as a portrait placed on the page
   * rather than as a photograph that did not fit.
   */
  frame?: "cover" | "contain";
  priority?: boolean;
}) {
  const contained = frame === "contain";

  return (
    <section className="relative isolate overflow-hidden bg-surface">
      <div className="page-container relative">
        {/* Capped short of half the container so the copy can never run under
            the rail, which is measured against the viewport rather than the
            container and is therefore always the wider of the two. */}
        <div
          className={cn(
            "py-10 lg:py-20 xl:py-24",
            visual && "lg:w-[calc(54%-3rem)]",
            tall && "lg:flex lg:min-h-[32rem] lg:flex-col lg:justify-center"
          )}
        >
          <Breadcrumbs items={crumbs} />

          <p className="mt-6 flex items-center gap-2 text-small font-semibold uppercase tracking-[0.14em] text-gold-700">
            <PetalMark className="h-3 w-3 text-gold-500" />
            {eyebrow}
          </p>

          <h1 className="mt-3 text-h1 text-balance">{title}</h1>

          <div className="mt-4 max-w-xl text-lead text-muted text-pretty">{intro}</div>

          {action ? <div className="mt-8 flex flex-wrap gap-3">{action}</div> : null}
        </div>
      </div>

      {/* A band under the copy on narrow screens, the right edge of the section
          from lg up. */}
      {visual ? (
      <div className="relative lg:absolute lg:inset-y-0 lg:right-0 lg:w-[46%]">
        <div
          className={cn(
            "relative",
            contained
              ? "h-[20rem] sm:h-[26rem] lg:h-full"
              : "aspect-[16/9] sm:aspect-[5/2] lg:aspect-auto lg:h-full"
          )}
        >
          <Image
            src={visual.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 48vw, 100vw"
            priority={priority}
            /* A contained picture is not cropped, so there is nothing for a
               focal point to choose. It is anchored to the right instead, so it
               still meets the viewport edge the way every other band does and
               the slack falls between the copy and the picture, where it reads
               as spacing rather than as a photograph that stopped short. Below
               lg the rail is full width and it simply centres. */
            className={
              contained ? "object-contain object-center lg:object-right" : "object-cover"
            }
            style={contained ? undefined : { objectPosition: focal }}
          />
        </div>
      </div>
      ) : null}
    </section>
  );
}
