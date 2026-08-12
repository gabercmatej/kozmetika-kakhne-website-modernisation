"use client";

import Link from "next/link";
import { ArrowRight, CaretDown, EnvelopeSimple, Phone, User } from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Drawer, DrawerHeader } from "@/components/ui/drawer";
import { NAV } from "@/lib/nav";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Two levels only. Deeper nesting on a phone costs more taps than it saves,
 * so each top-level item expands in place rather than pushing a new panel.
 */
export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState<string | null>(NAV[0].label);

  return (
    <Drawer open={open} onClose={onClose} side="right" labelledBy="mobile-nav-title">
      <DrawerHeader title="Meni" id="mobile-nav-title" onClose={onClose} />

      <nav aria-label="Mobilna navigacija" className="flex-1 overflow-y-auto overscroll-contain">
        <ul className="divide-y divide-border">
          {NAV.map((item) => {
            const isOpen = expanded === item.label;
            if (!item.groups) {
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className="flex min-h-14 items-center px-5 text-body font-medium text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.label}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setExpanded(isOpen ? null : item.label)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left text-body font-medium text-ink"
                >
                  {item.label}
                  <CaretDown
                    size={16}
                    weight="light"
                    aria-hidden="true"
                    className={cn(
                      "text-muted transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
                {isOpen ? (
                  <div className="bg-surface/60 px-5 pb-5">
                    {item.groups.map((group) => (
                      <div key={group.title} className="pt-4">
                        <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
                          {group.title}
                        </p>
                        <ul className="grid">
                          {group.links.map((link) => (
                            <li key={link.href + link.label}>
                              <Link
                                href={link.href}
                                onClick={onClose}
                                className="flex min-h-11 items-center text-base text-ink-soft"
                              >
                                {link.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {item.feature ? (
                      <Link
                        href={item.feature.href}
                        onClick={onClose}
                        className="mt-4 flex items-center justify-between gap-3 bg-violet-900 px-4 py-3.5 text-base font-medium text-white"
                      >
                        {item.feature.cta}
                        <ArrowRight size={15} weight="bold" aria-hidden="true" className="text-gold-500" />
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="safe-bottom border-t border-border px-5 pt-3 text-small text-muted">
        <Link
          href="/prijava"
          onClick={onClose}
          className="flex min-h-11 items-center gap-2 font-medium text-ink"
        >
          <User size={17} weight="light" aria-hidden="true" className="text-violet-700" />
          Moj račun
        </Link>
        <a href={site.contact.phoneHref} className="flex min-h-11 items-center gap-2 text-ink">
          <Phone size={17} weight="light" aria-hidden="true" className="text-violet-700" />
          {site.contact.phone}
        </a>
        <a
          href={`mailto:${site.contact.email}`}
          className="flex min-h-11 items-center gap-2 break-all"
        >
          <EnvelopeSimple size={17} weight="light" aria-hidden="true" className="shrink-0 text-violet-700" />
          {site.contact.email}
        </a>
      </div>
    </Drawer>
  );
}
