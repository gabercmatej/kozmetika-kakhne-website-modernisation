import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { RoutineFinder } from "@/components/catalog/routine-finder";
import { ButtonLink } from "@/components/ui/button";
import { PageBanner } from "@/components/ui/page-banner";
import { articleImage } from "@/lib/content";
import { categories } from "@/lib/products";
import { ROUTINE_STEPS } from "@/lib/routine";

export const metadata: Metadata = {
  title: "Poiščite svojo rutino",
  description:
    "Štiri kratka vprašanja in predlagamo rutino iz izdelkov Kozmetike Kahne, ki ustrezajo vaši koži.",
  alternates: { canonical: "/rutina" },
};

/**
 * Where each routine step goes. Three name a real category and open its
 * listing. The targeted step has no category of its own — what it needs
 * depends on what is wrong — so it opens the handbook instead, which is where
 * the booklet and the ingredient index are. Every one of the four is labelled
 * with its destination rather than with the step, so the link says where it
 * lands before it is taken.
 */
const TARGETED_STEP = { href: "/prirocnik/nega-koze", label: "Priročnik za nego kože" };

const stepHref = (category?: string) =>
  category ? `/produkti?category=${category}` : TARGETED_STEP.href;

export default function RoutinePage() {
  const categoryLabel = (slug?: string) =>
    slug ? categories.find((c) => c.slug === slug)?.label : undefined;

  return (
    <>
      {/* A single clean frame of a routine being applied. The campaign shot of
          the same subject is a staggered three-panel montage: cropped to a
          rail, its white inter-panel gutters cut across the frame and read as a
          rendering fault rather than as composition. */}
      <PageBanner
        crumbs={[
          { label: "Domov", href: "/" },
          { label: "Rutina", href: "/rutina" },
        ]}
        eyebrow="Rutina po meri"
        title="Poiščite svojo rutino"
        intro="Štiri kratka vprašanja. Predlagali vam bomo korake in razložili, zakaj smo izbrali prav te izdelke. To ni medicinski nasvet."
        action={
          <ButtonLink href="/produkti" variant="secondary">
            Raje kar brskam po izdelkih
          </ButtonLink>
        }
        visual={articleImage("genialnost-21-stoletja")}
        focal="50% 32%"
      />

      <div className="page-container pb-24">
        <RoutineFinder />

        {/* The four steps, in the hairline-grid treatment the handbook used to
            carry. They were written twice, in two different shapes; this is
            the shape that survived, and it is the only one now. Each step also
            opens the listing it draws from, which is what the handbook's
            version had and this one did not — the questionnaire above answers
            "which products", and these answer "what if I would rather look
            myself". */}
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="text-h2">Kako je rutina sestavljena</h2>
          <p className="mt-3 max-w-2xl text-lead text-muted">
            Štiri stopnje, v katerih je ponudba tudi urejena: najprej čiščenje, nato podlaga,
            ciljna nega in krema, ki nego zaklene.
          </p>

          <ol className="mt-10 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {ROUTINE_STEPS.map((step) => (
              <li key={step.id} className="flex flex-col gap-3 bg-paper p-6">
                <span
                  aria-hidden="true"
                  className="font-display text-[2rem] leading-none text-violet-200"
                >
                  {step.order}
                </span>
                <h3 className="font-display text-[1.3rem] leading-tight">{step.title}</h3>
                <p className="flex-1 text-base leading-relaxed text-muted">{step.purpose}</p>
                <Link
                  href={stepHref(step.category)}
                  className="group inline-flex items-center gap-2 text-base font-medium text-violet-700"
                >
                  {categoryLabel(step.category) ?? TARGETED_STEP.label}
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
