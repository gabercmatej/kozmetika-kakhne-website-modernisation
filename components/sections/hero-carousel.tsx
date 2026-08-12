"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { PetalMark } from "@/components/ui/mark";
import { formatPrice } from "@/lib/format";
import type { ProductImage as ProductImageData } from "@/lib/types";
import { cn } from "@/lib/utils";

export type HeroSlide = {
  id: string;
  eyebrow: string;
  titleTop: string;
  titleAccent: string;
  body: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  visual: ProductImageData;
  /**
   * Where the photograph is anchored while it is cropped to the rail. The
   * campaign photography is composed for a wide banner, so a plain centre crop
   * would cut a face or a product out of several frames; each slide names its
   * own focal point instead of relying on one global guess.
   */
  focal?: string;
  /**
   * How the photograph meets its frame. Lifestyle banners are cropped to fill
   * (`cover`). The two studio campaigns are shot on pure white, so cropping
   * them into a near-square rail magnifies a wide composition until the
   * subjects run off both edges; those are shown whole (`contain`) on a white
   * ground, which their own background merges into invisibly.
   */
  frame?: "cover" | "contain";
  chip: { name: string; price: number | null; href: string };
};

/**
 * The progress bar *is* the timer. Each slide's bar fills from empty over
 * DWELL_SECONDS and the slide advances on that animation completing, rather
 * than on a separate interval — so what the visitor watches filling and what
 * decides the change are the same thing, and they cannot drift apart.
 */
const DWELL_SECONDS = 5;
const DISSOLVE_SECONDS = 0.62;
/**
 * A settling beat before the bar starts filling, held whenever the visitor's
 * attention has just landed or been redirected: first paint, and every manual
 * change. It is not applied between automatic advances — once the cycle is
 * running, an empty bar sitting still for two seconds reads as a stall.
 */
const LEAD_IN_SECONDS = 2;

/**
 * The one carousel on the site, replacing the source homepage's stack of
 * ten autoplaying banners with a handful of curated campaigns.
 *
 * Composition is an editorial split rather than a card: the campaign
 * photograph is a full-height rail bled to the right viewport edge, and the
 * copy sits on paper beside it. An earlier version floated a small packshot
 * inside a white panel, which made the shop's own photography read as a
 * thumbnail; these are the same photographs the live site publishes, shown at
 * the size they were shot for.
 *
 * The rail is positioned rather than laid out in the grid so the copy column
 * can never collide with it: copy is capped at `calc(50% - 3rem)` of the
 * container, which is always narrower than the viewport's own 50%.
 *
 * Mechanics chosen for smoothness over spectacle: every slide stays mounted
 * in one grid cell (images never re-decode mid-transition), the crossfade
 * drifts a few pixels in the direction of travel, and the whole stage is
 * draggable with an elastic snap.
 *
 * Autoplay is driven by the progress bar's own animation, so the thing being
 * watched and the thing keeping time are the same object and cannot drift
 * apart. Each turn holds for a beat, fills over the dwell, then advances; the
 * hold is repeated after every manual change, so arriving on the page and
 * taking the arrows behave identically. It runs continuously otherwise —
 * pausing on hover and stopping on interaction both made the rail look broken
 * — and yields only to focus inside the carousel and to reduced motion.
 */
