import { StarRating } from "@/components/ui/star-rating";
import { Reveal } from "@/components/ui/reveal";
import { TextLink } from "@/components/ui/button";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { featuredReviews, reviewAggregate } from "@/lib/content";

/**
 * Static, readable and quotable. An auto-advancing carousel would make these
 * harder to read, which defeats the purpose of showing them at all.
 */
export function Reviews() {
  const quotes = featuredReviews(6);
  if (!quotes.length) return null;

  return (
    <section className="border-y border-border bg-white py-20 md:py-28">
      <div className="page-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,2fr)]">
          <div>
            <p className="font-display text-[4rem] leading-none text-ink tabular-nums">
              {reviewAggregate.rating.toLocaleString("sl-SI")}
            </p>
            <StarRating value={reviewAggregate.rating} size={18} className="mt-3" />
            <p className="mt-3 text-base text-muted">{reviewAggregate.countLabel}</p>
            <h2 className="mt-6 text-h3">Kaj pravijo stranke</h2>
            <p className="mt-2 max-w-xs text-base text-muted">
              Mnenja, ki so nam jih stranke poslale same. Objavljamo jih neurejena.
            </p>
            <TextLink href="/mnenja" className="mt-4">
              Preberite več mnenj
              <ArrowRight size={14} weight="bold" aria-hidden="true" />
            </TextLink>
          </div>

          <ul className="grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {quotes.map((review, i) => (
              <Reveal as="li" key={review.author + i} delay={i * 0.05}>
                <figure className="flex h-full flex-col">
                  <StarRating value={review.stars} size={13} />
                  <blockquote className="mt-3 flex-1 text-base leading-relaxed text-ink-soft">
                    <p className="line-clamp-6">{review.body}</p>
                  </blockquote>
                  <figcaption className="mt-3 text-small font-medium text-ink">
                    {review.author}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
