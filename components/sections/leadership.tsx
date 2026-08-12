import type { LeaderProfile } from "@/lib/types";

/**
 * The people on `/vodstvo`, one card each.
 *
 * The page previously rendered the CMS body straight through `Prose`, which
 * produced a single unbroken column: a stray monogram on its own line, a name,
 * a role, five hundred words, then the next monogram. Three people with
 * different jobs read as one continuous document, and the only thing marking a
 * boundary was a heading that looked much like the paragraph above it.
 *
 * What separates them here is a rule and a monogram, not a box. Each profile
 * opens on a full-width hairline with the initials sitting in the margin beside
 * the name — so scanning the left edge counts the people, and the eye finds
 * three starts rather than three headings. Cards with borders and shadows would
 * say these are three selectable things; they are three colleagues, and a
 * printed page separates those with space and a line.
 *
 * The monogram is the source's own: the CMS prints "ZK", "NK", "JK" beside each
 * name and the scrape keeps them. Nothing here is invented — no portraits are
 * attributed, because the catalogue carries no photograph that names anyone.
 */
export function Leadership({ people }: { people: LeaderProfile[] }) {
  return (
    <ol className="max-w-2xl">
      {people.map((person, i) => (
        <li
          key={person.initials + person.name}
          className={i === 0 ? "border-t border-border pt-8" : "mt-12 border-t border-border pt-8"}
        >
          <article>
            <div className="flex items-start gap-4 sm:gap-5">
              {/* Sized in `ch` so a three-letter monogram stays inside the disc
                  instead of pushing it into an oval. */}
              <p
                aria-hidden="true"
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-violet-50 font-display text-[1.05rem] leading-none tracking-[0.06em] text-violet-700 sm:h-16 sm:w-16 sm:text-[1.2rem]"
              >
                {person.initials}
              </p>

              <div className="min-w-0 pt-1">
                <h2 className="font-display text-h3 leading-tight">{person.name}</h2>
                <p className="mt-1.5 text-small font-semibold uppercase tracking-[0.12em] text-gold-700">
                  {person.role}
                </p>
              </div>
            </div>

            {/* Indented to the monogram's right edge from sm up, so the
                biography hangs off the name rather than restarting at the
                page margin and re-joining the column above it. */}
            <p className="mt-5 text-base leading-relaxed text-ink-soft sm:ml-[4.75rem]">
              {person.bio}
            </p>
          </article>
        </li>
      ))}
    </ol>
  );
}
