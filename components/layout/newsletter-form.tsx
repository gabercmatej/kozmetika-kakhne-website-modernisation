"use client";

import { ArrowRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * The live site posts to Squalomail. There is no list credential in this
 * project, so the form validates and confirms locally and the submit handler
 * is the documented integration point (see INTEGRATIONS.md).
 */
export function NewsletterForm({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const dark = tone === "dark";

  if (done) {
    return (
      <p
        className={cn(
          "flex items-start gap-2 text-base",
          dark ? "text-violet-200" : "text-ink-soft"
        )}
      >
        <CheckCircle
          size={18}
          weight="fill"
          aria-hidden="true"
          className={cn("mt-0.5 shrink-0", dark ? "text-gold-500" : "text-success")}
        />
        Hvala. Prijava je zabeležena, potrditev prejmete po e-pošti.
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
          setError("Vnesite veljaven e-poštni naslov.");
          return;
        }
        if (!consent) {
          setError("Za prijavo potrebujemo vaše soglasje.");
          return;
        }
        setError(null);
        setDone(true);
      }}
      className="grid gap-3"
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={id} className="sr-only">
            E-poštni naslov
          </label>
          <input
            id={id}
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            placeholder="vase@ime.si"
            className={cn(
              "h-12 w-full rounded border px-3.5 text-body transition-colors focus:outline-2 focus:outline-offset-2 focus:outline-violet-500",
              dark
                ? "border-white/25 bg-white/8 text-white placeholder:text-violet-200/70 focus:border-white"
                : "border-border-control bg-white text-ink placeholder:text-faint focus:border-violet-700"
            )}
          />
        </div>
        <Button type="submit" variant={dark ? "onDark" : "primary"} size="lg">
          Prijava
          <ArrowRight size={16} weight="bold" aria-hidden="true" />
        </Button>
      </div>

      <label
        className={cn(
          "flex cursor-pointer items-start gap-2.5 text-small",
          dark ? "text-violet-200" : "text-muted"
        )}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cn(
            "mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-xs border transition-colors",
            "peer-checked:[&>svg]:scale-100 peer-checked:[&>svg]:opacity-100",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-500",
            dark
              ? "border-white/40 bg-transparent peer-checked:border-gold-500 peer-checked:bg-gold-500"
              : "border-border-control bg-white peer-checked:border-violet-700 peer-checked:bg-violet-700"
          )}
        >
          <svg
            viewBox="0 0 16 16"
            className={cn(
              "h-3 w-3 scale-50 opacity-0 transition-[opacity,transform] duration-150",
              dark ? "text-violet-950" : "text-white"
            )}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.4l3.2 3.2L13 4.8" />
          </svg>
        </span>
        <span>
          Strinjam se z obdelavo podatkov za pošiljanje e-novic. Odjava je mogoča kadar koli.
        </span>
      </label>

      {error ? (
        <p id={`${id}-error`} role="alert" className={cn("text-small font-medium", dark ? "text-gold-500" : "text-danger")}>
          {error}
        </p>
      ) : null}

      <p className={cn("text-small", dark ? "text-violet-200/80" : "text-muted")}>
        Ob prijavi prejmete {site.newsletter.discountPercent}% popusta na celoten nakup.
      </p>
    </form>
  );
}
