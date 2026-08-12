"use client";

import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { NavItem } from "@/lib/nav";

/**
 * The panel is rendered by the header, which owns which item is open, so
 * moving between top-level items crossfades one panel instead of unmounting
 * and remounting several.
 */
export function MegaMenuPanel({
  item,
  onNavigate,
  id,
}: {
  item: NavItem;
  onNavigate: () => void;
  id: string;
}) {
  const reduce = useReducedMotion();
  const columns = item.groups?.length ?? 0;

  return (
    <AnimatePresence>
      <motion.div
        key={item.label}
        id={id}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 top-full border-b border-border bg-paper shadow-raised"
      >
        <div className="page-container py-10">
          <div
            className="grid gap-x-10 gap-y-8"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))${item.feature ? " minmax(0, 1.1fr)" : ""}`,
            }}
          >
            {item.groups?.map((group) => (
              <div key={group.title}>
                <p className="mb-4 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
                  {group.title}
                </p>
                <ul className="grid gap-0.5">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        onClick={onNavigate}
                        className="group/link -mx-2 block rounded px-2 py-1.5 transition-colors hover:bg-violet-50"
                      >
                        <span className="block text-base font-medium text-ink transition-colors group-hover/link:text-violet-700">
                          {link.label}
                        </span>
                        {link.note ? (
                          <span className="block text-small text-muted">{link.note}</span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {item.feature ? (
              <div className="flex flex-col justify-between gap-4 bg-violet-900 p-6 text-white">
                <div>
                  <p className="font-display text-h3 leading-tight text-white">
                    {item.feature.title}
                  </p>
                  <p className="mt-2 text-base text-violet-200">{item.feature.body}</p>
                </div>
                <Link
                  href={item.feature.href}
                  onClick={onNavigate}
                  className="inline-flex items-center gap-2 self-start border-b border-gold-500 pb-1 text-base font-medium text-gold-500 transition-colors hover:border-white hover:text-white"
                >
                  {item.feature.cta}
                  <ArrowRight size={15} weight="bold" aria-hidden="true" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
