"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import * as store from "./cart-store";
import { primeCartSound } from "./sfx";
import type { CartLine, Product } from "./types";

export type CartItem = { product: Product; quantity: number; lineTotal: number };

/**
 * One product in flight between the button that was pressed and the basket in
 * the header. Coordinates are viewport-relative and are measured once, on the
 * click, so the arc cannot drift if the page reflows behind it.
 */
export type CartFlightState = {
  id: number;
  src: string;
  size: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
};

type CartContextValue = {
  lines: CartLine[];
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  drawerOpen: boolean;
  lastAdded: Product | null;
  add: (product: Product, quantity?: number, origin?: HTMLElement | null) => void;
  addMany: (products: Product[], origin?: HTMLElement | null) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Screen-reader announcement for the most recent cart change. */
  announcement: string;
  /** Products currently arcing towards the basket. */
  flights: CartFlightState[];
  /** Increments each time one lands, so the basket can react. */
  landings: number;
  landFlight: (id: number) => void;
  /** True when the drawer was opened by an add rather than by the visitor. */
  openedByAdd: boolean;
  /**
   * Counts adds only. The celebration is keyed on this rather than on `count`,
   * which also moves when a line is removed or its quantity is lowered — and
   * emptying a basket is not a thing to throw confetti at.
   */
  adds: number;
};

/** Where the basket sits. Set on the header button, read when a flight starts. */
export const CART_TARGET_ATTR = "data-cart-target";

const centreOf = (el: Element) => {
  const rect = el.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  children,
  catalogue,
}: {
  children: React.ReactNode;
  catalogue: Product[];
}) {
  const lines = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<Product | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [flights, setFlights] = useState<CartFlightState[]>([]);
  const [landings, setLandings] = useState(0);
  const [openedByAdd, setOpenedByAdd] = useState(false);
  const [adds, setAdds] = useState(0);
  const flightId = useRef(1);

  const bySlug = useMemo(() => new Map(catalogue.map((p) => [p.slug, p])), [catalogue]);

  const items = useMemo<CartItem[]>(
    () =>
      lines
        .map((line) => {
          const product = bySlug.get(line.slug);
          if (!product) return null;
          return {
            product,
            quantity: line.quantity,
            lineTotal: (product.price ?? 0) * line.quantity,
          };
        })
        .filter((i): i is CartItem => i !== null),
    [lines, bySlug]
  );

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((n, i) => n + i.lineTotal, 0), [items]);

  /* True once the store has been subscribed to, which is also when the
     persisted cart has been read. Derived from the same subscription so it
     never needs to be written from an effect. */
  const ready = useSyncExternalStore(
    store.subscribe,
    store.isHydrated,
    () => false
  );

  /**
   * Sends the product's own photograph arcing from the pressed control into
   * the basket, and reports whether it managed to. The drawer is held back
   * until it lands: opening on click would slide the panel over the shot.
   *
   * It declines — and the caller opens the drawer immediately — when there is
   * nothing to throw, nowhere to throw it, or the visitor asked for reduced
   * motion.
   */
  const launch = useCallback((product: Product, origin?: HTMLElement | null) => {
    if (!origin || typeof window === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;

    const src = product.images[0]?.src;
    const basket = document.querySelector(`[${CART_TARGET_ATTR}]`);
    if (!src || !basket) return false;

    const from = centreOf(origin);
    const to = centreOf(basket);
    /* A shot that starts on top of the hoop has no arc to draw. */
    if (Math.hypot(to.x - from.x, to.y - from.y) < 80) return false;

    /* Audio has to be unlocked inside the gesture, not when the ball lands. */
    primeCartSound();

    const size = window.innerWidth < 640 ? 68 : 92;
    setFlights((current) => [...current, { id: flightId.current++, src, size, from, to }]);
    return true;
  }, []);

  const landFlight = useCallback((id: number) => {
    setFlights((current) => current.filter((f) => f.id !== id));
    setLandings((n) => n + 1);
    setDrawerOpen(true);
  }, []);

  const add = useCallback(
    (product: Product, quantity = 1, origin?: HTMLElement | null) => {
      store.addLine(product.slug, quantity);
      setLastAdded(product);
      setAnnouncement(`${product.name} dodano v košarico.`);
      setOpenedByAdd(true);
      setAdds((n) => n + 1);
      if (!launch(product, origin)) setDrawerOpen(true);
    },
    [launch]
  );

  const addMany = useCallback(
    (list: Product[], origin?: HTMLElement | null) => {
      if (!list.length) return;
      store.addLines(list.map((p) => p.slug));
      setLastAdded(list[0]);
      setAnnouncement(`${list.length} izdelkov dodanih v košarico.`);
      setOpenedByAdd(true);
      setAdds((n) => n + 1);
      if (!launch(list[0], origin)) setDrawerOpen(true);
    },
    [launch]
  );

  const setQuantity = useCallback((slug: string, quantity: number) => {
    store.setLineQuantity(slug, quantity);
    setAnnouncement(
      quantity <= 0 ? "Izdelek odstranjen iz košarice." : `Količina spremenjena na ${quantity}.`
    );
  }, []);

  const remove = useCallback((slug: string) => {
    store.removeLine(slug);
    setAnnouncement("Izdelek odstranjen iz košarice.");
  }, []);

  const clear = useCallback(() => {
    store.clearLines();
    setAnnouncement("Košarica je prazna.");
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      items,
      count,
      subtotal,
      ready,
      drawerOpen,
      lastAdded,
      add,
      addMany,
      setQuantity,
      remove,
      clear,
      openDrawer: () => {
        /* Opened deliberately, so nothing to celebrate. */
        setOpenedByAdd(false);
        setDrawerOpen(true);
      },
      closeDrawer: () => setDrawerOpen(false),
      announcement,
      flights,
      landings,
      landFlight,
      openedByAdd,
      adds,
    }),
    [
      lines,
      items,
      count,
      subtotal,
      ready,
      drawerOpen,
      lastAdded,
      add,
      addMany,
      setQuantity,
      remove,
      clear,
      announcement,
      flights,
      landings,
      landFlight,
      openedByAdd,
      adds,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart mora biti uporabljen znotraj CartProvider.");
  return ctx;
}
