import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { ProductListing } from "@/components/catalog/product-listing";
import { parseFilters, type FilterState } from "@/lib/filters";
import { getCategory, optionLabel, products } from "@/lib/products";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function headingFor(state: FilterState): { title: string; intro: string } {
  if (state.q) {
    return { title: `Rezultati za “${state.q}”`, intro: "Iskanje po imenu, sestavinah in namenu." };
  }
  if (state.category) {
    const category = getCategory(state.category);
    if (category) {
      return {
        title: category.label,
        intro: "Izdelki iz te skupine, razvrščeni po priporočilu.",
      };
    }
  }
  if (state.stanje.length === 1) {
    return {
      title: optionLabel("stanjeKoze", state.stanje[0]),
      intro: "Izdelki, ki naslavljajo to stanje kože.",
    };
  }
  if (state.tip.length === 1) {
    return {
      title: `Za ${optionLabel("tipKoze", state.tip[0]).toLocaleLowerCase("sl")} kožo`,
      intro: "Izdelki, označeni kot primerni za ta tip kože.",
    };
  }
  return {
    title: "Vsi izdelki",
    intro: "Celoten izbor Kozmetike Kahne. Filtrirajte po tipu kože ali po tem, kar vas moti.",
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const state = parseFilters(await searchParams);
  const { title, intro } = headingFor(state);
  const canonical = state.category ? `/produkti?category=${state.category}` : "/produkti";
  return {
    title,
    description: intro,
    alternates: { canonical },
    robots: state.q ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const state = parseFilters(await searchParams);
  const { title, intro } = headingFor(state);

  const crumbs = [
    { label: "Domov", href: "/" },
    { label: "Izdelki", href: "/produkti" },
  ];
  const category = state.category ? getCategory(state.category) : undefined;
  if (category) crumbs.push({ label: category.short, href: `/produkti?category=${category.slug}` });

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <ProductListing
        state={state}
        scope={{
          products,
          base: "/produkti",
          title,
          intro,
          crumb: category
            ? { label: category.short, href: `/produkti?category=${category.slug}` }
            : undefined,
        }}
        emptyAction={
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href="/produkti" variant="primary">
              Počisti filtre
            </ButtonLink>
            <ButtonLink href="/rutina" variant="secondary">
              Poiščite svojo rutino
            </ButtonLink>
          </div>
        }
      />
    </>
  );
}
