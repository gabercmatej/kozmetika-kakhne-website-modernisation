import Image from "next/image";
import { partners } from "@/lib/content";
import { Reveal } from "@/components/ui/reveal";

/**
 * Where the range is stocked outside the web shop.
 *
 * The source publishes a name and a logo per retailer and nothing else — no
 * link, no branch list, no availability — so this shows exactly that and does
 * not imply a stock check it cannot make.
 *
 * The logos arrive at eight different aspect ratios and two different
 * philosophies about padding. Each one is given the same fixed box and fitted
 * with `contain`, so the grid reads as a row of marks at a common optical size
 * rather than a set of images at their natural ones.
 */
export function Partners() {
  if (!partners.length) return null;

  return (
    <section className="border-t border-border pt-10">
      <h2 className="font-sans text-body font-medium">Kje nas še najdete</h2>
      <p className="mt-2 max-w-xl text-base text-muted">
        Izdelke Kozmetike Kahne poleg spletne trgovine ponujajo tudi ti partnerji.
      </p>

      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {partners.map((partner, i) => (
          <Reveal as="li" key={partner.slug} delay={i * 0.04}>
            <div className="flex h-full flex-col items-center gap-3 border border-border bg-white px-4 py-6">
              <div className="relative h-14 w-full">
                <Image
                  src={partner.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 15vw, (min-width: 640px) 26vw, 40vw"
                  className="object-contain"
                />
              </div>
              <p className="text-center text-small font-medium text-ink">{partner.name}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
