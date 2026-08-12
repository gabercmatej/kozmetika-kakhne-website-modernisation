"use client";

import Link from "next/link";
import { PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { SentPanel } from "./sent-panel";
import { focusFirstError, submitMessage, type FormErrors } from "./submit";

/**
 * "Zastavite vprašanje" — the enquiry the source site only ever offered as an
 * email address. The topics mirror the four things the shop's own copy says it
 * answers, so a question arrives already routed.
 */
const TOPICS = [
  "Nega kože in izbira izdelkov",
  "Naročilo in dostava",
  "Kartica zvestobe",
  "Sodelovanje in prodajna mesta",
  "Drugo",
] as const;

const FIELDS = ["ime", "email", "telefon", "tema", "sporocilo"] as const;

export function QuestionForm() {
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<{ reference: string; message: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  if (sent) {
    return (
      <SentPanel title="Hvala za vaše vprašanje" reference={sent.reference} message={sent.message}>
        <ButtonLink href="/nasveti-strokovnjakov" variant="secondary">
          Preberite obstoječe odgovore
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
      vrsta: "vprasanje",
      ...Object.fromEntries(FIELDS.map((f) => [f, String(data.get(f) ?? "")])),
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Ime in priimek" htmlFor="ime" error={errors.ime}>
          <Input id="ime" name="ime" autoComplete="name" required invalid={!!errors.ime} />
        </Field>
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
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Telefon" htmlFor="telefon" optional>
          <Input id="telefon" name="telefon" type="tel" autoComplete="tel" />
        </Field>
        <Field label="Tema" htmlFor="tema">
          <Select id="tema" name="tema" defaultValue={TOPICS[0]}>
            {TOPICS.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Vaše vprašanje"
        htmlFor="sporocilo"
        hint="Opišite tip kože in kaj vas moti — bolj natančno kot opišete, bolj uporaben bo odgovor."
        error={errors.sporocilo}
      >
        <Textarea
          id="sporocilo"
          name="sporocilo"
          rows={6}
          required
          invalid={!!errors.sporocilo}
          placeholder="Na primer: koža mi je pozimi suha okoli nosu in na licih, poleti pa se mastí na čelu."
        />
      </Field>

      <div className="grid gap-3 border-t border-border pt-5">
        <Button type="submit" variant="primary" size="lg" disabled={submitting}>
          {submitting ? "Pošiljam…" : "Pošljite vprašanje"}
          <PaperPlaneTilt size={17} weight="bold" aria-hidden="true" />
        </Button>
        <p className="text-small text-muted">
          Vaše podatke uporabimo samo za odgovor na to vprašanje. Več v{" "}
          <Link
            href="/politika-zasebnosti"
            className="underline underline-offset-3 hover:text-violet-700"
          >
            politiki zasebnosti
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
