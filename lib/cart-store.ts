import type { CartLine } from "./types";

const STORAGE_KEY = "kahne.kosarica.v1";

type Listener = () => void;

const listeners = new Set<Listener>();

/**
 * The cart is a module-level store rather than component state so it can be
 * read with useSyncExternalStore. That keeps server and client renders
 * consistent without writing state from inside an effect, and lets any
 * component subscribe without prop drilling.
 *
 * getSnapshot must be referentially stable between changes, so the snapshot is
 * cached and only replaced when the cart actually mutates.
 */
let snapshot: CartLine[] = [];
let hydrated = false;

const EMPTY: CartLine[] = [];

function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is CartLine =>
        typeof l === "object" &&
        l !== null &&
        typeof (l as CartLine).slug === "string" &&
        Number.isFinite((l as CartLine).quantity)
    )
    .map((l) => ({ slug: l.slug, quantity: Math.min(99, Math.max(1, Math.round(l.quantity))) }));
}

function readStorage(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function persist(lines: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* private mode: the cart still works for the session */
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: Listener): () => void {
  /* First subscriber pulls the persisted cart in; this happens during
     subscription, not during render, so hydration stays clean. */
  if (!hydrated) {
    hydrated = true;
    const stored = readStorage();
    if (stored.length) snapshot = stored;
  }

  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = sanitize(event.newValue ? JSON.parse(event.newValue) : []);
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export const getSnapshot = (): CartLine[] => snapshot;

/** The server has no cart; always the same reference so hydration matches. */
export const getServerSnapshot = (): CartLine[] => EMPTY;

export const isHydrated = () => hydrated;

function commit(next: CartLine[]) {
  snapshot = next;
  persist(next);
  emit();
}

export function addLine(slug: string, quantity = 1) {
  const existing = snapshot.find((l) => l.slug === slug);
  commit(
    existing
      ? snapshot.map((l) =>
          l.slug === slug ? { ...l, quantity: Math.min(99, l.quantity + quantity) } : l
        )
      : [...snapshot, { slug, quantity: Math.min(99, Math.max(1, quantity)) }]
  );
}

export function addLines(slugs: string[]) {
  const next = snapshot.map((l) => ({ ...l }));
  for (const slug of slugs) {
    const existing = next.find((l) => l.slug === slug);
    if (existing) existing.quantity = Math.min(99, existing.quantity + 1);
    else next.push({ slug, quantity: 1 });
  }
  commit(next);
}

export function setLineQuantity(slug: string, quantity: number) {
  commit(
    quantity <= 0
      ? snapshot.filter((l) => l.slug !== slug)
      : snapshot.map((l) => (l.slug === slug ? { ...l, quantity: Math.min(99, quantity) } : l))
  );
}

export function removeLine(slug: string) {
  commit(snapshot.filter((l) => l.slug !== slug));
}

export function clearLines() {
  commit([]);
}
