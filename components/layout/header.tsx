"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Basket, List, MagnifyingGlass, User } from "@phosphor-icons/react/dist/ssr";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { NAV } from "@/lib/nav";
import { CART_TARGET_ATTR, useCart } from "@/lib/cart";
import { productCount } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MegaMenuPanel } from "./mega-menu";
import { MobileNav } from "./mobile-nav";

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const pathname = usePathname();
  const { count, landings, openDrawer } = useCart();
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [condensed, setCondensed] = useState(false);
  const closeTimer = useRef<number | undefined>(undefined);
  const panelId = useId();

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setCondensed(y > 24));

  /* Navigation closes on route change. Adjusting during render rather than in
     an effect avoids a second render pass with the menu still open. */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenItem(null);
    setMobileOpen(false);
  }

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const scheduleClose = useCallback(() => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenItem(null), 140);
  }, []);

  const cancelClose = useCallback(() => window.clearTimeout(closeTimer.current), []);

  const activeItem = NAV.find((n) => n.label === openItem && n.groups);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-paper/95 backdrop-blur-md transition-[border-color,box-shadow] duration-300",
        condensed ? "border-border shadow-subtle" : "border-transparent"
      )}
      onMouseLeave={scheduleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpenItem(null);
      }}
    >
      <div className="page-container">
        {/* Shorter on a phone. At the desktop 92px the header plus the
            announcement strip above it spent 148px — nearly a fifth of a
            390×844 screen — before the first product was visible. Desktop
            keeps its own proportions from md up. */}
        <div
          className={cn(
            "flex items-center justify-between gap-3 transition-[height] duration-300 sm:gap-4",
            condensed ? "h-[60px] md:h-[76px]" : "h-[72px] md:h-[92px]"
          )}
        >
          <Link href="/" className="shrink-0" aria-label="Kozmetika Kahne, domov">
            <Image
              src="/brand/kahne-logo.png"
              alt="Kozmetika Kahne"
              width={354}
              height={206}
              priority
              className={cn(
                "w-auto transition-[height] duration-300",
                condensed ? "h-9 md:h-11" : "h-11 md:h-14"
              )}
            />
          </Link>

          <nav aria-label="Glavna navigacija" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const isOpen = openItem === item.label;
                const isActive = pathname === item.href;
                return (
                  <li key={item.label}>
                    {/* Every label is a real link: clicking "Trgovina" goes
                        straight to /produkti instead of only opening a panel
                        that repeats the same destination. The mega menu opens
                        on hover, or with ArrowDown for keyboard users. */}
                    <Link
                      href={item.href}
                      aria-expanded={item.groups ? isOpen : undefined}
                      aria-controls={item.groups && isOpen ? panelId : undefined}
                      onMouseEnter={() => {
                        cancelClose();
                        setOpenItem(item.groups ? item.label : null);
                      }}
                      onKeyDown={(e) => {
                        if (item.groups && e.key === "ArrowDown") {
                          e.preventDefault();
                          setOpenItem(item.label);
                        }
                      }}
                      className={cn(
                        "relative rounded px-3.5 py-2 text-body font-semibold tracking-[-0.005em] transition-colors duration-200",
                        isOpen || isActive ? "text-violet-700" : "text-ink hover:text-violet-700"
                      )}
                    >
                      {item.label}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-x-3.5 bottom-0 h-0.5 origin-left rounded-full bg-violet-700 transition-transform duration-300 ease-[var(--ease-out-soft)]",
                          isOpen || isActive ? "scale-x-100" : "scale-x-0"
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Iskanje po trgovini"
              className="flex h-11 w-11 items-center justify-center rounded text-ink transition-colors hover:bg-surface hover:text-violet-700"
            >
              <MagnifyingGlass size={20} weight="light" aria-hidden="true" />
            </button>

            {/* Shown at every width. It used to start at sm, which meant the
                account disappeared on exactly the devices most likely to be
                signing in to check an order. */}
            <Link
              href="/prijava"
              aria-label="Prijava in moj račun"
              className="flex h-11 w-11 items-center justify-center rounded text-ink transition-colors hover:bg-surface hover:text-violet-700"
            >
              <User size={20} weight="light" aria-hidden="true" />
            </Link>

            {/* The flight overlay aims at this element, and the basket takes
                the impact: it compresses, springs back and rings once. */}
            <motion.button
              type="button"
              onClick={openDrawer}
              {...{ [CART_TARGET_ATTR]: "" }}
              /* Same hover as search and account. The basket used to warm to
                 the success green on hover, which read as a status the control
                 was not reporting — green is the confirmation colour, and it
                 fired on pointing rather than on anything succeeding. */
              className="relative flex h-11 w-11 items-center justify-center rounded text-ink transition-colors hover:bg-surface hover:text-violet-700"
              aria-label={count > 0 ? `Košarica, ${productCount(count)}` : "Košarica, prazna"}
              animate={landings ? { scale: [1, 0.78, 1.18, 1] } : { scale: 1 }}
              transition={{ duration: 0.5, times: [0, 0.22, 0.55, 1], ease: "easeOut" }}
            >
              <Basket size={20} weight="light" aria-hidden="true" />
              {landings ? (
                <motion.span
                  key={landings}
                  aria-hidden="true"
                  initial={{ opacity: 0.55, scale: 0.6 }}
                  animate={{ opacity: 0, scale: 1.9 }}
                  transition={{ duration: 0.55, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full border-2 border-violet-500"
                />
              ) : null}
              {count > 0 ? (
                <motion.span
                  key={`count-${count}`}
                  aria-hidden="true"
                  initial={landings ? { scale: 0.5 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 520, damping: 18 }}
                  className="absolute right-1 top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-semibold leading-none text-white tabular-nums"
                >
                  {count}
                </motion.span>
              ) : null}
            </motion.button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Odpri meni"
              className="flex h-11 w-11 items-center justify-center rounded text-ink transition-colors hover:bg-surface lg:hidden"
            >
              <List size={22} weight="light" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {activeItem ? (
        <div onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
          <MegaMenuPanel
            item={activeItem}
            id={panelId}
            onNavigate={() => setOpenItem(null)}
          />
        </div>
      ) : null}

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
