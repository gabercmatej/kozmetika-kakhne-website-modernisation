import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { PageBanner } from "@/components/ui/page-banner";
import { StarRating } from "@/components/ui/star-rating";
import { bannerImage, reviewAggregate, reviews } from "@/lib/content";

export const metadata: Metadata = {
  title: "Mnenja strank",
  description: `Ocena ${reviewAggregate.rating} in ${reviewAggregate.countLabel.toLowerCase()} o izdelkih Kozmetike Kahne.`,
  alternates: { canonical: "/mnenja" },
};

/**
 * The source site has no per-product review data, only this site-wide set, so
 * the page presents it as company feedback rather than attaching stars to
 * individual products.
 */
export default function ReviewsPage() {
  const crumbs = [
    { label: "Domov", href: "/" },
    { label: "Mnenja strank", href: "/mnenja" },
  ];

  return (
    <>
      {/* The page opened on a bare line of type over empty paper, which is the
          one thing `PageBanner` exists to stop. The photograph is a hand
          holding the product being talked about — the same register as the
          quotes below it, and one the homepage carousel does not already run,
          so arriving here does not repeat a picture just seen. */}
      <PageBanner
        crumbs={crumbs}
        eyebrow="Kaj pravijo stranke"
        title="Mnenja strank"
        intro="Sporočila, ki nam jih stranke pošiljajo same. Objavljamo jih neurejena."
        action={
          <div>
            <p className="font-display text-[3rem] leading-none tabular-nums">
              {reviewAggregate.rating.toLocaleString("sl-SI")}
            </p>
            <StarRating value={reviewAggregate.rating} size={16} className="mt-2" />
            <p className="mt-2 text-base text-muted">{reviewAggregate.countLabel}</p>
          </div>
        }
        visual={bannerImage("potovalna-pakiranja")}
        focal="42% 45%"
      />

      <div className="page-container pb-24">
        <ul className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review, i) => (
            <li key={review.author + i}>
              <figure className="flex h-full flex-col border-t border-border pt-5">
                <StarRating value={review.stars} size={13} />
                <blockquote className="mt-3 flex-1 text-base leading-relaxed text-ink-soft">
                  <p>{review.body}</p>
                </blockquote>
                <figcaption className="mt-4 text-small font-medium text-ink">
                  {review.author}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-16 border-t border-border pt-10">
          <p className="max-w-xl text-base text-muted">
            Uporabljate naše izdelke in bi radi delili izkušnjo? Veseli bomo vašega sporočila.
          </p>
          <ButtonLink href="/kontakt" variant="secondary" className="mt-4">
            Pišite nam
          </ButtonLink>
        </div>
      </div>
    </>
  );
}
