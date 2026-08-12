import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LoyaltyForm } from "@/components/forms/loyalty-form";
import { Breadcrumbs, Prose } from "@/components/ui/misc";
import { getPage } from "@/lib/content";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * The loyalty card page carried the shop's own benefit copy but no way to
 * apply — the live site's application form sits on the same page, so it is
 * reproduced here field for field.
 *
 * This route deliberately shadows the `[...slug]` catch-all so the original
 * `/kartica-zvestobe` URL keeps resolving; the body copy still comes from the
 * scraped CMS page rather than being retyped.
 */
export const metadata: Metadata = {
  title: "Kartica zvestobe",
  description:
    "Prijavite se na kartico zvestobe Kozmetike Kahne in prejmite 10 % popusta v spletni trgovini, obvestila o akcijah in testerje ob nakupu.",
  alternates: { canonical: "/kartica-zvestobe" },
};

const crumbs = [
  { label: "Domov", href: "/" },
  { label: "Kartica zvestobe", href: "/kartica-zvestobe" },
];

export default function LoyaltyPage() {
  const page = getPage("kartica-zvestobe");
  if (!page) notFound();

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className="page-container pb-24 pt-8">
        <Breadcrumbs items={crumbs} />

        {/* The heading sits inside the left column rather than above the grid so
            the application card starts level with the title instead of hanging
            a screenful below the fold. */}
        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <header className="max-w-2xl">
              <p className="mb-3 text-small font-semibold uppercase tracking-[0.14em] text-gold-700">
                {site.loyalty.discountPercent} % popusta v spletni trgovini
              </p>
              <h1 className="text-h1">{page.title}</h1>
            </header>

            <Prose html={page.bodyHtml} className="mt-10 max-w-xl" />
          </div>

          <div className="border border-border bg-white p-6 md:p-8">
            <h2 className="font-display text-h3">Pridobite kartico zvestobe</h2>
            <p className="mt-2 max-w-md text-base text-muted">
              Izpolnite podatke in kartico vam pošljemo na vaš naslov. {site.loyalty.note}
            </p>
            <div className="mt-7">
              <LoyaltyForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
