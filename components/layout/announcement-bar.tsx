import Link from "next/link";
import { EnvelopeSimple, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";

/**
 * The utility strip: the one genuinely current operational message on the
 * left, and the help channels on the right, as the source site carries them.
 * Everything narrows gracefully — on a phone only the pickup line and the
 * phone number survive, because those are the two things a shopper acts on.
 */
export function AnnouncementBar() {
  return (
    <div className="bg-violet-900 text-white">
      <div className="page-container flex min-h-10 flex-wrap items-center justify-center gap-x-6 gap-y-1 py-1.5 text-small sm:justify-between">
        {site.pickup.available ? (
          <p className="flex items-center gap-2">
            <MapPin size={14} weight="light" aria-hidden="true" className="shrink-0 text-gold-500" />
            {site.pickup.label}{" "}
            <Link
              href="/kontakt"
              className="hidden underline decoration-white/40 underline-offset-3 transition-colors hover:decoration-white md:inline"
            >
              {site.pickup.address}
            </Link>
          </p>
        ) : (
          <span />
        )}

        <p className="flex items-center gap-x-4 gap-y-1">
          <span className="hidden text-violet-200 lg:inline">Potrebujete pomoč?</span>
          <a
            href={site.contact.phoneHref}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-gold-500"
          >
            <Phone size={13} weight="light" aria-hidden="true" className="shrink-0 text-gold-500" />
            {site.contact.phone}
          </a>
          <a
            href={`mailto:${site.contact.email}`}
            className="hidden items-center gap-1.5 transition-colors hover:text-gold-500 sm:inline-flex"
          >
            <EnvelopeSimple
              size={13}
              weight="light"
              aria-hidden="true"
              className="shrink-0 text-gold-500"
            />
            {site.contact.email}
          </a>
        </p>
      </div>
    </div>
  );
}
