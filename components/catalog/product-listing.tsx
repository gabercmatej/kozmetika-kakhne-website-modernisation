import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs, EmptyState } from "@/components/ui/misc";
import { ProductGrid } from "@/components/commerce/product-card";
import { FilterControls, FilterRail } from "@/components/catalog/filter-controls";
import { applyFilters, type FilterState } from "@/lib/filters";
import { categories, filterGroups } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * The shop view, shared by `/produkti` and `/znizano`.
 *
 * Reductions used to have a page of their own with its own header and summary
 * figures, which meant clicking "Znižano" in the category rail dropped the
 * visitor out of the listing they were browsing — no filters, no sort, no way
 * back except the breadcrumb. It is the same view over a smaller set of
 * products, so it is now the same component: `scope` narrows what can be shown
 * and `base` keeps every filter link on the current route.
 */
export type ListingScope = {
  /** The products this route may show, before URL filters are applied. */
  products: Product[];
  /** Route the filter controls write back to. */
  base: string;
  /** Marks which pill in the category rail is the current one. */
  activePill?: string;
  title: string;
  intro: string;
  crumb?: { label: string; href: string };
  footnote?: string;
};

/**
 * Facet counts are computed against the results of every OTHER active facet,
 * so a count never promises a combination that returns nothing.
 */
export function facetCounts(scope: Product[], state: FilterState) {
  const count = (key: "tip" | "stanje" | "starost", field: "tipKoze" | "stanjeKoze" | "starost") => {
    const base = applyFilters(scope, { ...state, [key]: [] });
    const out: Record<string, number> = {};
    for (const option of filterGroups[field]) {
      out[option.value] = base.filter((p) => p[field].includes(option.value)).length;
    }
    return out;
  };
  return {
    tip: count("tip", "tipKoze"),
    stanje: count("stanje", "stanjeKoze"),
    starost: count("starost", "starost"),
  };
}

export function ProductListing({
  scope,
  state,
  emptyAction,
}: {
  scope: ListingScope;
  state: FilterState;
  emptyAction?: React.ReactNode;
}) {
  const results = applyFilters(scope.products, state);
  const counts = facetCounts(scope.products, state);

  const crumbs = [
    { label: "Domov", href: "/" },
    { label: "Izdelki", href: "/produkti" },
  ];
  if (scope.crumb) crumbs.push(scope.crumb);

  return (
    <div className="page-container pb-24 pt-8">
      <Breadcrumbs items={crumbs} />

      <header className="mt-6 max-w-2xl">
        <h1 className="text-h1">{scope.title}</h1>
        <p className="mt-3 text-lead text-muted">{scope.intro}</p>
      </header>

      {/* Category rail: the source site's five real categories, kept as links
          so their existing ?category= URLs keep resolving.

          Wrapped rather than side-scrolled. As one `w-max` row the last two
          groups — "Darila in mini" and "Znižano" — sat past the right edge of
          a phone, so the whole reduced range was reachable only by a
          horizontal swipe on a page that already scrolls vertically, with
          nothing on screen to say it was there. Seven short labels fit in
          three rows; the browsing choice is worth the rows. */}
      <nav aria-label="Skupine izdelkov" className="mt-8">
        <ul className="flex flex-wrap gap-2">
          <li>
            <CategoryPill
              href="/produkti"
              active={scope.activePill === undefined && !state.category}
            >
              Vse
            </CategoryPill>
          </li>
          {categories.map((category) => (
            <li key={category.slug}>
              <CategoryPill
                href={`/produkti?category=${category.slug}`}
                active={scope.activePill === undefined && state.category === category.slug}
              >
                {category.short}
              </CategoryPill>
            </li>
          ))}
          <li>
            <CategoryPill
              href="/akcijska-ponudba"
              active={scope.activePill === "znizano"}
              accent
            >
              Znižano
            </CategoryPill>
          </li>
        </ul>
      </nav>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
        <FilterRail state={state} counts={counts} base={scope.base} />

        <div>
          <FilterControls
            state={state}
            counts={counts}
            total={results.length}
            base={scope.base}
          />

          {results.length ? (
            <>
              <ProductGrid products={results} columns={3} priorityCount={3} className="mt-8" />
              {scope.footnote ? (
                <p className="mt-12 max-w-xl text-small text-muted">{scope.footnote}</p>
              ) : null}
            </>
          ) : (
            <EmptyState
              className="mt-8"
              title="Za to kombinacijo ni izdelkov"
              description="Poskusite z manj filtri ali začnite pri tem, kar vas na koži najbolj moti."
              action={
                emptyAction ?? (
                  <div className="flex flex-wrap justify-center gap-3">
                    <ButtonLink href={scope.base} variant="primary">
                      Počisti filtre
                    </ButtonLink>
                    <ButtonLink href="/rutina" variant="secondary">
                      Poiščite svojo rutino
                    </ButtonLink>
                  </div>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryPill({
  href,
  active,
  accent,
  children,
}: {
  href: string;
  active: boolean;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        "inline-flex min-h-10 items-center rounded border px-4 text-base transition-colors " +
        (active
          ? "border-violet-700 bg-violet-700 text-white"
          : accent
            ? "border-gold-500 bg-gold-50 text-gold-700 hover:border-gold-700 hover:bg-gold-200"
            : "border-border-control bg-white text-ink hover:border-violet-700 hover:text-violet-700")
      }
    >
      {children}
    </a>
  );
}
