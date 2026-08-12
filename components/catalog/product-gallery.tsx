"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ProductImage } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Thumbnails are real buttons in a tablist, so the gallery is fully keyboard
 * operable. The main image crossfades rather than sliding, which keeps the
 * product still while the frame changes.
 *
 * The frame is also swipeable, because on a phone the thumbnail strip sits
 * below the fold of the image it controls and swiping the photograph is what
 * a shopper tries first. Dragging never moves the image: the gesture only
 * chooses, and the same crossfade plays as on a thumbnail tap, so the two
 * inputs cannot look like two different galleries.
 */
export function ProductGallery({
  images,
  alt,
  badge,
  mark,
}: {
  images: ProductImage[];
  alt: string;
  badge?: React.ReactNode;
  /** Corner mark opposite the badge, used for the reduction on an offer. */
  mark?: React.ReactNode;
}) {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const current = images[index];

  if (!images.length) {
    return <div className="aspect-[4/5] w-full bg-surface" aria-hidden="true" />;
  }

  const step = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row-reverse sm:gap-4">
      <div className={cn("relative flex-1 overflow-hidden", current.fit === "cover" ? "bg-surface" : "bg-white")}>
        <motion.div
          className="relative aspect-[4/5] w-full touch-pan-y"
          drag={images.length > 1 && !reduce ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.08}
          dragMomentum={false}
          onDragEnd={(_event, info) => {
            if (info.offset.x < -60 || info.velocity.x < -400) step(1);
            else if (info.offset.x > 60 || info.velocity.x > 400) step(-1);
          }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={current.src}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <Image
                src={current.src}
                alt={index === 0 ? alt : `${alt}, slika ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 46vw, 92vw"
                className={cn(
                  current.fit === "cover" ? "object-cover" : "object-contain p-4 sm:p-8"
                )}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        {badge ? <div className="absolute left-4 top-4">{badge}</div> : null}
        {mark ? <div className="absolute right-4 top-4">{mark}</div> : null}

        {/* Counter, touch only. It is what makes the swipe discoverable — the
            thumbnail strip is the same signal on desktop, but on a phone it
            sits below the fold of the frame it belongs to. Hidden from
            assistive tech: the alt text already says which frame this is. */}
        {images.length > 1 ? (
          <p
            aria-hidden="true"
            className="absolute bottom-3 right-3 rounded-full bg-white/85 px-2.5 py-1 text-micro tabular-nums text-ink-soft shadow-subtle backdrop-blur-[2px] sm:hidden"
          >
            {index + 1} / {images.length}
          </p>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Slike izdelka"
          onKeyDown={onKeyDown}
          className="flex gap-2 overflow-x-auto sm:w-20 sm:shrink-0 sm:flex-col sm:overflow-visible"
        >
          {images.map((image, i) => (
            <button
              key={image.src}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Prikaži sliko ${i + 1} od ${images.length}`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => setIndex(i)}
              className={cn(
                "relative aspect-square w-16 shrink-0 overflow-hidden border bg-white transition-colors sm:w-full",
                i === index ? "border-violet-700" : "border-border hover:border-border-strong"
              )}
            >
              <Image
                src={image.src}
                alt=""
                fill
                sizes="80px"
                className={image.fit === "cover" ? "object-cover" : "object-contain p-1.5"}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
