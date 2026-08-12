import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { PetalMark } from "@/components/ui/mark";
import { Reveal } from "@/components/ui/reveal";
import { advice, adviceExcerpt } from "@/lib/content";
import { productsByConcern } from "@/lib/products";
import { displayName } from "@/lib/format";

/**
 * The one photographic full-bleed band on the page, mirroring how the source
 * site stages its "Nasveti strokovnjakov" block. The photo comes from the
 * shop's own article library and sits under a near-opaque violet scrim, so
 * white text stays comfortably readable over any region of the image.
 */
export function ExpertAdvice() {
  if (!advice.length) return null;
  const [featured, ...rest] = advice;
  const relatedProducts = productsByConcern("akne", 3);

  return (
    <section className="relative isolate overflow-hidden bg-violet-950 py-20 md:py-28">
      <Image
        src="/vsebina/novica-7-najpogostejsih-napak-pri-negi-obraza.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-[70%_30%]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-violet-950/88" />

      <div className="page-container">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-small font-medium text-gold-500">
              <PetalMark className="h-3 w-3" />
              Nasveti strokovnjakov
            </p>
            <h2 className="text-h2 text-white">Vprašali ste, odgovorili smo</h2>
            <p className="mt-3 max-w-xl text-lead text-violet-200">
              Prava vprašanja strank in odgovori, ki temeljijo na dolgoletni praksi.
            </p>
          </div>
          <ButtonLink href="/nasveti-strokovnjakov" variant="onDark" className="shrink-0">
            Vsi nasveti
          </ButtonLink>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <Reveal>
            <article className="bg-paper p-6 shadow-overlay md:p-8">
              <p className="flex items-center gap-2 text-small text-muted">
                <Clock size={14} weight="light" aria-hidden="true" />
                {featured.readingMinutes} min branja
              </p>
              <blockquote className="mt-3">
                <p className="line-clamp-3 font-display text-title leading-snug text-ink">
                  {featured.question}
                </p>
              </blockquote>
              <p className="mt-4 text-base leading-relaxed text-muted">
                {adviceExcerpt(featured)}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-5">
                <TextLink href={`/nasveti-strokovnjakov#${featured.id}`}>
                  Preberite celoten odgovor
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </TextLink>
                {relatedProducts.length ? (
                  <p className="text-small text-muted">
                    Omenjeni izdelki:{" "}
                    {relatedProducts.map((p, i) => (
                      <span key={p.slug}>
                        {i > 0 ? ", " : ""}
                        <Link
                          href={`/produkt/${p.slug}`}
                          className="underline decoration-border-strong underline-offset-3 hover:text-violet-700"
                        >
                          {displayName(p.name)}
                        </Link>
                      </span>
                    ))}
                  </p>
                ) : null}
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.08}>
            <ul className="divide-y divide-white/15 border-y border-white/15">
              {rest.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/nasveti-strokovnjakov#${item.id}`}
                    className="group flex items-start gap-4 py-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-base font-medium text-white transition-colors group-hover:text-gold-500">
                        {item.question}
                      </span>
                      <span className="mt-1 block text-small text-violet-200/80">
                        {item.readingMinutes} min branja
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      weight="bold"
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-white/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-gold-500"
                    />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 border border-white/15 bg-white/[0.07] p-6 backdrop-blur-[2px]">
              <p className="font-display text-title text-white">Imate vprašanje o svoji koži?</p>
              <p className="mt-2 text-base text-violet-200">
                Opišite, kaj vas moti, in odgovorili vam bomo osebno.
              </p>
              <ButtonLink href="/kontakt" variant="onDark" className="mt-4">
                Zastavite vprašanje
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
