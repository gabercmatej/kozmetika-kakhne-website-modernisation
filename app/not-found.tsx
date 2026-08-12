import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PetalMark } from "@/components/ui/mark";
import { CONCERNS, concernHref } from "@/lib/concerns";

export default function NotFound() {
  return (
    <div className="page-container flex min-h-[60dvh] flex-col items-center justify-center py-24 text-center">
      <PetalMark className="h-8 w-8 text-violet-200" />
      <h1 className="mt-6 text-h1">Te strani ni</h1>
      <p className="mt-3 max-w-md text-lead text-muted">
        Povezava je morda zastarela. Poiščite izdelek po imenu ali po tem, kar vas na koži moti.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/produkti" variant="primary" size="lg">
          Vsi izdelki
        </ButtonLink>
        <ButtonLink href="/rutina" variant="secondary" size="lg">
          Poiščite svojo rutino
        </ButtonLink>
      </div>

      <div className="mt-12">
        <p className="text-small text-muted">Pogosto iskano</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {CONCERNS.map((concern) => (
            <li key={concern.value}>
              <Link
                href={concernHref(concern.value)}
                className="inline-flex min-h-10 items-center rounded border border-border bg-white px-3.5 text-base transition-colors hover:border-violet-700 hover:text-violet-700"
              >
                {concern.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
