import Link from "next/link";
import { ArrowRight, EnvelopeSimple, Phone } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { PetalMark } from "@/components/ui/mark";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/lib/site";

/**
 * Loyalty and personal advice presented as services rather than as footer
 * links. The two panels are deliberately different shapes: one is an offer,
 * the other is a way to reach a person.
 */
export function Services() {
  return (
    <section className="page-container py-20 md:py-28">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <Reveal>
          <div className="flex h-full flex-col justify-between gap-8 bg-violet-900 p-6 text-violet-200 sm:p-8 md:p-10">
            <div>
              <PetalMark className="h-6 w-6 text-gold-500" />
              <h2 className="mt-5 text-h2 text-white">Kartica zvestobe</h2>
              <p className="mt-3 max-w-md text-lead">
                Imetnikom kartice priznamo {site.loyalty.discountPercent}% popusta pri nakupu v
                spletni trgovini. {site.loyalty.note}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <ButtonLink href="/kartica-zvestobe" variant="onDark" size="lg">
                Pridobite kartico
                <ArrowRight size={16} weight="bold" aria-hidden="true" />
              </ButtonLink>
              <Link
                href="/splosni-pogoji"
                className="min-h-11 text-base leading-[2.75rem] text-violet-200 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
              >
                Pogoji uporabe
              </Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="flex h-full flex-col justify-between gap-8 border border-border bg-white p-6 sm:p-8 md:p-10">
            <div>
              <h2 className="text-h2">Osebno svetovanje</h2>
              <p className="mt-3 text-lead text-muted">
                Ne veste, kateri izdelek je pravi za vašo kožo? Pišite ali pokličite. Odgovorimo
                osebno, ne z avtomatskim sporočilom.
              </p>
            </div>

            <ul className="grid gap-3">
              <li>
                <a
                  href={site.contact.phoneHref}
                  className="group flex min-h-12 items-center gap-3 border-b border-border pb-3 text-base transition-colors hover:text-violet-700"
                >
                  <Phone size={17} weight="light" aria-hidden="true" className="text-gold-700" />
                  <span className="font-medium">{site.contact.phone}</span>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className="ml-auto text-border-strong transition-all group-hover:translate-x-0.5 group-hover:text-violet-700"
                  />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="group flex min-h-12 items-center gap-3 text-base transition-colors hover:text-violet-700"
                >
                  <EnvelopeSimple
                    size={17}
                    weight="light"
                    aria-hidden="true"
                    className="shrink-0 text-gold-700"
                  />
                  <span className="truncate font-medium">{site.contact.email}</span>
                  <ArrowRight
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className="ml-auto shrink-0 text-border-strong transition-all group-hover:translate-x-0.5 group-hover:text-violet-700"
                  />
                </a>
              </li>
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
