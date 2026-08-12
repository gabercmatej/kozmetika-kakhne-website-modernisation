"use client";

import Link from "next/link";
import { CaretDown, MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { plural, productCount } from "@/lib/format";
import { cn, fold } from "@/lib/utils";

/**
 * Compact wire form. The page builds this on the server; sending whole products
 * would put a slice of the 470 KB catalogue on a page that needs two fields of
 * it, so products are listed once and referenced by position.
 */
export type IngredientIndexData = {
  products: { slug: string; name: string }[];
  ingredients: { key: string; name: string; folded: string; products: number[] }[];
};

/** Enough to show the range's shape without turning the page into a list. */
const PREVIEW = 18;

export function IngredientIndex({ data }: { data: IngredientIndexData }) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const needle = fold(query.trim());

  const matches = useMemo(
    () => (needle ? data.ingredients.filter((i) => i.folded.includes(needle)) : data.ingredients),
    [data.ingredients, needle]
  );

  /* A search shows everything it found; only the unsearched list is truncated,
     and typing must never hide a match behind a "show all" button. */
  const visible = needle || showAll ? matches : matches.slice(0, PREVIEW);
  const hidden = matches.length - visible.length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <label htmlFor="inci-search" className="sr-only">
            Poiščite sestavino
          </label>
          <MagnifyingGlass
            size={16}
            weight="light"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <Input
            id="inci-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Npr. glycerin, parfum, alcohol"
            className="h-10 pl-9 pr-9 text-base [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Počisti iskanje"
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:text-ink"
            >
              <X size={14} weight="bold" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <p className="text-base text-muted" aria-live="polite">
          {matches.length === data.ingredients.length
            ? `${data.ingredients.length} ${plural(data.ingredients.length, ["sestavina", "sestavini", "sestavine", "sestavin"])}`
            : `${matches.length} ${plural(matches.length, ["zadetek", "zadetka", "zadetki", "zadetkov"])}`}
        </p>
      </div>

      {visible.length ? (
        <ul className="mt-8 border-t border-border">
          {visible.map((item) => {
            const open = expanded === item.key;
            return (
              <li key={item.key} className="border-b border-border">
                <h3>
                  <button
                    type="button"
                    onClick={() => setExpanded(open ? null : item.key)}
                    aria-expanded={open}
                    aria-controls={`inci-${item.key}`}
                    className="group flex w-full items-baseline gap-3 py-4 text-left transition-colors hover:text-violet-700"
                  >
                    <span className="flex-1 text-base font-medium text-ink transition-colors group-hover:text-violet-700">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-small tabular-nums text-faint">
                      {productCount(item.products.length)}
                    </span>
                    <CaretDown
                      size={14}
                      weight="bold"
                      aria-hidden="true"
                      className={cn(
                        "shrink-0 self-center text-muted transition-transform duration-200",
                        open && "rotate-180"
                      )}
                    />
                  </button>
                </h3>

                {open ? (
                  <ul id={`inci-${item.key}`} className="flex flex-wrap gap-x-2 gap-y-2 pb-5">
                    {item.products.map((index) => {
                      const product = data.products[index];
                      return (
                        <li key={product.slug}>
                          <Link
                            href={`/produkt/${product.slug}`}
                            className="inline-flex rounded-full border border-border-control px-3 py-1.5 text-small text-muted transition-colors hover:border-violet-700 hover:text-violet-700"
                          >
                            {product.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-8 border-t border-border pt-6 text-base text-muted">
          Sestavine <strong className="font-medium text-ink">{query.trim()}</strong> ni na nobenem
          seznamu, ki ga objavljamo. Seznami so prepisani z embalaže posameznega izdelka.
        </p>
      )}

      {hidden > 0 ? (
        <Button variant="secondary" size="sm" className="mt-6" onClick={() => setShowAll(true)}>
          Pokažite vseh {matches.length}{" "}
          {plural(matches.length, ["sestavino", "sestavini", "sestavine", "sestavin"])}
        </Button>
      ) : null}
    </div>
  );
}
