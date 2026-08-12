import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Envelope, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { QuestionForm } from "@/components/forms/question-form";
import { TextLink } from "@/components/ui/button";
import { MapEmbed } from "@/components/ui/map-embed";
import { Breadcrumbs } from "@/components/ui/misc";
import { advice, getPage } from "@/lib/content";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

/**
 * The source site publishes a business card here: an address block, a phone
 * number, an email address and an embedded map. Everything on it is kept, but
 * the page now leads with the thing a visitor actually came to do — ask a
 * question — instead of leaving them to compose an email themselves.
 *
 * This route deliberately shadows the `[...slug]` catch-all so the original
 * `/kontakt` URL keeps resolving.
 */
export const metadata: Metadata = {
  title: "Kontakt in dostava",
  description:
    "Zastavite vprašanje o negi kože ali naročilu. Kontaktni podatki Kozmetike Kahne in naslov brezplačnega osebnega prevzema v Ljubljani.",
  alternates: { canonical: "/kontakt" },
};

const crumbs = [
  { label: "Domov", href: "/" },
  { label: "Kontakt in dostava", href: "/kontakt" },
];

export default function ContactPage() {
  /* The registration numbers stay sourced from the CMS page they came from. */
  const cmsTitle = getPage("kontakt")?.title ?? "Vizitka podjetja";
  const answered = advice.slice(0, 4);

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <div className="page-container pb-24 pt-8">
        <Breadcrumbs items={crumbs} />

        <header className="mt-6 max-w-2xl">
          <h1 className="text-h1">Zastavite vprašanje</h1>
          <p className="mt-4 text-lead text-muted">
            Nego sestavljamo za posamezno kožo, zato je najhitrejša pot do pravega izdelka
            vprašanje. Odgovori prihajajo od ljudi, ki izdelke tudi razvijajo.
          </p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <QuestionForm />

            {/* Several enquiries the shop receives already have a published
                answer; offering them here is faster than waiting for a reply. */}
            {answered.length ? (
              <section className="mt-12 border-t border-border pt-8">
                <h2 className="font-sans text-body font-medium">
                  Morda je odgovor že objavljen
                </h2>
                <ul className="mt-4 divide-y divide-border border-y border-border">
                  {answered.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/nasveti-strokovnjakov#${item.id}`}
                        className="group flex items-start gap-4 py-4"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="line-clamp-2 text-base text-ink transition-colors group-hover:text-violet-700">
                            {item.question}
                          </span>
                          <span className="mt-1 block text-small text-muted">
                            {item.readingMinutes} min branja
                          </span>
                        </span>
                        <ArrowRight
                          size={15}
                          weight="bold"
                          aria-hidden="true"
                          className="mt-1 shrink-0 text-faint transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-violet-700"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                <TextLink href="/nasveti-strokovnjakov" className="mt-5">
                  Vsi nasveti strokovnjakov
                  <ArrowRight size={14} weight="bold" aria-hidden="true" />
                </TextLink>
              </section>
            ) : null}
          </div>

          <aside className="grid gap-8 lg:mt-1">
            <section className="border border-border bg-white p-6 md:p-7">
              <h2 className="font-display text-h3">Neposreden stik</h2>
              <ul className="mt-5 grid gap-4">
                <li>
                  <a
                    href={site.contact.phoneHref}
                    className="group flex items-center gap-3 text-base text-ink"
                  >
                    <Phone
                      size={18}
                      weight="light"
                      aria-hidden="true"
                      className="shrink-0 text-gold-700"
                    />
                    <span>
                      <span className="block text-small text-muted">Telefon</span>
                      <span className="font-medium underline decoration-border-strong underline-offset-4 transition-colors group-hover:text-violet-700">
                        {site.contact.phone}
                      </span>
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="group flex items-center gap-3 text-base text-ink"
                  >
                    <Envelope
                      size={18}
                      weight="light"
                      aria-hidden="true"
                      className="shrink-0 text-gold-700"
                    />
                    <span className="min-w-0">
                      <span className="block text-small text-muted">E-pošta</span>
                      <span className="block truncate font-medium underline decoration-border-strong underline-offset-4 transition-colors group-hover:text-violet-700">
                        {site.contact.email}
                      </span>
                    </span>
                  </a>
                </li>
              </ul>
            </section>

            {/* Free personal pickup is the one genuinely current utility message
                on the source site, so it gets the photograph. */}
            <section className="overflow-hidden border border-border bg-white">
              <div className="relative aspect-[4/3] w-full bg-surface">
                <Image
                  src="/vsebina/novica-brezplacen-osebni-prevzem-v-ljubljani-je-spet-mogoc.webp"
                  alt="Poslovna stavba na Železni cesti 14 v Ljubljani, kjer je mogoč osebni prevzem"
                  fill
                  sizes="(min-width: 1024px) 34vw, 92vw"
                  className="object-cover object-[50%_62%]"
                />
              </div>
              <div className="p-6 md:p-7">
                <p className="flex items-center gap-2 text-small font-medium text-gold-700">
                  <MapPin size={15} weight="light" aria-hidden="true" />
                  Osebni prevzem
                </p>
                <h2 className="mt-2 font-display text-h3">{site.pickup.label}</h2>
                <p className="mt-2 text-base text-muted">
                  {site.pickup.address} · {site.pickup.note}.
                </p>
              </div>
            </section>

            <section className="border border-border bg-surface p-6 md:p-7">
              <h2 className="font-sans text-body font-medium">{cmsTitle}</h2>
              <dl className="mt-4 grid gap-x-6 gap-y-2 text-base sm:grid-cols-[auto_minmax(0,1fr)]">
                <dt className="text-muted">Podjetje</dt>
                <dd>{site.legalName}</dd>
                <dt className="text-muted">Naslov</dt>
                <dd>
                  {site.address.street}, {site.address.postalCode} {site.address.city}
                </dd>
                <dt className="text-muted">Davčna številka</dt>
                <dd className="tabular-nums">{site.registration.vatId}</dd>
                <dt className="text-muted">Matična številka</dt>
                <dd className="tabular-nums">{site.registration.companyId}</dd>
              </dl>
            </section>
          </aside>
        </div>

        {/* The source publishes one embedded map, of the Trbovlje address. It
            is kept, but placed under its own heading alongside both addresses:
            the shop advertises a second, Ljubljana-only pickup point, and a
            lone unlabelled map of Trbovlje would read as the place to collect
            an order. The pickup address gets a link out rather than a second
            frame — one third-party embed on the page is enough. */}
        <section className="mt-20 border-t border-border pt-12">
          <h2 className="text-h2">Kje nas najdete</h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] lg:gap-12">
            <ul className="grid content-start gap-8">
              <li>
                <p className="flex items-center gap-2 text-small font-medium text-gold-700">
                  <MapPin size={15} weight="light" aria-hidden="true" />
                  Sedež podjetja
                </p>
                <p className="mt-2 font-display text-h3">{site.legalName}</p>
                <p className="mt-1 text-base text-muted">
                  {site.address.street}
                  <br />
                  {site.address.postalCode} {site.address.city}
                </p>
                <TextLink
                  href={site.address.mapLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 text-small"
                >
                  Odprite v Zemljevidih
                  <ArrowRight size={13} weight="bold" aria-hidden="true" />
                </TextLink>
              </li>

              <li>
                <p className="flex items-center gap-2 text-small font-medium text-gold-700">
                  <MapPin size={15} weight="light" aria-hidden="true" />
                  Osebni prevzem
                </p>
                <p className="mt-2 font-display text-h3">Ljubljana</p>
                <p className="mt-1 text-base text-muted">
                  {site.pickup.address}
                  <br />
                  {site.pickup.note}
                </p>
                <TextLink
                  href={site.pickup.mapLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-3 text-small"
                >
                  Odprite v Zemljevidih
                  <ArrowRight size={13} weight="bold" aria-hidden="true" />
                </TextLink>
              </li>
            </ul>

            <MapEmbed
              src={site.address.mapEmbedSrc}
              title={`Zemljevid lokacije: ${site.address.street}, ${site.address.postalCode} ${site.address.city}`}
              className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-auto lg:min-h-[22rem]"
            />
          </div>
        </section>
      </div>
    </>
  );
}
