"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * True only after hydration. Using a store subscription rather than
 * setState-in-an-effect means the value is correct on the very first client
 * render and never triggers a cascading re-render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

/**
 * Evaluates a browser-only predicate once hydrated. `compute` must return a
 * primitive, because useSyncExternalStore requires a stable snapshot.
 */
export function useClientFlag(compute: () => boolean): boolean {
  return useSyncExternalStore(noopSubscribe, compute, () => false);
}
