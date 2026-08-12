"use client";

import Link from "next/link";
import { Warning } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Choice, Field, Input } from "@/components/ui/field";
import { SentPanel } from "./sent-panel";
import { focusFirstError, submitMessage, type FormErrors } from "./submit";

/**
 * Loyalty card application. The fields are exactly the ones the live site's
 * own `loyalty_card_form` collects — name, address, post, town, email, phone,
 * date of birth and an agreement to the terms — so nothing extra is asked of
 * the visitor and nothing the shop expects is missing.
 */
const FIELDS = ["ime", "naslov", "postna", "kraj", "email", "telefon", "rojstvo"] as const;

export function LoyaltyForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ reference: string; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (sent) {
    return (
      <SentPanel title="Prijava je oddana" reference={sent.reference} message={sent.message}>
        <ButtonLink href="/produkti" variant="secondary">
          Poglejte izdelke
        </ButtonLink>
      </SentPanel>
    );
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const data = new FormData(event.currentTarget);
    const result = await submitMessage({
      vrsta: "kartica-zvestobe",
      ...Object.fromEntries(FIELDS.map((f) => [f, String(data.get(f) ?? "")])),
      pogoji: data.get("pogoji") === "on",
    });

    setSubmitting(false);
    if (!result.ok) {
      setErrors(result.errors);
      focusFirstError(formRef.current, result.errors);
      return;
    }
    setSent({ reference: result.reference, message: result.message });
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-5">
      {errors.form ? (
        <p role="alert" className="border border-danger bg-danger-soft p-4 text-base text-danger">
          {errors.form}
        </p>
      ) : null}

      <Field label="Ime in priimek" htmlFor="ime" error={errors.ime}>
        <Input id="ime" name="ime" autoComplete="name" required invalid={!!errors.ime} />
      </Field>

      <Field label="Naslov" htmlFor="naslov" error={errors.naslov}>
        <Input
          id="naslov"
          name="naslov"
          autoComplete="street-address"
          required
          invalid={!!errors.naslov}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)]">
        <Field label="Poštna številka" htmlFor="postna" error={errors.postna}>
          <Input
            id="postna"
            name="postna"
            inputMode="numeric"
            autoComplete="postal-code"
            required
            invalid={!!errors.postna}
          />
        </Field>
        <Field label="Kraj" htmlFor="kraj" error={errors.kraj}>
          <Input
            id="kraj"
            name="kraj"
            autoComplete="address-level2"
            required
            invalid={!!errors.kraj}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="E-pošta" htmlFor="email" error={errors.email}>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            invalid={!!errors.email}
          />
        </Field>
        <Field label="Telefon" htmlFor="telefon" error={errors.telefon}>
          <Input
            id="telefon"
            name="telefon"
            type="tel"
            autoComplete="tel"
            required
            invalid={!!errors.telefon}
          />
        </Field>
      </div>

      <Field
        label="Datum rojstva"
        htmlFor="rojstvo"
        hint="Za voščilo in rojstnodnevno ugodnost."
        optional
        className="sm:max-w-[16rem]"
      >
        <Input id="rojstvo" name="rojstvo" type="date" autoComplete="bday" />
      </Field>

      <div className="border-t border-border pt-5">
        <Choice
          type="checkbox"
          name="pogoji"
          id="pogoji"
          label="Strinjam se s splošnimi pogoji"
          description="Kartico in obvestila o ugodnostih prejemate na zgornji naslov."
        />
        {errors.pogoji ? (
          <p className="mt-1 flex items-start gap-1.5 text-small font-medium text-danger">
            <Warning size={15} weight="fill" aria-hidden="true" className="mt-0.5 shrink-0" />
            {errors.pogoji}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3">
        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? "Pošiljam…" : "Pridobite kartico zvestobe"}
        </Button>
        <p className="text-small text-muted">
          S prijavo potrjujete{" "}
          <Link href="/splosni-pogoji" className="underline underline-offset-3 hover:text-violet-700">
            splošne pogoje
          </Link>{" "}
          in{" "}
          <Link
            href="/politika-zasebnosti"
            className="underline underline-offset-3 hover:text-violet-700"
          >
            politiko zasebnosti
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
