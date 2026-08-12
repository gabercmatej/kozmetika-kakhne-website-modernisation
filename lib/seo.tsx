import { site } from "./site";
import { reviewAggregate } from "./content";
import type { Product } from "./types";
import { displayName } from "./format";

const abs = (path: string) => new URL(path, site.url).toString();

/**
 * The 4.8 / 1200+ figure is a company-level rating on the source site, shown
 * identically on every page. It is therefore published as an
 * AggregateRating on the organisation and deliberately NOT on products,
 * where it would imply per-product review data that does not exist.
 */
export function organisationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${site.url}#organizacija`,
    name: site.name,
    legalName: site.legalName,
    url: site.url,
    logo: abs("/brand/kahne-logo.png"),
    slogan: site.tagline,
    foundingDate: String(site.foundedYear),
    founder: { "@type": "Person", name: site.founder },
    vatID: site.registration.vatId,
    telephone: site.contact.phone,
    email: site.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      postalCode: site.address.postalCode,
      addressLocality: site.address.city,
      addressCountry: "SI",
    },
    sameAs: site.social.map((s) => s.href),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: reviewAggregate.rating,
      bestRating: 5,
      ratingCount: reviewAggregate.countApprox,
    },
  };
}

export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: displayName(product.name),
    description: product.seo.description ?? product.lead ?? undefined,
    sku: product.sourceId ?? product.slug,
    url: abs(`/produkt/${product.slug}`),
    image: product.images.map((i) => abs(i.src)),
    brand: { "@type": "Brand", name: site.name },
    ...(product.price != null
      ? {
          offers: {
            "@type": "Offer",
            price: product.price.toFixed(2),
            priceCurrency: "EUR",
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: abs(`/produkt/${product.slug}`),
            seller: { "@type": "Organization", name: site.legalName },
            /* A reduction is declared as a ListPrice specification rather
               than as a second `price`, which is the only form search
               engines read as a strikethrough. */
            ...(product.listPrice != null && product.listPrice > product.price
              ? {
                  priceSpecification: {
                    "@type": "UnitPriceSpecification",
                    priceType: "https://schema.org/ListPrice",
                    price: product.listPrice.toFixed(2),
                    priceCurrency: "EUR",
                  },
                }
              : {}),
          },
        }
      : {}),
  };
}

export function breadcrumbSchema(items: { label: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: abs(item.href),
    })),
  };
}

export function articleSchema(article: {
  title: string;
  slug: string;
  isoDate?: string;
  image?: string | null;
  excerpt: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    url: abs(`/novica/${article.slug}`),
    ...(article.isoDate ? { datePublished: article.isoDate } : {}),
    ...(article.image ? { image: abs(article.image) } : {}),
    publisher: { "@id": `${site.url}#organizacija` },
  };
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
