"use client";

import { useRouter } from "next/navigation";
import { FunnelSimple, MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Choice, Input, Select } from "@/components/ui/field";
import { Drawer, DrawerHeader } from "@/components/ui/drawer";
import {
  activeChips,
  activeFilterCount,
  filterHref,
  SORT_OPTIONS,
  toggleValue,
  type FilterState,
  type SortKey,
} from "@/lib/filters";
import { filterGroups } from "@/lib/products";
import { productCount } from "@/lib/format";
import { cn } from "@/lib/utils";

type Counts = Record<string, Record<string, number>>;

/**
 * Filters apply the moment they are touched. There is no confirm button: the
 * URL is the state, so every change is shareable, back-button-correct and
 * server-rendered on reload.
 */
export function FilterControls({
  state,
  counts,
  total,
  base = "/produkti",
}: {
  state: FilterState;
  counts: Counts;
  total: number;
  base?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState(state.q ?? "");
  const [syncedQuery, setSyncedQuery] = useState(state.q ?? null);

  /* The URL is the source of truth: a back button, a cleared chip or a new
     category has to be able to overwrite whatever is sitting in the field.
     Adjusted during render against the previous value rather than from an
     effect — `react-hooks/set-state-in-effect` is enforced here. */
  if (syncedQuery !== (state.q ?? null)) {
    setSyncedQuery(state.q ?? null);
    setQuery(state.q ?? "");
  }

  const go = (next: FilterState) => {
    startTransition(() => router.push(filterHref(next, base), { scroll: false }));
  };

  const chips = activeChips(state);
  const activeCount = activeFilterCount(state);

  return (
    <>
      <div className="border-b border-border pb-4">
        {/* Searching within the listing, rather than only from the header
            dialog: someone already browsing a category expects to narrow it
            here. Submitting writes `q` into the URL like every other filter,
            so the result is server-rendered and shareable. */}
        <form
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            go({ ...state, q: query.trim() || null });
          }}
          className="flex justify-end"
        >
          <div className="relative w-full sm:w-72">
            <label htmlFor="listing-search" className="sr-only">
              Poiščite izdelek
            </label>
            <MagnifyingGlass
              size={16}
              weight="light"
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <Input
              id="listing-search"
              type="search"
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Poiščite izdelek"
              /* `type="search"` for the semantics and Escape-to-clear, minus
                 WebKit's own clear button, which would sit beside ours. */
              className="h-10 pl-9 pr-9 text-base [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  go({ ...state, q: null });
                }}
                aria-label="Počisti iskanje"
                className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted transition-colors hover:text-ink"
              >
                <X size={14} weight="bold" aria-hidden="true" />
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-base text-muted" aria-live="polite">
          {pending ? "Posodabljam…" : productCount(total)}
        </p>

        <div className="flex items-center gap-3">
          {/* This control only exists below lg, so it is sized for a thumb
              rather than for the desktop row it never appears in. */}
          <Button
            variant="secondary"
            size="md"
            className="lg:hidden"
            onClick={() => setSheetOpen(true)}
          >
            <FunnelSimple size={15} weight="light" aria-hidden="true" />
            Filtri
            {activeCount ? (
              <span className="ml-1 rounded-xs bg-violet-700 px-1.5 py-0.5 text-micro text-white">
                {activeCount}
              </span>
            ) : null}
          </Button>

          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="hidden text-small text-muted sm:block">
              Razvrsti
            </label>
            <Select
              id="sort"
              value={state.sort}
              onChange={(e) => go({ ...state, sort: e.target.value as SortKey })}
              className="h-11 w-auto min-w-[10.5rem] text-base lg:h-9"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
        </div>
      </div>

      {chips.length ? (
        <ul className="flex flex-wrap items-center gap-2 pt-4">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => go(chip.next)}
                className="inline-flex min-h-9 items-center gap-1.5 rounded border border-violet-200 bg-violet-50 pl-3 pr-2 text-small text-violet-800 transition-colors hover:border-violet-700"
              >
                {chip.label}
                <X size={13} weight="bold" aria-hidden="true" />
                <span className="sr-only">Odstrani filter</span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() =>
                go({ ...state, tip: [], stanje: [], starost: [], zaloga: false })
              }
              className="min-h-9 px-2 text-small text-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-ink"
            >
              Počisti vse
            </button>
          </li>
        </ul>
      ) : null}

      <Drawer
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        side="bottom"
        labelledBy="filter-sheet-title"
      >
        <DrawerHeader
          title="Filtri"
          id="filter-sheet-title"
          onClose={() => setSheetOpen(false)}
          hint={productCount(total)}
        />
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <FilterGroupsList state={state} counts={counts} onChange={go} />
        </div>
        <div className="safe-bottom border-t border-border px-5 pt-4">
          <Button variant="primary" size="lg" fullWidth onClick={() => setSheetOpen(false)}>
            Prikaži {productCount(total)}
          </Button>
        </div>
      </Drawer>
    </>
  );
}

/** Shared by the desktop rail and the mobile sheet so behaviour cannot drift. */
export function FilterGroupsList({
  state,
  counts,
  onChange,
}: {
  state: FilterState;
  counts: Counts;
  onChange: (next: FilterState) => void;
}) {
  const groups = [
    { key: "tip" as const, group: "tipKoze" as const, title: "Tip kože" },
    { key: "stanje" as const, group: "stanjeKoze" as const, title: "Kaj vas moti" },
    { key: "starost" as const, group: "starost" as const, title: "Starost" },
  ];

  return (
    <div className="grid gap-7">
      {groups.map(({ key, group, title }) => (
        <fieldset key={key}>
          <legend className="mb-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
            {title}
          </legend>
          <div className="grid">
            {filterGroups[group].map((option) => {
              const count = counts[key]?.[option.value] ?? 0;
              const checked = state[key].includes(option.value);
              return (
                <Choice
                  key={option.value}
                  label={option.label}
                  count={count}
                  checked={checked}
                  disabled={count === 0 && !checked}
                  onChange={() =>
                    onChange({ ...state, [key]: toggleValue(state[key], option.value) })
                  }
                />
              );
            })}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend className="mb-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
          Razpoložljivost
        </legend>
        <Choice
          label="Samo na zalogi"
          checked={state.zaloga}
          onChange={() => onChange({ ...state, zaloga: !state.zaloga })}
        />
      </fieldset>
    </div>
  );
}

/** Desktop rail. Sticky so filters stay reachable in a long listing. */
export function FilterRail({
  state,
  counts,
  base = "/produkti",
}: {
  state: FilterState;
  counts: Counts;
  base?: string;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  return (
    <aside
      aria-label="Filtri"
      className={cn(
        "hidden lg:block",
        "sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pr-2"
      )}
    >
      <FilterGroupsList
        state={state}
        counts={counts}
        onChange={(next) =>
          startTransition(() => router.push(filterHref(next, base), { scroll: false }))
        }
      />
    </aside>
  );
}
