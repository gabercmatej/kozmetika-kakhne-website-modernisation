import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { PetalMark } from "./mark";

export function Breadcrumbs({
  items,
  className,
}: {
  items: { label: string; href?: string }[];
  className?: string;
}) {
  return (
    <nav aria-label="Drobtinice" className={cn("text-small", className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-muted">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="transition-colors hover:text-violet-700">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "text-ink")}>
                  {item.label}
                </span>
              )}
              {!last ? (
                <CaretRight size={12} weight="bold" aria-hidden="true" className="text-border-strong" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Section headers stack vertically. An eyebrow is optional and deliberately
 * rare; most sections read better with the headline carrying the weight.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  action,
  align = "left",
  as: Tag = "h2",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  align?: "left" | "center";
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "text-center")}>
        {eyebrow ? (
          <p
            className={cn(
              "mb-3 flex items-center gap-2 text-small font-medium text-gold-700",
              align === "center" && "justify-center"
            )}
          >
            <PetalMark className="h-3 w-3 text-gold-500" />
            {eyebrow}
          </p>
        ) : null}
        <Tag className="text-h2">{title}</Tag>
        {intro ? (
          <div className="mt-3 max-w-xl text-lead text-muted">
            {typeof intro === "string" ? <p>{intro}</p> : intro}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded bg-gradient-to-r from-surface via-violet-50 to-surface",
        className
      )}
    />
  );
}

/** Matches the real product card silhouette so nothing shifts when data lands. */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-[4/5] w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-20" />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 border border-dashed border-border-strong bg-white px-6 py-16 text-center",
        className
      )}
    >
      <PetalMark className="h-7 w-7 text-violet-200" />
      <div className="max-w-md">
        <p className="font-display text-h3 text-ink">{title}</p>
        {description ? <p className="mt-2 text-base text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

/**
 * Renders sanitised CMS HTML. Content is scraped from the source site only.
 *
 * The source copy contains bare URLs typed as plain text, several of them
 * absolute links back to kozmetikakahne.com. Those are turned into real links
 * and rewritten to internal routes so they neither read as raw text nor send
 * shoppers off to the old site mid-sentence.
 */
const readableLabel = (path: string): string => {
  const slug = decodeURIComponent(path).replace(/^\/(produkt|novica|prirocnik)\//, "").replace(/\/$/, "");
  if (!slug) return "spletna trgovina";
  const words = slug.replace(/-/g, " ").trim();
  return words.charAt(0).toLocaleUpperCase("sl") + words.slice(1);
};

function linkifyCmsHtml(html: string): string {
  let out = html;

  // 1. Absolute links back to the old domain become internal routes.
  out = out.replace(
    /href="https?:\/\/(?:www\.)?kozmetikakahne\.com(\/[^"]*)"/g,
    (_match, path: string) => `href="${path}"`
  );

  // 2. Anchors whose visible text is a bare URL get a readable label instead.
  out = out.replace(
    /<a href="([^"]*)"([^>]*)>\s*https?:\/\/[^<]*<\/a>/g,
    (_match, href: string, attrs: string) => `<a href="${href}"${attrs}>${readableLabel(href)}</a>`
  );

  // 3. Any remaining bare URL in plain text becomes a link.
  out = out.replace(/(?<!href=")(?<!>)https?:\/\/(?:www\.)?([^\s<"]+)/g, (match, rest: string) => {
    const internal = match.match(/https?:\/\/(?:www\.)?kozmetikakahne\.com(\/[^\s<"]*)/);
    if (internal) return `<a href="${internal[1]}">${readableLabel(internal[1])}</a>`;
    return `<a href="${match}" target="_blank" rel="noreferrer noopener">${rest.replace(/\/$/, "")}</a>`;
  });

  return out;
}

export function Prose({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose-kahne", className)}
      dangerouslySetInnerHTML={{ __html: linkifyCmsHtml(html) }}
    />
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-border", className)} />;
}
