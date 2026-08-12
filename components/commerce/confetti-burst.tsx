"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

/** Brand violets only, light enough to read against the dimmed page. */
const COLOURS = ["#46166b", "#57228a", "#6b3a96", "#8a5cb8", "#b79ad0", "#d8c9e4"];

const COUNT = 110;
const GRAVITY = 0.34;
const DRAG = 0.992;

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  colour: string;
  /** Spin about the piece's own axis, faked into 3D by squashing its width. */
  spin: number;
  spinRate: number;
  tilt: number;
  tiltRate: number;
};

/**
 * A single burst fired from behind the basket panel when it opens on an add.
 *
 * The cannon sits inside the panel's own footprint on the right, and this
 * layer paints under the panel, so pieces are hidden until they clear its left
 * edge — they appear to be thrown out from behind the drawer rather than
 * spawning in mid-air.
 *
 * Drawn on a canvas rather than as elements: a hundred spinning rectangles as
 * DOM nodes would cost a hundred composited layers for under two seconds of
 * animation. The loop ends itself once every piece has left the viewport, so
 * nothing keeps running behind the open drawer.
 *
 * Pieces are rectangles whose width is scaled by the cosine of their spin,
 * which reads as paper flipping edge-on rather than as a sprite rotating flat.
 */
export function ConfettiBurst() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const random = (min: number, max: number) => min + Math.random() * (max - min);

    /* Fired from behind the panel on the right, aimed up and across the page.
       The panel is at most 26rem wide, so the cannon stays within it. */
    const origin = width - Math.min(416, width) * 0.55;

    const pieces: Piece[] = Array.from({ length: COUNT }, () => {
      const speed = random(12, 26);
      const angle = random(-1.16, -0.16); // radians from horizontal, upwards
      return {
        x: origin + random(-70, 70),
        y: random(height * 0.4, height * 0.95),
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        w: random(5, 13),
        h: random(7, 18),
        colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
        spin: random(0, Math.PI * 2),
        spinRate: random(0.12, 0.3) * (Math.random() < 0.5 ? -1 : 1),
        tilt: random(0, Math.PI * 2),
        tiltRate: random(-0.06, 0.06),
      };
    });

    let frame = 0;
    let alive = true;

    const step = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, width, height);
      let visible = 0;

      for (const p of pieces) {
        p.vx *= DRAG;
        p.vy = p.vy * DRAG + GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.spin += p.spinRate;
        p.tilt += p.tiltRate;

        if (p.x < -60 || p.y > height + 60) continue;
        visible++;

        const squash = Math.cos(p.spin);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.tilt);
        ctx.globalAlpha = 0.55 + Math.abs(squash) * 0.45;
        ctx.fillStyle = p.colour;
        ctx.fillRect((-p.w * squash) / 2, -p.h / 2, p.w * squash, p.h);
        ctx.restore();
      }

      /* A grace period so pieces still climbing are not mistaken for spent. */
      if (visible === 0 && frame > 40) return;
      frame++;
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
    return () => {
      alive = false;
    };
  }, [reduce]);

  if (reduce) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
