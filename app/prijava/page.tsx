import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/misc";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Prijava",
  description: "Prijava v uporabniški račun Kozmetike Kahne.",
  robots: { index: false, follow: true },
};

/**
 * Accounts live on the existing commerce platform, which this storefront does
 * not talk to. Rather than render a login form that cannot authenticate
 * anyone, the page is honest about it and routes people to guest checkout,
 * which is the faster path anyway.
 */
export default function SignInPage() {
  return (
    <div className="page-container pb-24 pt-8">
      <Breadcrumbs
        items={[
          { label: "Domov", href: "/" },
          { label: "Prijava", href: "/prijava" },
        ]}
      />

      <div className="mx-auto mt-10 max-w-lg">
        <h1 className="text-h1">Prijava</h1>

        <p className="mt-5 flex items-start gap-2.5 border border-gold-200 bg-gold-50 p-4 text-base text-ink-soft">
          <Info size={18} weight="light" aria-hidden="true" className="mt-0.5 shrink-0 text-gold-700" />
          Uporabniški računi so v tem okolju še vedno vodeni v obstoječem sistemu trgovine.
          Prijava tu zato ni na voljo.
        </p>

        <div className="mt-8 border border-border bg-white p-6">
          <h2 className="font-sans text-body font-medium">Nakup brez računa</h2>
          <p className="mt-2 text-base text-muted">
            Naročite lahko kot gost. Potrebujemo le podatke za stik in dostavo, računa ni treba
            ustvarjati.
          </p>
          <ButtonLink href="/kosarica" variant="primary" className="mt-4">
            Nadaljuj na košarico
          </ButtonLink>
        </div>

        <div className="mt-6 border border-border bg-white p-6">
          <h2 className="font-sans text-body font-medium">Kartica zvestobe</h2>
          <p className="mt-2 text-base text-muted">
            Imetnikom kartice priznamo {site.loyalty.discountPercent}% popusta pri nakupu v
            spletni trgovini.
          </p>
          <Link
            href="/kartica-zvestobe"
            className="mt-3 inline-flex min-h-11 items-center text-base font-medium text-violet-700 underline decoration-violet-200 underline-offset-4 transition-colors hover:decoration-violet-700"
          >
            Kako pridobim kartico
          </Link>
        </div>

        <p className="mt-8 text-base text-muted">
          Potrebujete pomoč?{" "}
          <a
            href={site.contact.phoneHref}
            className="text-violet-700 underline underline-offset-3 hover:decoration-violet-700"
          >
            {site.contact.phone}
          </a>{" "}
          ali{" "}
          <a
            href={`mailto:${site.contact.email}`}
            className="break-all text-violet-700 underline underline-offset-3"
          >
            {site.contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}
