import Image from "next/image";
import Link from "next/link";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import { formatDate, isoDate } from "@/lib/format";
import type { Article } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ArticleCard({
  article,
  size = "md",
  className,
}: {
  article: Article;
  size?: "md" | "lg";
  className?: string;
}) {
  const iso = isoDate(article.date);

  return (
    <article className={cn("group flex h-full flex-col", className)}>
      <Link href={`/novica/${article.slug}`} className="flex h-full flex-col">
        <div
          className={cn(
            "relative w-full overflow-hidden bg-surface",
            size === "lg" ? "aspect-[16/10]" : "aspect-[3/2]"
          )}
        >
          {article.image ? (
            <Image
              src={article.image.src}
              alt=""
              fill
              sizes={size === "lg" ? "(min-width: 1024px) 55vw, 92vw" : "(min-width: 768px) 30vw, 92vw"}
              className="object-cover transition-transform duration-[700ms] ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-[1.04]"
            />
          ) : null}
        </div>

        <div className="flex flex-1 flex-col pt-4">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-small text-muted">
            {iso ? <time dateTime={iso}>{formatDate(article.date)}</time> : null}
            {article.readingMinutes ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={13} weight="light" aria-hidden="true" />
                {article.readingMinutes} min branja
              </span>
            ) : null}
          </p>
          {/* `anywhere` rather than `break-word`, and on both lines: only
              `anywhere` reduces min-content width, which is what this is for.
              One CMS excerpt carries a URL fused to the word before it
              ("inhttps://www.instagram.com/…"), a 44-character token that set
              the min-content of the grid track at 336px and pushed the whole
              /aktualno page into horizontal scroll on a 320px screen. The
              same guard already exists on `.prose-kahne` for the same reason. */}
          <h3
            className={cn(
              "mt-2 font-display leading-snug text-ink transition-colors [overflow-wrap:anywhere] group-hover:text-violet-700",
              size === "lg" ? "text-h3" : "text-title"
            )}
          >
            {article.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-base text-muted [overflow-wrap:anywhere]">
            {article.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}