export function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const reduce = useReducedMotion();
  /**
   * The whole carousel position is one value.
   *
   * `index` and `prev` travel together because the dissolve has to know which
   * slide is being replaced; splitting that across two state updates would let
   * the pair disagree for a frame, long enough to show the wrong photograph
   * underneath the one fading in.
   *
   * `lead` and `cycle` drive the timer. `lead` marks a change the visitor
   * caused — and the first paint, which is the visitor arriving — so the bar
   * can hold before it starts filling. `cycle` only ever increments, so the
   * bar's key changes even when the same slide is chosen twice and the fill
   * restarts instead of sitting still.
   */
  const [{ index, prev, direction, lead, cycle }, setPosition] = useState({
    index: 0,
    prev: 0,
    direction: 1,
    lead: true,
    cycle: 0,
  });
  const [focused, setFocused] = useState(false);

  const go = useCallback(
    (next: number, dir: number, manual = false) => {
      setPosition((current) => {
        const target = ((next % slides.length) + slides.length) % slides.length;
        /* Re-selecting the current slide by hand still restarts the timer;
           only a no-op automatic tick is dropped. */
        if (target === current.index && !manual) return current;
        return {
          index: target,
          prev: current.index,
          direction: dir,
          lead: manual,
          cycle: current.cycle + 1,
        };
      });
    },
    [slides.length]
  );

  /**
   * Autoplay runs unconditionally except under reduced motion and while focus
   * is inside the carousel — a keyboard visitor part-way through the controls
   * should not have the slide move out from under them. It deliberately does
   * *not* pause on hover and is not cancelled by using the arrows: both of
   * those made the rail look broken, because the pointer rests over the hero
   * most of the time and one arrow click used to stop the cycle for good.
   */
  const autoplaying = !reduce && !focused;

  /* The copy stack keeps the drifting cross-fade. It is type on paper, so the
     two states may overlap for a moment without muddying anything, and the
     few pixels of travel are what give the change its direction. */
  const copyCell = (i: number) => ({
    initial: false as const,
    animate: {
      opacity: i === index ? 1 : 0,
      x: reduce ? 0 : i === index ? 0 : direction >= 0 ? -48 : 48,
    },
    transition: {
      opacity: { duration: reduce ? 0 : 0.5, ease: "linear" as const },
      x: { duration: reduce ? 0 : 0.9, ease: [0.16, 1, 0.3, 1] as const },
    },
  });

  /**
   * The photographs get a true cross-dissolve rather than two fades crossing.
   * Fading both at once drops each to roughly half opacity at the midpoint,
   * and because they share one grid cell the paper ground shows through the
   * pair — a visible blink towards the background halfway through every
   * change, which is the opposite of a dissolve.
   *
   * So the outgoing frame is held at full opacity underneath and only the
   * arriving one fades up over it. Ordering is explicit because DOM order
   * would otherwise put slide six on top of slide one. Anything that is
   * neither arriving nor leaving is dropped instantly; it sits under an opaque
   * frame, so there is nothing to see.
   *
   * No horizontal drift here either: translating the cell would slide its own
   * edge off the photograph beneath and expose the section ground. The slow
   * scale on the image is what carries the movement instead.
   */
  const railCell = (i: number) => {
    const arriving = i === index;
    const leaving = i === prev && i !== index;
    return {
      initial: false as const,
      animate: { opacity: arriving || leaving ? 1 : 0 },
      transition: {
        duration: reduce || !(arriving || leaving) ? 0 : DISSOLVE_SECONDS,
        ease: "linear" as const,
      },
      style: { zIndex: arriving ? 2 : leaving ? 1 : 0 },
    };
  };

  return (
    <section
      role="region"
      aria-roledescription="vrtiljak"
      aria-label="Predstavljeno"
      className="relative isolate overflow-hidden bg-paper"
      /* Keyboard focus only. A mouse click on an arrow also focuses it, so
         reacting to plain focus meant every click through the controls parked
         the cycle for good — the exact stall this rework set out to remove.
         `:focus-visible` is the browser's own answer to "did they arrive here
         by keyboard", so the pause lands for the visitor who needs it and is
         invisible to the one clicking. */
      onFocusCapture={(e) => {
        if ((e.target as HTMLElement).matches(":focus-visible")) setFocused(true);
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      <motion.div
        drag={reduce ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.16}
        dragTransition={{ bounceStiffness: 260, bounceDamping: 30 }}
        onDragEnd={(_e, info) => {
          if (info.offset.x < -70 || info.velocity.x < -500) go(index + 1, 1, true);
          else if (info.offset.x > 70 || info.velocity.x > 500) go(index - 1, -1, true);
        }}
        className={cn("relative", !reduce && "lg:cursor-grab lg:active:cursor-grabbing")}
      >
        {/* Photography rail: a band above the copy on narrow screens, the
            right half of the section from lg up. It is raised above the copy
            column because the column's box spans the full width; without this
            it would sit over the rail and swallow the product link's clicks. */}
        <div className="relative z-10 grid lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          {slides.map((slide, i) => (
            <motion.div
              key={slide.id}
              aria-hidden={i !== index}
              inert={i !== index}
              {...railCell(i)}
              className="relative [grid-area:1/1] aspect-[16/11] sm:aspect-[2/1] lg:aspect-auto lg:h-full"
            >
              <div
                className={cn(
                  "absolute inset-0 overflow-hidden",
                  slide.frame === "contain" ? "bg-white" : "bg-surface"
                )}
              >
                <Image
                  src={slide.visual.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 52vw, 100vw"
                  priority={i === 0}
                  className={cn(
                    "transition-transform duration-[1600ms] ease-[var(--ease-out-soft)]",
                    slide.frame === "contain" ? "object-contain" : "object-cover",
                    i === index ? "scale-100" : "motion-safe:scale-[1.06]"
                  )}
                  style={{ objectPosition: slide.focal ?? "50% 50%" }}
                />
              </div>

              {/* The opening slide alone dissolves into the page: it is the
                  frame the visitor lands on, and softening that first seam is
                  what stops the split reading as two pasted halves. Every
                  slide after it meets the copy on a clean edge — by the time
                  they arrive the composition has already been established, and
                  repeating the gradient six times turned an accent into a
                  mannerism.

                  The middle stop is what makes the fade read as a dissolve; a
                  plain two-stop ramp falls off evenly and leaves the start of
                  the gradient visible as a band of its own.

                  `bottom-auto` used to sit alongside `h-auto` here, which gave
                  the box a content height of zero from lg up and drew nothing
                  at all. Both offsets have to stay pinned for it to stretch. */}
              {i === 0 ? (
                <div
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-14",
                    "bg-gradient-to-t from-paper via-paper/45 to-transparent",
                    "lg:inset-y-0 lg:right-auto lg:h-auto lg:w-20 lg:bg-gradient-to-r xl:w-28"
                  )}
                />
              ) : null}

              {/* Anchored to the outer edge of the photograph. */}
              <Link
                href={slide.chip.href}
                tabIndex={i === index ? 0 : -1}
                className={cn(
                  "group absolute inset-x-4 bottom-4 flex items-center justify-between gap-4",
                  "border border-border bg-paper px-5 py-4 shadow-overlay",
                  "transition-[border-color,transform] duration-300 hover:border-violet-700",
                  "sm:inset-x-auto sm:right-6 sm:w-[21rem]",
                  "lg:bottom-10 lg:right-10 lg:hover:-translate-y-1",
                  i !== index && "pointer-events-none"
                )}
              >
                <span className="min-w-0">
                  <span className="block text-micro uppercase tracking-[0.1em] text-gold-700">
                    Iz te zgodbe
                  </span>
                  <span className="mt-1 block truncate font-display text-title leading-tight text-ink">
                    {slide.chip.name}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2 border-l border-border pl-4 text-base font-medium tabular-nums text-ink">
                  {formatPrice(slide.chip.price)}
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className="text-violet-700 transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="page-container relative">
          <div className="grid lg:w-[calc(50%-3rem)]">
            {slides.map((slide, i) => {
              const active = i === index;
              const Heading = i === 0 ? "h1" : "h2";
              return (
                <motion.div
                  key={slide.id}
                  role="group"
                  aria-roledescription="stran"
                  aria-label={`${i + 1} od ${slides.length}: ${slide.eyebrow}`}
                  aria-hidden={!active}
                  inert={!active}
                  {...copyCell(i)}
                  className={cn(
                    "[grid-area:1/1] min-w-0 pb-9 pt-12 lg:py-24 xl:py-28",
                    !active && "pointer-events-none select-none"
                  )}
                >
                  <p className="mb-4 flex items-center gap-2 text-small font-semibold uppercase tracking-[0.14em] text-gold-700">
                    <PetalMark className="h-3 w-3 text-gold-500" />
                    {slide.eyebrow}
                  </p>
                  <Heading className="text-hero font-normal leading-[1.08] text-balance">
                    {slide.titleTop}{" "}
                    <span className="block pb-1 font-semibold text-violet-700">
                      {slide.titleAccent}
                    </span>
                  </Heading>
                  <p className="mt-6 max-w-md text-lead text-muted text-pretty">{slide.body}</p>
                  <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <ButtonLink href={slide.primary.href} size="lg" tabIndex={active ? 0 : -1}>
                      {slide.primary.label}
                      <ArrowRight size={17} weight="bold" aria-hidden="true" />
                    </ButtonLink>
                    {slide.secondary ? (
                      <ButtonLink
                        href={slide.secondary.href}
                        variant="secondary"
                        size="lg"
                        tabIndex={active ? 0 : -1}
                      >
                        {slide.secondary.label}
                      </ButtonLink>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Controls: arrows, per-slide progress, counter. Interacting with any
              of them hands control to the visitor and ends autoplay. They are
              held to the copy column so they never sit under the rail. */}
          <div className="flex items-center gap-4 pb-12 sm:gap-5 lg:w-[calc(50%-3rem)] lg:pb-20">
            {/* The arrows are a pointer affordance. On a phone the stage is
                already swipeable and every slide is one tap away on the bar
                below, and keeping them cost 94px of a 280px row — which is
                what squeezed each progress bar down to 12px wide, half of
                WCAG 2.5.8's 24px floor. They return at sm. */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <button
                type="button"
                onClick={() => go(index - 1, -1, true)}
                aria-label="Prejšnja zgodba"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-control bg-white text-ink transition-all duration-200 hover:border-violet-700 hover:text-violet-700 active:scale-95"
              >
                <CaretLeft size={16} weight="bold" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => go(index + 1, 1, true)}
                aria-label="Naslednja zgodba"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border-control bg-white text-ink transition-all duration-200 hover:border-violet-700 hover:text-violet-700 active:scale-95"
              >
                <CaretRight size={16} weight="bold" aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-1 items-center gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => go(i, i > index ? 1 : -1, true)}
                  aria-label={`Pojdi na zgodbo ${i + 1}: ${slide.eyebrow}`}
                  aria-current={i === index ? "true" : undefined}
                  /* Taller hit area on touch; the drawn line stays 2px either
                     way, so this is reach, not weight. */
                  className="group/bar relative h-11 flex-1 sm:h-6"
                >
                  <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 overflow-hidden rounded-full bg-border-strong transition-colors group-hover/bar:bg-violet-200">
                    {i === index ? (
                      autoplaying ? (
                        <motion.span
                          /* Keyed on the cycle, not the index: choosing the
                             slide that is already showing has to restart the
                             fill, and an index-based key would not change. */
                          key={`fill-${cycle}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: DWELL_SECONDS,
                            delay: lead ? LEAD_IN_SECONDS : 0,
                            ease: "linear",
                          }}
                          onAnimationComplete={() => go(index + 1, 1)}
                          className="absolute inset-y-0 left-0 bg-violet-700"
                        />
                      ) : (
                        <span className="absolute inset-0 bg-violet-700" />
                      )
                    ) : null}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-small tabular-nums text-muted">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </p>
          </div>
        </div>
      </motion.div>

      <p aria-live="polite" className="sr-only">
        {slides[index].eyebrow}: {slides[index].titleTop} {slides[index].titleAccent}
      </p>
    </section>
  );
}
