import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SectionNav } from "@/components/layout/section-nav";
import { Leadership } from "@/components/sections/leadership";
import { Partners } from "@/components/sections/partners";
import { Accreditations } from "@/components/ui/accreditations";
import { Breadcrumbs, Prose } from "@/components/ui/misc";
import { PageBanner } from "@/components/ui/page-banner";
import { aboutEntry } from "@/lib/about";
import { articleImage, getPage, leadership, pages } from "@/lib/content";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";
import type { ProductImage } from "@/lib/types";

/**
 * Informational and legal pages carried over from the source CMS. Handled by a
 * catch-all so every original URL keeps resolving without a bespoke route per
 * page; more specific routes still take precedence.
 */
/**
 * CMS pages that now have routes of their own. A static route always wins over
 * this catch-all, so generating them here would only produce a duplicate build
 * artefact.
 *
 * Two grew a form. The other two are the handbook URLs, whose scraped body is a
 * single empty `<iframe>` — the source embeds a flipbook widget that the scrape
 * cannot follow, so rendering their CMS body produces a heading over nothing.
 * Their routes assemble the same subject from what the shop does publish.
 */
const SHADOWED = new Set([
  "kontakt",
  "kartica-zvestobe",
  "prirocnik/nega-koze",
  "prirocnik/navodila-za-uporabo",
]);

export function generateStaticParams() {
  return pages
    .filter((page) => !SHADOWED.has(page.slug))
    .map((page) => ({ slug: page.slug.split("/") }));
}

const clean = (title: string | null | undefined) =>
  title?.replace(/\s*[-|·]\s*KOZMETIKA KAHNE.*$/i, "").trim();

/**
 * Catch-all pages that are neither "O nas" entries nor legal text, but are
 * still somewhere a visitor is sent on purpose — so they open on a photograph
 * rather than on a heading over empty paper.
 *
 * `intro` is navigation copy in the sense `lib/about.ts` uses the word: it says
 * what the page below contains and asserts nothing the CMS body does not
 * already say. The prize draw's dates, rules and mechanics stay in the scraped
 * body, which is the only thing on this route allowed to state them.
 */
const FEATURE_BANNERS: Record<
  string,
  { eyebrow: string; intro: string; visual: () => ProductImage | null; focal?: string }
> = {
  "nagradne-igre": {
    eyebrow: "Nagradna igra",
    intro: "Kdaj žrebamo in kako obvestimo izžrebance.",
    /* The prize bags themselves, from the shop's own announcement of the
       draw — the subject of the page, photographed. */
    visual: () => articleImage("vabljeni-k-sodelovanju-v-nasih-nagradnih-igrah"),
    focal: "50% 55%",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug.map(decodeURIComponent).join("/"));
  if (!page) return {};
  return {
    title: clean(page.seo.title) || page.title,
    description: page.seo.description ?? undefined,
    alternates: { canonical: `/${page.slug}` },
  };
}

export default async function ContentPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = getPage(slug.map(decodeURIComponent).join("/"));
  if (!page) notFound();

  const crumbs = [
    { label: "Domov", href: "/" },
    { label: page.title, href: `/${page.slug}` },
  ];

  /**
   * The "O nas" pages are rendered as one section rather than as unrelated
   * documents: a photographic band, a persistent index beside the copy, and —
   * where the page is about them — the company's accreditations and its retail
   * partners. The two legal documents belong to it too; they are reached from
   * the same menu, and dropping a visitor out of the index the moment they open
   * the terms is the dead end this section exists to remove. They simply carry
   * no photograph and get a longer measure.
   */
  const about = aboutEntry(page.slug);
  const people = page.slug === "vodstvo" ? leadership() : [];
  const feature = FEATURE_BANNERS[page.slug];

  if (about) {
    return (
      <>
        <JsonLd data={breadcrumbSchema(crumbs)} />

        <PageBanner
          crumbs={crumbs}
          eyebrow={about.eyebrow}
          title={page.title}
          intro={about.blurb}
          visual={about.visual()}
          focal={about.focal}
          tall={about.tall}
          frame={about.frame}
        />

        <div className="page-container pb-24">
          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] lg:gap-16">
            <SectionNav current={page.slug} />

            <div className="min-w-0">
              {/* `/vodstvo` is the one page in the section whose body is a list
                  of people rather than an essay, and the source marks them up
                  as cards. It gets that structure back; if the parse ever finds
                  nothing, `people` is empty and the raw prose renders as before. */}
              {people.length > 0 ? (
                <Leadership people={people} />
              ) : (
                <Prose html={page.bodyHtml} className={about.wide ? "max-w-3xl" : "max-w-2xl"} />
              )}

              {page.slug === "kozmeticna-hisa-kahne" ? (
                <Accreditations className="mt-14" />
              ) : null}

              {page.slug === "partnerji" ? (
                <div className="mt-12">
                  <Partners />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (feature) {
    return (
      <>
        <JsonLd data={breadcrumbSchema(crumbs)} />

        <PageBanner
          crumbs={crumbs}
          eyebrow={feature.eyebrow}
          title={page.title}
          intro={feature.intro}
          visual={feature.visual()}
          focal={feature.focal}
        />

        <div className="page-container pb-24">
          <Prose html={page.bodyHtml} className="mt-14 max-w-2xl" />
        </div>
      </>
    );
  }

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className="page-container pb-24 pt-8">
        <Breadcrumbs items={crumbs} />

        <header className="mt-6 max-w-2xl">
          <h1 className="text-h1">{page.title}</h1>
        </header>

        {page.image ? (
          <div className="relative mt-8 aspect-[16/9] w-full max-w-4xl overflow-hidden bg-surface">
            <Image
              src={page.image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 60vw, 92vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <Prose html={page.bodyHtml} className="mt-8 max-w-2xl" />
      </div>
    </>
  );
}
