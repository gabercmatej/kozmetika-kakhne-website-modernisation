import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The type scale uses named sizes (text-body, text-hero, ...). Without this
 * registration tailwind-merge classifies them as text *colours* and silently
 * drops any preceding colour, which is how `text-white` disappeared from the
 * primary button and left near-black text on violet. Every custom scale that
 * shares a utility prefix has to be declared here.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "micro",
            "small",
            "body",
            "lead",
            "title",
            "h3",
            "h2",
            "h1",
            "hero",
          ],
        },
      ],
      shadow: [{ shadow: ["subtle", "card", "raised", "overlay"] }],
      rounded: [{ rounded: ["xs", "sm", "md", "lg"] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Diacritic-insensitive comparison key, so "sipek" finds "šipek". */
export function fold(value: string): string {
  return value
    .toLocaleLowerCase("sl")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

/** Deterministic shuffle so server and client agree on "featured" ordering. */
export function seededPick<T>(items: T[], count: number, seed: number): T[] {
  const pool = [...items];
  const out: T[] = [];
  let state = seed;
  while (pool.length && out.length < count) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    out.push(pool.splice(state % pool.length, 1)[0]);
  }
  return out;
}
