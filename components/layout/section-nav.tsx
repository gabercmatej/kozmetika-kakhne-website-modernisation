import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ABOUT_PAGES, ABOUT_RELATED } from "@/lib/about";
import { cn } from "@/lib/utils";

/**
 * The persistent index for the "O nas" pages.
 *
 * These are six short documents about one company, and on the source site the
 * only way between any two of them is back up to a hover menu in the header —
 * which is a pointing exercise on desktop and unavailable on touch until the
 * whole menu is opened. Carrying the list on the page turns the section into
 * something readable in sequence.
 *
 * It is a plain list of links, not a widget: no client JavaScript, current page
 * marked with `aria-current`, and from lg up it sticks alongside the copy.
 */
export function SectionNav({ current }: { current: string }) {
  return (
    <nav aria-label="Strani o podjetju" className="lg:sticky lg:top-28 lg:self-start">
      <p className="mb-3 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
        O podjetju
      </p>

      <ul className="border-t border-border">
        {ABOUT_PAGES.map((entry) => {
          const active = entry.slug === current;
          return (
            <li key={entry.slug} className="border-b border-border">
              <Link
                href={`/${entry.slug}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-start gap-3 py-3.5 transition-colors",
                  active ? "text-violet-700" : "text-ink hover:text-violet-700"
                )}
              >
                {/* The marker is a rule rather than a bullet so the active row
                    reads as a position in a list, not as a selected option. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-2.5 h-px w-4 shrink-0 transition-all duration-200",
                    active
                      ? "w-6 bg-violet-700"
                      : "bg-border-strong group-hover:w-6 group-hover:bg-violet-700"
                  )}
                />
                <span className="min-w-0">
                  <span className={cn("block text-base", active && "font-medium")}>
                    {entry.label}
                  </span>
                  <span className="mt-0.5 block text-small leading-snug text-muted">
                    {entry.blurb}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}

        {ABOUT_RELATED.map((entry) => (
          <li key={entry.slug} className="border-b border-border">
            <Link
              href={entry.href}
              className="group flex items-center gap-3 py-3.5 text-base text-ink transition-colors hover:text-violet-700"
            >
              <span
                aria-hidden="true"
                className="h-px w-4 shrink-0 bg-border-strong transition-all duration-200 group-hover:w-6 group-hover:bg-violet-700"
              />
              <span className="flex-1">{entry.label}</span>
              <ArrowRight
                size={13}
                weight="bold"
                aria-hidden="true"
                className="shrink-0 text-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-violet-700"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
