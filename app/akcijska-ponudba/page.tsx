import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { ProductListing } from "@/components/catalog/product-listing";
import { parseFilters } from "@/lib/filters";
import { discountedProducts } from "@/lib/products";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata: Metadata = {
  title: "Znižano",
  description:
    "Izdelki Kozmetike Kahne, ki so trenutno na voljo po znižani ceni. Znižanje velja do preklica.",
  alternates: { canonical: "/akcijska-ponudba" },
};

const crumbs = [
  { label: "Domov", href: "/" },
  { label: "Izdelki", href: "/produkti" },
  { label: "Znižano", href: "/akcijska-ponudba" },
];

/**
 * Reductions are a scope on the shop, not a destination of their own: this is
 * the same listing as `/produkti`, with the same filters, sort and search, over
 * the products the catalogue already reports as reduced. Nothing is marked
 * down in this codebase, so the page can never disagree with the shop.
 *
 * The URL is unchanged from the source site.
 */
export default async function OffersPage({ searchParams }: { searchParams: SearchParams }) {
  const state = parseFilters(await searchParams);
  const reduced = discountedProducts();

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <ProductListing
        state={state}
        scope={{
          products: reduced,
          base: "/akcijska-ponudba",
          activePill: "znizano",
          title: "Znižano",
          intro:
            "Trenutno znižani izdelki iz naše redne ponudbe. Cene veljajo do preklica oziroma do odprodaje zalog.",
          crumb: { label: "Znižano", href: "/akcijska-ponudba" },
          footnote:
            "Prečrtana cena je redna cena izdelka v naši spletni trgovini pred znižanjem.",
        }}
        emptyAction={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/akcijska-ponudba" variant="primary">
              Počisti filtre
            </ButtonLink>
            <ButtonLink href="/produkti" variant="secondary">
              Poglejte vse izdelke
            </ButtonLink>
          </div>
        }
      />
    </>
  );
}
