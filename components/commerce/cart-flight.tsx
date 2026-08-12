"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { useCart } from "@/lib/cart";
import { playCartDrop } from "@/lib/sfx";

const DURATION = 0.95;
/** Points sampled along the parabola. Enough that the joins are invisible. */
const STEPS = 24;
const TIMES = Array.from({ length: STEPS + 1 }, (_, i) => i / STEPS);

/**
 * The product's photograph thrown into the basket.
 *
 * The path is a real parabola, not an eased tween. x runs at a constant rate
 * while y follows a quadratic sampled at `STEPS` points and played back
 * linearly — so the curve is continuous the whole way, including through the
 * apex. Driving y with three keyframes and an easeOut/easeIn pair, as an
 * earlier version did, puts a visible corner at the top of the shot.
 *
 * Apex height scales with how far the ball travels *sideways*, because that is
 * what makes a lob look like one; a near-vertical throw from a sticky footer
 * button gets a shallow rise instead of a pointless loop. It is then clamped
 * into the viewport, without which a basket near the top of the screen sends
 * the apex above it and the ball simply vanishes for half its flight.
 *
 * The layer sits on `z-toast`, above the sticky header. That token only
 * started generating a rule once the layer scale was declared as utilities in
 * globals.css; before that this element had `z-index: auto` and the header
 * painted straight over the ball.
 *
 * The layer is inert and hidden from assistive technology: the cart itself
 * updates on click, and the change is announced from the shell.
 */
export function CartFlight() {
  const { flights, landFlight } = useCart();
  /**
   * `onAnimationComplete` fires for the exit fade as well as the throw, so a
   * bare handler lands every flight twice — the sound played as a double hit
   * and the basket bounced twice. Ids are one-way, so remembering the landed
   * ones is enough; the set is only ever added to within a session.
   */
  const landed = useRef(new Set<number>());

  const land = (id: number) => {
    if (landed.current.has(id)) return;
    landed.current.add(id);
    playCartDrop();
    landFlight(id);
  };

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-toast">
      <AnimatePresence>
        {flights.map((flight) => {
          const { from, to, size } = flight;
          const half = size / 2;
          const y0 = from.y - half;
          const y1 = to.y - half;

          const rise = Math.min(220, 60 + Math.abs(to.x - from.x) * 0.55);
          /* Top of the ball stays a comfortable margin inside the viewport. */
          const peak = Math.max(half + 20, Math.min(from.y, to.y) - rise) - half;
          /* Bézier control that puts the curve's midpoint exactly on `peak`. */
          const control = 2 * peak - 0.5 * (y0 + y1);
          const ys = TIMES.map(
            (t) => (1 - t) ** 2 * y0 + 2 * t * (1 - t) * control + t ** 2 * y1
          );

          return (
            <motion.div
              key={flight.id}
              className="absolute left-0 top-0 will-change-transform"
              style={{ width: size, height: size }}
              initial={{ x: from.x - half, y: y0, scale: 0.5, rotate: -12, opacity: 0 }}
              animate={{
                x: to.x - half,
                y: ys,
                scale: [0.5, 1, 1, 0.16],
                rotate: 38,
                opacity: [0, 1, 1, 0.75],
              }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{
                x: { duration: DURATION, ease: "linear" },
                y: { duration: DURATION, times: TIMES, ease: "linear" },
                scale: {
                  duration: DURATION,
                  times: [0, 0.14, 0.62, 1],
                  ease: ["easeOut", "linear", "easeIn"],
                },
                rotate: { duration: DURATION, ease: "linear" },
                opacity: { duration: DURATION, times: [0, 0.08, 0.84, 1], ease: "linear" },
              }}
              onAnimationComplete={() => land(flight.id)}
            >
              {/* A white disc with a violet rim. The packshots are pale on a
                  pale ground, so without the rim the ball disappears against
                  the page for most of its flight. */}
              <div className="relative h-full w-full overflow-hidden rounded-full bg-white shadow-overlay ring-2 ring-violet-700/40">
                <Image src={flight.src} alt="" fill sizes="96px" className="object-contain p-2" />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
