import Link from "next/link";
import { ChatCircleText } from "@phosphor-icons/react/dist/ssr";
import { StarRating } from "@/components/ui/star-rating";
import { HeritageSeal } from "@/components/ui/mark";
import { site } from "@/lib/site";
import { reviewAggregate } from "@/lib/content";

/**
 * Credibility as a single quiet band rather than five identical cards. Every
 * figure is published on the source site; nothing is rounded up or invented.
 */
export function TrustStrip() {
  return (
    <section aria-label="Zakaj Kozmetika Kahne" className="border-y border-border bg-white">
      <div className="page-container">
        <ul className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          <li className="flex items-center gap-4 py-6 lg:pr-8">
            <HeritageSeal />
            <div>
              <p className="text-base font-medium text-ink">Družinsko podjetje</p>
              <p className="text-small text-muted">Ustanovila {site.founder}, leta {site.foundedYear}.</p>
            </div>
          </li>

          <li className="flex items-center gap-4 py-6 lg:px-8">
            <span className="font-display text-title leading-none text-gold-700" aria-hidden="true">
              SI
            </span>
            <div>
              <p className="text-base font-medium text-ink">Slovenska proizvodnja</p>
              <p className="text-small text-muted">Razvoj z laboratorijem iz Monaka.</p>
            </div>
          </li>

          <li className="flex items-center gap-4 py-6 lg:px-8">
            <StarRating value={reviewAggregate.rating} size={13} />
            <div>
              <p className="text-base font-medium text-ink">
                Ocena {reviewAggregate.rating.toLocaleString("sl-SI")}
              </p>
              <p className="text-small text-muted">
                <Link href="/mnenja" className="underline decoration-border-strong underline-offset-3 hover:text-violet-700">
                  {reviewAggregate.countLabel}
                </Link>
              </p>
            </div>
          </li>

          <li className="flex items-center gap-4 py-6 lg:pl-8">
            <ChatCircleText size={22} weight="light" aria-hidden="true" className="shrink-0 text-gold-700" />
            <div>
              <p className="text-base font-medium text-ink">Osebni nasvet</p>
              <p className="text-small text-muted">
                <Link href="/nasveti-strokovnjakov" className="underline decoration-border-strong underline-offset-3 hover:text-violet-700">
                  Vprašajte našo strokovnjakinjo
                </Link>
              </p>
            </div>
          </li>
        </ul>
      </div>
    </section>
  );
}
