"use client";

import { X } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useHydrated } from "@/lib/use-client-only";
import { cn } from "@/lib/utils";

type Side = "right" | "bottom";

/**
 * Modal drawer with focus trapping, scroll locking, Escape to close and focus
 * restoration. Used for the cart, the mobile navigation and the mobile filter
 * sheet so all three behave identically.
 *
 * The whole overlay is rendered into `document.body` through a portal, and
 * that is load-bearing rather than tidiness. `position: fixed` is resolved
 * against the nearest ancestor carrying a filter, transform or
 * `backdrop-filter` — not against the viewport — and the header this drawer
 * is invoked from is exactly such an ancestor: it is `backdrop-blur-md`. The
 * mobile navigation was therefore laid out inside the header's own 93px box,
 * so tapping the hamburger produced a drawer squashed into the top strip of
 * the page with its contents spilling down unclipped. Portalling out of that
 * subtree is the only fix that does not require every future caller to know
 * which ancestors are safe to sit under.
 */
export function Drawer({
  open,
  onClose,
  side = "right",
  labelledBy,
  children,
  backdrop,
  className,
}: {
  open: boolean;
  onClose: () => void;
  side?: Side;
  labelledBy: string;
  children: React.ReactNode;
  /**
   * Decoration drawn over the scrim but under the panel. It exists so a layer
   * can sit inside the drawer's stacking context without being dimmed by the
   * scrim or painted over the panel — neither of which is expressible from
   * outside, because the whole drawer is one stacking context.
   */
  backdrop?: React.ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;

    const { body, documentElement: root } = document;
    const previousOverflow = body.style.overflow;
    const previousRootOverflow = root.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;
    /* Locked at both levels. `overflow: hidden` on the body alone leaves the
       page behind a drawer scrollable in mobile Safari, which on a phone is
       the difference between a modal and a panel that drifts away under the
       thumb. Locking the root instead of switching the body to `position:
       fixed` keeps the scroll offset — and with it the sticky header, which a
       fixed body would drop back to its document position mid-transition,
       visibly, through the drawer's own translucent scrim. */
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    const timer = window.setTimeout(() => focusables()[0]?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      /* `preventScroll` because the control being returned to may now be
         off-screen — the trigger for the filter sheet often is — and the
         default would yank the listing to it on every close. */
      restoreRef.current?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  const enter =
    side === "right" ? { x: 0 } : { y: 0 };
  const exit =
    side === "right" ? { x: "100%" } : { y: "100%" };

  if (!hydrated) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-drawer">
          <motion.button
            type="button"
            aria-label="Zapri"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 h-full w-full cursor-default bg-violet-950/45 backdrop-blur-[2px]"
          />
          {backdrop}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            initial={reduce ? { opacity: 0 } : exit}
            animate={reduce ? { opacity: 1 } : enter}
            exit={reduce ? { opacity: 0 } : exit}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute bg-paper shadow-overlay",
              side === "right"
                ? "inset-y-0 right-0 flex w-full max-w-[26rem] flex-col"
                : "inset-x-0 bottom-0 flex max-h-[86dvh] flex-col rounded-t-lg",
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

export function DrawerHeader({
  title,
  id,
  onClose,
  hint,
}: {
  title: string;
  id: string;
  onClose: () => void;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h2 id={id} className="font-sans text-body font-medium text-ink">
          {title}
        </h2>
        {hint ? <p className="mt-0.5 text-small text-muted">{hint}</p> : null}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Zapri"
        className="-m-2 flex h-11 w-11 items-center justify-center rounded text-muted transition-colors hover:bg-surface hover:text-ink"
      >
        <X size={20} weight="light" aria-hidden="true" />
      </button>
    </div>
  );
}
