"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Entry motion for sections and grids: opacity plus a short translate, once,
 * on scroll into view.
 *
 * The component type never changes between the server and client render.
 * Swapping a `motion.div` for a plain `div` once reduced motion is detected
 * leaves React unable to clear the server-rendered `opacity: 0` inline style,
 * which hides the content permanently for exactly the users who asked for
 * less movement. Motion stays in control in both cases and `initial={false}`
 * simply starts at the visible state.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -60px 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Staggered variant for grids; the parent orchestrates, children inherit. */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      initial={reduce ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ visible: { transition: { staggerChildren: reduce ? 0 : stagger } } }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      variants={{
        hidden: { opacity: reduce ? 1 : 0, y: reduce ? 0 : 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: reduce ? { duration: 0 } : { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </Component>
  );
}
