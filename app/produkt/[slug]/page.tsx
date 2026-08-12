import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Leaf, MapPin, Package } from "@phosphor-icons/react/dist/ssr";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductPurchase } from "@/components/catalog/product-purchase";
import { ProductGrid } from "@/components/commerce/product-card";
import { AddRoutineButton } from "@/components/commerce/add-routine-button";
import { Accordion } from "@/components/ui/accordion";
import { Badge, ProductBadge } from "@/components/ui/badge";
import { Breadcrumbs, Prose, SectionHeading } from "@/components/ui/misc";
import { HeritageSeal, PetalMark } from "@/components/ui/mark";
import { DiscountMark, Price } from "@/components/ui/price";
import { displayName, formatPrice } from "@/lib/format";
import {
  concernLabels,
  getProduct,
  products,
  relatedProducts,
  setContents,
  skinTypeLabels,
} from "@/lib/products";
import { breadcrumbSchema, JsonLd, productSchema } from "@/lib/seo";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(decodeURIComponent(slug));
  if (!product) return {};

  const image = product.images[0];
  return {
    title: product.seo.title?.replace(/\s*[-|]\s*KOZMETIKA KAHNE.*$/i, "").trim() || displayName(product.name),
    description: product.seo.description ?? product.lead ?? undefined,
    keywords: product.seo.keywords ?? undefined,
    alternates: { canonical: `/produkt/${product.slug}` },
    openGraph: {
      type: "website",
      title: displayName(product.name),
      description: product.seo.description ?? product.lead ?? undefined,
      url: `/produkt/${product.slug}`,
      images: image ? [{ url: image.src, width: image.width, height: image.height }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(decodeURIComponent(slug));
  if (!product) notFound();

  const related = relatedProducts(product, 4);
  const contents = setContents(product);
  const concerns = concernLabels(product);
  const skinTypes = skinTypeLabels(product);

  const crumbs = [
    { label: "Domov", href: "/" },
    { label: "Izdelki", href: "/produkti" },
    { label: displayName(product.name), href: `/produkt/${product.slug}` },
  ];

  /* Long-form copy stays in accordions, but the benefits and "best for" data
     are rendered openly so nothing important is hidden behind interaction. */
  const accordionItems = [
    ...product.sections
      .filter((s) => s.html)
      .map((s) => ({
        id: s.title.toLowerCase().replace(/\s+/g, "-"),
        title: s.title,
        content: <Prose html={s.html!} />,
      })),
    ...(product.inci
      ? [
          {
            id: "sestavine",
            title: "Sestavine",
            content: (
              <p className="max-w-none text-base leading-relaxed text-muted">{product.inci}</p>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <JsonLd data={productSchema(product)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <div className="page-container pb-24 pt-8">
        <Breadcrumbs items={crumbs} />

        <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
          <ProductGallery
            images={product.images}
            alt={`${displayName(product.name)}, Kozmetika Kahne`}
            badge={<ProductBadge badge={product.badge} />}
            mark={<DiscountMark percent={product.discountPercent} />}
          />

          <div className="lg:pt-2">
            <h1 className="text-h1">{displayName(product.name)}</h1>

            {product.lead ? (
              <p className="mt-4 max-w-lg text-lead text-ink-soft">{product.lead}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <Price
                value={product.price}
                listPrice={product.listPrice}
                size="lg"
                withVat
              />
              {product.volume ? (
                <span className="text-base text-muted">{product.volume}</span>
              ) : null}
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-base text-success">
                  <CheckCircle size={15} weight="fill" aria-hidden="true" />
                  Na zalogi
                </span>
              ) : (
                <Badge tone="out">Trenutno ni na zalogi</Badge>
              )}
            </div>

            {product.benefits.length ? (
              <ul className="mt-7 grid gap-2">
                {product.benefits.slice(0, 6).map((benefit) => (
                  <li key={benefit} className="flex gap-2.5 text-base text-ink-soft">
                    <PetalMark className="mt-1.5 h-3 w-3 shrink-0 text-gold-500" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8">
              <ProductPurchase product={product} />
            </div>

            {(skinTypes.length || concerns.length) && (
              <dl className="mt-8 grid gap-3 border-t border-border pt-6 text-base">
                {skinTypes.length ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted">Za tip kože:</dt>
                    <dd className="text-ink">{skinTypes.join(", ")}</dd>
                  </div>
                ) : null}
                {concerns.length ? (
                  <div className="flex flex-wrap gap-x-2">
                    <dt className="text-muted">Naslavlja:</dt>
                    <dd className="text-ink">{concerns.join(", ")}</dd>
                  </div>
                ) : null}
              </dl>
            )}

            <ul className="mt-6 grid gap-2.5 border-t border-border pt-6 text-base text-muted">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} weight="light" aria-hidden="true" className="mt-1 shrink-0 text-gold-700" />
                <span>
                  {site.pickup.label} na naslovu {site.pickup.address}. Stroški dostave se
                  izračunajo na blagajni.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Leaf size={16} weight="light" aria-hidden="true" className="mt-1 shrink-0 text-gold-700" />
                <span>Minimalna količina konzervansov. Ni testirano na živalih.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <HeritageSeal className="mt-0.5 shrink-0 text-base" />
                <span>Slovenska proizvodnja, z znanjem in izkušnjami od leta {site.foundedYear}.</span>
              </li>
            </ul>
          </div>
        </div>

        {contents.length ? (
          <section className="mt-20 border-t border-border pt-12">
            <SectionHeading
              as="h2"
              title="Kaj je v kompletu"
              intro="Izdelki so izbrani tako, da se dopolnjujejo. Nanašajte jih v tem vrstnem redu."
            />
            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((entry, i) => (
                <li key={entry.product.slug} className="flex gap-4">
                  <span className="font-display text-title leading-none text-violet-700">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/produkt/${entry.product.slug}`}
                      className="group flex gap-4"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-white">
                        {entry.product.images[0] ? (
                          <Image
                            src={entry.product.images[0].src}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <p className="text-base font-medium leading-snug text-ink transition-colors group-hover:text-violet-700">
                          {displayName(entry.product.name)}
                        </p>
                        {entry.note ? (
                          <p className="text-small text-muted">{entry.note}</p>
                        ) : null}
                        <p className="mt-1 text-small tabular-nums text-faint">
                          posamično {formatPrice(entry.product.price)}
                        </p>
                      </div>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {accordionItems.length ? (
          <section className="mt-20 grid grid-cols-1 gap-10 border-t border-border pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
            <h2 className="text-h2">Podrobnosti</h2>
            <Accordion items={accordionItems} defaultOpen={[accordionItems[0].id]} />
          </section>
        ) : null}

        {product.crossSell.length ? (
          <section className="mt-20 border-t border-border pt-12">
            <SectionHeading
              as="h2"
              title="Odlično v kombinaciji"
              intro="Izdelki, ki jih pri tem izdelku priporočamo sami."
              action={
                <AddRoutineButton
                  slugs={product.crossSell.slice(0, 3)}
                  label="Dodaj priporočene"
                  variant="secondary"
                />
              }
            />
            <ProductGrid
              products={related}
              columns={4}
              className="mt-8"
            />
          </section>
        ) : related.length ? (
          <section className="mt-20 border-t border-border pt-12">
            <SectionHeading as="h2" title="Mogoče vas zanima tudi" />
            <ProductGrid products={related} columns={4} className="mt-8" />
          </section>
        ) : null}

        <p className="mt-16 flex items-start gap-2 text-small text-muted">
          <Package size={15} weight="light" aria-hidden="true" className="mt-0.5 shrink-0" />
          Slike izdelkov so informativne. Sestava je navedena med podrobnostmi izdelka.
        </p>
      </div>
    </>
  );
}
