import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import { ArticleCard } from "@/components/commerce/article-card";
import { TextLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/reveal";
import { articles } from "@/lib/content";
import { formatDate, isoDate } from "@/lib/format";

/**
 * The news strip, promoted high on the page as on the source site: one
 * featured story with a large photograph, then a compact list. The list rows
 * keep the section shallow so it reads as "the shop is alive", not as a blog.
 */
export function Journal() {
  /* Articles arrive newest-first, so the newest one with usable photography
     takes the feature slot. */
  const withImages = articles.filter((a) => a.image);
  const featured = withImages[0];
  const rest = articles.filter((a) => a.slug !== featured?.slug).slice(0, 3);
  if (!featured) return null;

  return (
    <section className="page-container py-20 md:py-28">
      <SectionHeading
        title="Aktualno"
        intro="Novice, sezonski nasveti in obvestila o poslovanju."
        action={
          <TextLink href="/aktualno">
            Vse novice
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </TextLink>
        }
      />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-14">
        <Reveal>
          <ArticleCard article={featured} size="lg" />
        </Reveal>

        <Reveal delay={0.08}>
          <ul className="divide-y divide-border border-y border-border">
            {rest.map((article) => {
              const iso = isoDate(article.date);
              return (
                <li key={article.slug}>
                  <Link href={`/novica/${article.slug}`} className="group flex gap-4 py-5">
                    {article.image ? (
                      <span className="relative h-20 w-24 shrink-0 overflow-hidden bg-surface">
                        <Image
                          src={article.image.src}
                          alt=""
                          fill
                          sizes="96px"
                          className="object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-[1.06]"
                        />
                      </span>
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 font-display text-title leading-snug text-ink transition-colors group-hover:text-violet-700">
                        {article.title}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted">
                        {iso ? <time dateTime={iso}>{formatDate(article.date)}</time> : null}
                        {article.readingMinutes ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} weight="light" aria-hidden="true" />
                            {article.readingMinutes} min
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
