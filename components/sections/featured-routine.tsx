import Link from "next/link";
import { SectionHeading } from "@/components/ui/misc";
import { Reveal } from "@/components/ui/reveal";
import { AddRoutineButton } from "@/components/commerce/add-routine-button";
import { ProductImage } from "@/components/commerce/product-image";
import { displayName, formatPrice } from "@/lib/format";
import { primaryImage } from "@/lib/products";
import { featuredRoutine, routineTotal } from "@/lib/routine";

/**
 * The order matters more than the individual products here, so the section is
 * a numbered sequence rather than another product grid. Each step links to the
 * real product and the whole routine can be added in one action.
 */
export function FeaturedRoutine() {
  const steps = featuredRoutine();
  if (steps.length < 3) return null;
  const total = routineTotal(steps);

  return (
    <section className="bg-surface py-20 md:py-28">
      <div className="page-container">
        <SectionHeading
          title="Štirje koraki, ki delujejo skupaj"
          intro="Vrstni red je pomemben: podlaga vleče vlago v globino, krema jo zaklene. To je primer rutine za suho kožo z izraznimi gubami."
        />

        <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((entry, index) => {
            const image = primaryImage(entry.product);
            return (
              <Reveal as="li" key={entry.step.id} delay={index * 0.07} className="relative">
                <div className="flex items-center gap-3">
                  <span className="font-display text-title leading-none text-violet-700">
                    {String(entry.step.order).padStart(2, "0")}
                  </span>
                  <span className="text-base font-medium text-ink">{entry.step.title}</span>
                  <span
                    aria-hidden="true"
                    className="ml-1 hidden h-px flex-1 bg-border-strong lg:block"
                  />
                </div>

                <p className="mt-2 min-h-10 text-small text-muted">{entry.step.purpose}</p>

                <Link href={`/produkt/${entry.product.slug}`} className="group mt-4 block">
                  <ProductImage
                    image={image}
                    sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 88vw"
                    className="aspect-square w-full"
                    imageClassName="transition-transform duration-[600ms] ease-[var(--ease-out-soft)] motion-safe:group-hover:scale-[1.04]"
                  />
                  <p className="mt-3 text-base font-medium leading-snug text-ink transition-colors group-hover:text-violet-700">
                    {displayName(entry.product.name)}
                  </p>
                  <p className="text-small tabular-nums text-muted">
                    {formatPrice(entry.product.price)}
                    {entry.product.volume ? ` · ${entry.product.volume}` : ""}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </ol>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border-strong pt-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-base text-muted">Celotna rutina</p>
            <p className="font-display text-h3 tabular-nums text-ink">{formatPrice(total)}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <AddRoutineButton slugs={steps.map((s) => s.product.slug)} />
            <Link
              href="/rutina"
              className="min-h-11 text-base font-medium leading-[2.75rem] text-violet-700 underline decoration-violet-200 underline-offset-4 transition-colors hover:decoration-violet-700"
            >
              Sestavite rutino za svojo kožo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
