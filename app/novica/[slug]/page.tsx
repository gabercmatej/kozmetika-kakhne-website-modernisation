import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock } from "@phosphor-icons/react/dist/ssr";
import { ArticleCard } from "@/components/commerce/article-card";
import { Breadcrumbs, Prose, SectionHeading } from "@/components/ui/misc";
import { articles, getArticle } from "@/lib/content";
import { formatDate, isoDate } from "@/lib/format";
import { articleSchema, breadcrumbSchema, JsonLd } from "@/lib/seo";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(decodeURIComponent(slug));
  if (!article) return {};
  return {
    title: article.title ?? undefined,
    description: article.seo.description ?? article.excerpt,
    alternates: { canonical: `/novica/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title ?? undefined,
      description: article.seo.description ?? article.excerpt,
      images: article.image ? [{ url: article.image.src }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(decodeURIComponent(slug));
  if (!article) notFound();

  const iso = isoDate(article.date);
  const more = articles.filter((a) => a.slug !== article.slug && a.image).slice(0, 3);

  const crumbs = [
    { label: "Domov", href: "/" },
    { label: "Aktualno", href: "/aktualno" },
    { label: article.title ?? article.slug, href: `/novica/${article.slug}` },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={articleSchema({
          title: article.title ?? article.slug,
          slug: article.slug,
          isoDate: iso,
          image: article.image?.src ?? null,
          excerpt: article.excerpt,
        })}
      />

      <div className="page-container pb-24 pt-8">
        <Breadcrumbs items={crumbs} />

        <article className="mt-6">
          <header className="max-w-3xl">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-muted">
              {iso ? <time dateTime={iso}>{formatDate(article.date)}</time> : null}
              {article.readingMinutes ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} weight="light" aria-hidden="true" />
                  {article.readingMinutes} min branja
                </span>
              ) : null}
            </p>
            <h1 className="mt-3 text-h1">{article.title}</h1>
          </header>

          {article.image ? (
            <div className="relative mt-10 aspect-[16/9] w-full max-w-4xl overflow-hidden bg-surface">
              <Image
                src={article.image.src}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 62vw, 92vw"
                className="object-cover"
              />
            </div>
          ) : null}

          {article.bodyHtml ? <Prose html={article.bodyHtml} className="mt-10 max-w-2xl" /> : null}
        </article>

        {more.length ? (
          <section className="mt-20 border-t border-border pt-12">
            <SectionHeading as="h2" title="Preberite tudi" />
            <ul className="mt-8 grid gap-x-6 gap-y-10 md:grid-cols-3">
              {more.map((item) => (
                <li key={item.slug}>
                  <ArticleCard article={item} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
