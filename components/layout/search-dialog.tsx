"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ClockCounterClockwise, MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { displayName, formatPrice } from "@/lib/format";
import { SEARCH_SUGGESTIONS, searchIndex, type SearchEntry } from "@/lib/search";
import { cn } from "@/lib/utils";

const RECENT_KEY = "kahne.iskanje.v1";
const MAX_RECENT = 5;

const GROUP_LABEL: Record<SearchEntry["kind"], string> = {
  product: "Izdelki",
  advice: "Nasveti strokovnjakov",
  article: "Aktualno",
};

/** Module-level cache so the index is fetched once per session. */
let cachedIndex: SearchEntry[] | null = null;

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState<SearchEntry[]>(cachedIndex ?? []);
  const [indexFailed, setIndexFailed] = useState(false);
  /* Derived rather than stored, so the effect never writes state synchronously. */
  const loadingIndex = open && index.length === 0 && !indexFailed;
  const router = useRouter();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);

  const results = useMemo(() => searchIndex(index, query), [index, query]);

  const grouped = useMemo(() => {
    const order: SearchEntry["kind"][] = ["product", "advice", "article"];
    return order
      .map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) }))
      .filter((g) => g.items.length);
  }, [results]);

  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  /* Recent searches are read lazily on first render on the client. The
     initialiser only runs once, so there is no effect and no extra render. */
  const [recentLoaded, setRecentLoaded] = useState(false);
  if (typeof window !== "undefined" && !recentLoaded) {
    setRecentLoaded(true);
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw) as string[]);
    } catch {
      /* no stored history is fine */
    }
  }

  /* Highlight resets whenever the query changes. */
  const [lastQuery, setLastQuery] = useState(query);
  if (query !== lastQuery) {
    setLastQuery(query);
    setActive(0);
  }

  const commit = useCallback(
    (term: string) => {
      const next = [term, ...recent.filter((r) => r !== term)].slice(0, MAX_RECENT);
      setRecent(next);
      try {
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
    },
    [recent]
  );

  /* The index is ~130 KB, so it is fetched the first time search opens
     rather than shipped with every page. */
  useEffect(() => {
    if (!open || cachedIndex) return;
    let cancelled = false;
    fetch("/api/iskanje")
      .then((r) => r.json())
      .then((data: SearchEntry[]) => {
        cachedIndex = data;
        if (!cancelled) setIndex(data);
      })
      .catch(() => {
        if (!cancelled) setIndexFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (!open) inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i + 1) % flat.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (flat.length ? (i - 1 + flat.length) % flat.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[active];
      if (target) {
        commit(query);
        onClose();
        router.push(target.href);
      } else if (query.trim().length >= 2) {
        commit(query);
        onClose();
        router.push(`/produkti?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-overlay">
          <motion.button
            type="button"
            aria-label="Zapri iskanje"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 h-full w-full cursor-default bg-violet-950/45 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Iskanje po trgovini"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-0 mx-auto flex max-h-[88dvh] w-full max-w-3xl flex-col bg-paper shadow-overlay sm:top-[6vh] sm:rounded-lg"
          >
            <div className="flex items-center gap-3 border-b border-border px-4 sm:px-5">
              <MagnifyingGlass size={20} weight="light" aria-hidden="true" className="shrink-0 text-muted" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Poiščite izdelek ali opišite težavo"
                aria-label="Iskalni niz"
                aria-controls="search-results"
                className="h-16 flex-1 bg-transparent text-lead text-ink placeholder:text-faint focus:outline-none [&::-webkit-search-cancel-button]:appearance-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Zapri iskanje"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-surface hover:text-ink"
              >
                <X size={18} weight="light" aria-hidden="true" />
              </button>
            </div>

            <div id="search-results" className="flex-1 overflow-y-auto overscroll-contain">
              {query.trim().length < 2 ? (
                <div className="grid gap-6 p-5">
                  {recent.length ? (
                    <div>
                      <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
                        Nedavno iskano
                      </p>
                      <ul className="flex flex-wrap gap-2">
                        {recent.map((term) => (
                          <li key={term}>
                            <button
                              type="button"
                              onClick={() => setQuery(term)}
                              className="inline-flex min-h-9 items-center gap-1.5 rounded border border-border bg-white px-3 text-small text-ink-soft transition-colors hover:border-violet-700 hover:text-violet-700"
                            >
                              <ClockCounterClockwise size={13} weight="light" aria-hidden="true" />
                              {term}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div>
                    <p className="mb-2 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
                      Pogosto iskano
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {SEARCH_SUGGESTIONS.map((s) => (
                        <li key={s.href}>
                          <Link
                            href={s.href}
                            onClick={onClose}
                            className="inline-flex min-h-9 items-center rounded border border-border bg-white px-3 text-small text-ink-soft transition-colors hover:border-violet-700 hover:text-violet-700"
                          >
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : loadingIndex ? (
                <p role="status" className="px-5 py-12 text-center text-base text-muted">
                  Nalagam izdelke…
                </p>
              ) : flat.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="font-display text-h3 text-ink">Ni zadetkov za “{query}”</p>
                  <p className="mx-auto mt-2 max-w-sm text-base text-muted">
                    Poskusite z imenom izdelka ali s tem, kar vas na koži moti, na primer “gube”
                    ali “suha koža”.
                  </p>
                  <ul className="mt-5 flex flex-wrap justify-center gap-2">
                    {SEARCH_SUGGESTIONS.slice(0, 4).map((s) => (
                      <li key={s.href}>
                        <Link
                          href={s.href}
                          onClick={onClose}
                          className="inline-flex min-h-9 items-center rounded border border-border bg-white px-3 text-small transition-colors hover:border-violet-700 hover:text-violet-700"
                        >
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="pb-2">
                  {grouped.map((group) => (
                    <div key={group.kind}>
                      <p className="px-5 pb-1 pt-4 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
                        {GROUP_LABEL[group.kind]}
                      </p>
                      <ul>
                        {group.items.map((entry) => {
                          const index = flat.indexOf(entry);
                          const isActive = index === active;
                          return (
                            <li key={entry.kind + entry.slug}>
                              <Link
                                href={entry.href}
                                onClick={() => {
                                  commit(query);
                                  onClose();
                                }}
                                onMouseEnter={() => setActive(index)}
                                aria-current={isActive ? "true" : undefined}
                                className={cn(
                                  "flex items-center gap-3 px-5 py-2.5 transition-colors",
                                  isActive ? "bg-violet-50" : "hover:bg-surface"
                                )}
                              >
                                {entry.image ? (
                                  <span className="relative h-12 w-10 shrink-0 overflow-hidden bg-surface">
                                    <Image
                                      src={entry.image}
                                      alt=""
                                      fill
                                      sizes="40px"
                                      className="object-cover"
                                    />
                                  </span>
                                ) : (
                                  <span className="flex h-12 w-10 shrink-0 items-center justify-center bg-surface text-faint">
                                    <MagnifyingGlass size={14} weight="light" aria-hidden="true" />
                                  </span>
                                )}
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-base font-medium text-ink">
                                    {entry.kind === "product"
                                      ? displayName(entry.title)
                                      : entry.title}
                                  </span>
                                  <span className="block truncate text-small text-muted">
                                    {entry.meta}
                                  </span>
                                </span>
                                {entry.price != null ? (
                                  <span className="shrink-0 text-base tabular-nums">
                                    {entry.listPrice != null ? (
                                      <s className="mr-1.5 text-small text-faint">
                                        {formatPrice(entry.listPrice)}
                                      </s>
                                    ) : null}
                                    <span
                                      className={
                                        entry.listPrice != null
                                          ? "font-medium text-violet-700"
                                          : "text-ink"
                                      }
                                    >
                                      {formatPrice(entry.price)}
                                    </span>
                                  </span>
                                ) : null}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}

                  <Link
                    href={`/produkti?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => {
                      commit(query);
                      onClose();
                    }}
                    className="mt-2 flex min-h-12 items-center justify-between gap-2 border-t border-border px-5 text-base font-medium text-violet-700 transition-colors hover:bg-violet-50"
                  >
                    Prikaži vse zadetke za “{query.trim()}”
                    <ArrowRight size={15} weight="bold" aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
