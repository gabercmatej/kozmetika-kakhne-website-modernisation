import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { UsageSearch } from "@/components/catalog/usage-search";
import { ButtonLink } from "@/components/ui/button";
import { Prose } from "@/components/ui/misc";
import { PageBanner } from "@/components/ui/page-banner";
import { bannerImage } from "@/lib/content";
import { displayName, productCount } from "@/lib/format";
import { usageByCategory } from "@/lib/products";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";

/**
 * The source serves this URL as an empty `<iframe>` — a flipbook widget whose
 * contents never came with the page. Scraped, it is a page with a title and
 * nothing in it, and it was linked from the main menu.
 *
 * What the shop actually publishes about using its products is the "Namigi za
 * uporabo" block on each product page: seventy-seven of them, in the shop's own
 * words. Collected and ordered they are the manual the empty frame was meant to
 * hold, so the page is assembled from those rather than left blank or filled
 * with advice nobody at the company wrote.
 *
 * Seventy-seven entries is also more than anyone scrolls, so the manual is
 * searchable — over the product's name and over the instruction itself, since
 * "zjutraj" and "po čiščenju" are how somebody looks for a step rather than a
 * bottle. The query lives in the URL, so a filtered manual can be linked.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Navodila za uporabo",
  description:
    "Navodila za uporabo izdelkov Kozmetike Kahne, zbrana po skupinah — od čiščenja do krem in olj.",
  alternates: { canonical: "/prirocnik/navodila-za-uporabo" },
};

const crumbs = [
  { label: "Domov", href: "/" },
  { label: "Navodila za uporabo", href: "/prirocnik/navodila-za-uporabo" },
];

export default async function InstructionsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const raw = params.q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() || null;

  const groups = usageByCategory(q);
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);
  /* The banner states the size of the manual, not the size of a result. */
  const all = usageByCategory().reduce((sum, g) => sum + g.items.length, 0);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageBanner
        crumbs={crumbs}
        eyebrow="Priročnik"
        title="Navodila za uporabo"
        intro={`Kako se posamezen izdelek nanaša, v kakšnem vrstnem redu in kako pogosto — ${all} izdelkov, zbranih po skupinah.`}
        action={
          <ButtonLink href="/prirocnik/nega-koze" variant="secondary">
            Priročnik za nego kože
          </ButtonLink>
        }
        /* The application itself, demonstrated step by step — the subject of
           the page, and the one campaign frame that shows a product being
           used rather than posed. */
        visual={bannerImage("kako-se-resit-suhe-koze")}
        focal="50% 40%"
      />

      <div className="page-container pb-24">
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <UsageSearch q={q} total={total} />

            {groups.length ? (
              <nav aria-label="Skupine izdelkov" className="mt-8">
                <p className="mb-3 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
                  Na tej strani
                </p>
                <ol className="grid gap-2.5">
                  {groups.map((group, i) => (
                    <li key={group.category.slug}>
                      <a
                        href={`#${group.category.slug}`}
                        className="flex gap-2.5 text-base text-muted transition-colors hover:text-violet-700"
                      >
                        <span className="tabular-nums text-faint">{i + 1}.</span>
                        <span className="flex-1">{group.category.label}</span>
                        <span className="tabular-nums text-faint">{group.items.length}</span>
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}
          </div>

          {groups.length ? (
            <div className="grid gap-16">
              {groups.map((group) => (
                <section key={group.category.slug} id={group.category.slug} className="scroll-mt-28">
                  <h2 className="text-h3">{group.category.label}</h2>
                  <p className="mt-2 text-base text-muted">{productCount(group.items.length)}</p>

                  <div className="mt-8 grid gap-10">
                    {group.items.map(({ product, html }) => (
                      <article key={product.slug} className="border-t border-border pt-6">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="font-display text-[1.35rem] leading-tight">
                            {displayName(product.name)}
                          </h3>
                          {product.volume ? (
                            <span className="text-small text-faint">{product.volume}</span>
                          ) : null}
                        </div>

                        {/* The shop's own wording, unedited. */}
                        <Prose html={html} className="mt-3 max-w-2xl" />

                        <Link
                          href={`/produkt/${product.slug}`}
                          className="group mt-4 inline-flex items-center gap-2 text-base font-medium text-violet-700"
                        >
                          Odprite izdelek
                          <ArrowRight
                            size={14}
                            weight="bold"
                            aria-hidden="true"
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                          />
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="border-t border-border pt-8">
              <p className="text-lead text-muted">
                Za <strong className="font-medium text-ink">{q}</strong> v navodilih ni zadetka.
              </p>
              <p className="mt-3 max-w-xl text-base text-muted">
                Iskanje teče po imenih izdelkov in po besedilu navodil. Poskusite s krajšo besedo
                ali poiščite izdelek v ponudbi.
              </p>
              <ButtonLink href="/produkti" variant="secondary" className="mt-6">
                Vsi izdelki
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
