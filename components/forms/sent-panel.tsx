import { CheckCircle, Info } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

/**
 * Confirmation shown in place of a submitted form. It states the demo status
 * plainly rather than implying a message left the building — see
 * `app/api/sporocilo/route.ts`.
 */
export function SentPanel({
  title,
  reference,
  message,
  children,
}: {
  title: string;
  reference: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="border border-border bg-white p-8">
      <CheckCircle size={34} weight="light" aria-hidden="true" className="text-success" />
      <h2 className="mt-4 font-display text-h3">{title}</h2>
      <p className="mt-2 text-base text-muted">
        Referenca <span className="font-medium text-ink">{reference}</span>
      </p>
      <p
        role="status"
        className="mt-5 flex items-start gap-2 border border-gold-200 bg-gold-50 p-4 text-base text-ink-soft"
      >
        <Info size={17} weight="light" aria-hidden="true" className="mt-0.5 shrink-0 text-gold-700" />
        {message}
      </p>
      {children ? <div className="mt-6">{children}</div> : null}
    </div>
  );
}
