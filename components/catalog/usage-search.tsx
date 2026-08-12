"use client";

import { useRouter } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/field";
import { plural } from "@/lib/format";

const BASE = "/prirocnik/navodila-za-uporabo";

/**
 * The manual's search box, and nothing else.
 *
 * The instructions themselves are ~60 KB of the shop's own markup. Filtering
 * them in the browser would mean shipping all of it a second time inside the
 * flight payload to hide most of it, so the query lives in the URL and the
 * route filters on the server — the same division `filter-controls.tsx` makes
 * for the catalogue, and it leaves a searched manual linkable.
 */
export function UsageSearch({ q, total }: { q: string | null; total: number }) {
  const router = useRouter();
  const [query, setQuery] = useState(q ?? "");
  const [pending, startTransition] = useTransition();

  const go = (value: string) => {
    const next = value.trim();
    startTransition(() => {
      router.push(next ? `${BASE}?q=${encodeURIComponent(next)}` : BASE, { scroll: false });
    });
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        go(query);
      }}
    >
      <div className="relative">
        <label htmlFor="usage-search" className="sr-only">
          Poiščite izdelek
        </label>
        <MagnifyingGlass
          size={16}
          weight="light"
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <Input
          id="usage-search"
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Poiščite izdelek"
          className="h-10 pl-9 pr-9 text-base [&::-webkit-search-cancel-button]:appearance-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              go("");
            }}
            aria-label="Počisti iskanje"
            className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:text-ink"
          >
            <X size={14} weight="bold" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <p className="mt-2.5 text-small text-muted" aria-live="polite">
        {pending
          ? "Iščem…"
          : q
            ? `${total} ${plural(total, ["zadetek", "zadetka", "zadetki", "zadetkov"])}`
            : `${total} ${plural(total, ["navodilo", "navodili", "navodila", "navodil"])}`}
      </p>
    </form>
  );
}
