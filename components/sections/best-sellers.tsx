import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ProductCard } from "@/components/commerce/product-card";
import { TextLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/misc";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { bestSellers } from "@/lib/products";

export function BestSellers() {
  const items = bestSellers(8);
  if (!items.length) return null;

  return (
    <section className="page-container py-20 md:py-28">
      <SectionHeading
        title="Kar stranke naročajo znova"
        intro="Izdelki, ki jih naše stranke kupujejo največkrat."
        action={
          <TextLink href="/produkti?category=best-sellerji-in-predlogi-za-specificne-potrebe-koze">
            Vsi best sellerji
            <ArrowRight size={14} weight="bold" aria-hidden="true" />
          </TextLink>
        }
      />

      <RevealGroup
        as="ul"
        className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4"
      >
        {items.map((product) => (
          <RevealItem as="li" key={product.slug} className="relative">
            <ProductCard product={product} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
