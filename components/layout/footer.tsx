import Image from "next/image";
import Link from "next/link";
import { EnvelopeSimple, FacebookLogo, InstagramLogo, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { FOOTER_GROUPS } from "@/lib/nav";
import { site } from "@/lib/site";
import { PetalMark } from "@/components/ui/mark";
import { NewsletterForm } from "./newsletter-form";

const SOCIAL_ICON = {
  Facebook: FacebookLogo,
  Instagram: InstagramLogo,
} as const;

export function Footer() {
  return (
    <footer className="mt-24 bg-violet-900 text-violet-200">
      <div className="page-container py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
          <div className="max-w-md">
            <Image
              src="/brand/kahne-logo.png"
              alt="Kozmetika Kahne"
              width={354}
              height={206}
              className="h-14 w-auto brightness-0 invert"
            />
            <p className="mt-5 font-display text-h3 leading-tight text-white">
              Ostanite v stiku s svojo kožo.
            </p>
            <p className="mt-2 text-base text-violet-200">
              Enkrat na mesec: konkretni nasveti za nego, novi izdelki in ugodnosti.
            </p>
            <div className="mt-5">
              <NewsletterForm tone="dark" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {FOOTER_GROUPS.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <h2 className="mb-3.5 font-sans text-micro font-semibold uppercase tracking-[0.12em] text-white">
                  {group.title}
                </h2>
                <ul className="grid gap-2">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link
                        href={link.href}
                        className="text-base text-violet-200 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 border-t border-white/15 pt-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]">
          <div>
            <h2 className="mb-3 font-sans text-micro font-semibold uppercase tracking-[0.12em] text-white">
              Kontakt
            </h2>
            <address className="grid gap-2 not-italic text-base">
              <a
                href={site.contact.phoneHref}
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <Phone size={15} weight="light" aria-hidden="true" className="text-gold-500" />
                {site.contact.phone}
              </a>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex items-center gap-2 break-all transition-colors hover:text-white"
              >
                <EnvelopeSimple size={15} weight="light" aria-hidden="true" className="shrink-0 text-gold-500" />
                {site.contact.email}
              </a>
              <span className="inline-flex items-start gap-2">
                <MapPin size={15} weight="light" aria-hidden="true" className="mt-1 shrink-0 text-gold-500" />
                <span>
                  {site.legalName}
                  <br />
                  {site.address.street}, {site.address.postalCode} {site.address.city}
                </span>
              </span>
            </address>
          </div>

          <div>
            <h2 className="mb-3 font-sans text-micro font-semibold uppercase tracking-[0.12em] text-white">
              Prevzem in dostava
            </h2>
            <p className="text-base">
              {site.pickup.label}
              <br />
              <span className="text-violet-200/80">
                {site.pickup.address}. {site.pickup.note}.
              </span>
            </p>
            <p className="mt-3 text-base">
              Dostava po Sloveniji.{" "}
              <Link href="/splosni-pogoji" className="underline decoration-white/30 underline-offset-3 hover:decoration-white">
                Pogoji dostave
              </Link>
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <h2 className="mb-3 font-sans text-micro font-semibold uppercase tracking-[0.12em] text-white">
                Spremljajte nas
              </h2>
              <ul className="flex gap-2">
                {site.social.map((s) => {
                  const Icon = SOCIAL_ICON[s.label as keyof typeof SOCIAL_ICON];
                  return (
                    <li key={s.href}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex h-11 w-11 items-center justify-center rounded border border-white/20 transition-colors hover:border-white hover:text-white"
                      >
                        <Icon size={18} weight="light" aria-hidden="true" />
                        <span className="sr-only">{s.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-sans text-micro font-semibold uppercase tracking-[0.12em] text-white">
                Plačila
              </h2>
              <ul className="flex flex-wrap gap-1.5">
                {site.paymentMethods.map((method) => (
                  <li
                    key={method}
                    className="rounded-xs border border-white/20 px-2 py-1 text-micro text-violet-200"
                  >
                    {method}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="page-container flex flex-col items-center justify-between gap-3 py-5 text-small sm:flex-row">
          <p className="flex items-center gap-2 text-violet-200/80">
            <PetalMark className="h-3 w-3 text-gold-500" />
            © {new Date().getFullYear()} {site.legalName} · DŠ {site.registration.vatId}
          </p>
          <p className="text-violet-200/80">{site.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
