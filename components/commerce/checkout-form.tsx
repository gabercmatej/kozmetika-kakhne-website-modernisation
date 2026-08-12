"use client";

import Image from "next/image";
import Link from "next/link";
import { CaretDown, CheckCircle, Info, MapPin, Truck } from "@phosphor-icons/react/dist/ssr";
import { useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { useCart } from "@/lib/cart";
import { displayName, formatPrice, productCount } from "@/lib/format";
import { primaryImage } from "@/lib/products";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

type Errors = Record<string, string>;
type Delivery = "dostava" | "prevzem";

const FIELDS = [
  "email",
  "ime",
  "priimek",
  "telefon",
  "naslov",
  "postna",
  "kraj",
  "opomba",
] as const;

export function CheckoutForm() {
  const { items, count, subtotal, ready, clear } = useCart();
  const [delivery, setDelivery] = useState<Delivery>("dostava");
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ reference: string; message: string } | null>(
    null
  );
  const [summaryOpen, setSummaryOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  if (!ready) {
    return <Skeleton className="mt-10 h-96 w-full" />;
  }

  if (confirmation) {
    return (
      <div className="mx-auto mt-10 max-w-xl border border-border bg-white p-8 text-center">
        <CheckCircle size={36} weight="light" aria-hidden="true" className="mx-auto text-success" />
        <h2 className="mt-4 font-display text-h2">Hvala za naročilo</h2>
        <p className="mt-2 text-base text-muted">
          Referenca <span className="font-medium text-ink">{confirmation.reference}</span>
        </p>
        <p
          role="status"
          className="mt-5 flex items-start gap-2 border border-gold-200 bg-gold-50 p-4 text-left text-base text-ink-soft"
        >
          <Info size={17} weight="light" aria-hidden="true" className="mt-0.5 shrink-0 text-gold-700" />
          {confirmation.message}
        </p>
        <ButtonLink href="/produkti" variant="primary" className="mt-6">
          Nazaj v trgovino
        </ButtonLink>
      </div>
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        className="mt-10"
        title="Za oddajo naročila potrebujete izdelke v košarici"
        action={
          <ButtonLink href="/produkti" variant="primary">
            Poglejte izdelke
          </ButtonLink>
        }
      />
    );
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const data = new FormData(event.currentTarget);
    const payload = {
      ...Object.fromEntries(FIELDS.map((f) => [f, String(data.get(f) ?? "")])),
      dostava: delivery,
      lines: items.map((i) => ({ slug: i.product.slug, quantity: i.quantity })),
    };

    try {
      const response = await fetch("/api/narocilo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      if (!response.ok) {
        setErrors(result.errors ?? { form: result.error ?? "Naročila ni bilo mogoče oddati." });
        /* Move focus to the first field that failed, values are untouched. */
        const firstKey = Object.keys(result.errors ?? {})[0];
        if (firstKey) {
          const node = formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`);
          node?.focus();
          node?.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        return;
      }

      clear();
      setConfirmation({ reference: result.reference, message: result.message });
    } catch {
      setErrors({ form: "Povezave ni bilo mogoče vzpostaviti. Poskusite znova." });
    } finally {
      setSubmitting(false);
    }
  };

  /*
   * `[&>*]:min-w-0` is load-bearing, not tidying.
   *
   * Grid items default to `min-width: auto`, which floors them at their
   * min-content width — and the line-item name below is a `-webkit-box`
   * clamp inside a flex row whose sibling price cannot shrink. Before the
   * clamp replaced a `truncate`, that name was `white-space: nowrap`, so its
   * min-content was the whole untruncated string: "Darilno pakiranje Naravno
   * mazilo iz morskih alg in 2 mini kremi po izboru" measured 509px inside a
   * 467px box, the grid refused to go below 651px, and every row — names,
   * prices, the total — hung out past the right border of the white panel.
   * The floor has to be released explicitly; the clamp alone would not have
   * been enough had any child ever set nowrap again.
   */
  const summary = (
    <div className="grid gap-4 [&>*]:min-w-0">
      <ul className="grid gap-4">
        {items.map(({ product, quantity, lineTotal }) => {
          const image = primaryImage(product);
          return (
            <li key={product.slug} className="flex items-center gap-3">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-white">
                {image ? (
                  <Image src={image.src} alt="" fill sizes="56px" className="object-contain p-1" />
                ) : null}
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-violet-700 px-1 text-[10px] font-semibold text-white tabular-nums">
                  {quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                {/* Clamped over two lines rather than truncated to one. The
                    gift packages run to eleven words, and an order summary
                    that ends a name at "Darilno pakiranje Naravno mazilo iz…"
                    is asking someone to confirm a purchase they cannot read. */}
                <p className="line-clamp-2 text-base font-medium leading-snug text-ink">
                  {displayName(product.name)}
                </p>
                {product.volume ? (
                  <p className="text-small text-muted">{product.volume}</p>
                ) : null}
              </div>
              <p className="shrink-0 text-base tabular-nums">{formatPrice(lineTotal)}</p>
            </li>
          );
        })}
      </ul>

      <dl className="grid gap-2 border-t border-border pt-4 text-base">
        <div className="flex items-baseline justify-between">
          <dt className="text-muted">Izdelki</dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between">
          <dt className="text-muted">{delivery === "prevzem" ? "Osebni prevzem" : "Dostava"}</dt>
          <dd className={cn("tabular-nums", delivery === "prevzem" && "text-success")}>
            {delivery === "prevzem" ? "Brezplačno" : "Po ceniku"}
          </dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between border-t border-border pt-4">
        <span className="text-base font-medium">Za plačilo</span>
        <span className="font-display text-h3 tabular-nums">{formatPrice(subtotal)}</span>
      </div>
      <p className="text-small text-muted">
        Cene vključujejo DDV. {delivery === "dostava"
          ? "Končni strošek dostave je prikazan pred potrditvijo."
          : `Prevzem na naslovu ${site.pickup.address}.`}
      </p>
    </div>
  );

  return (
    <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
      <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-10">
        {errors.form ? (
          <p role="alert" className="border border-danger bg-danger-soft p-4 text-base text-danger">
            {errors.form}
          </p>
        ) : null}

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-display text-h3">Kontakt</legend>
          <Field label="E-pošta" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Ime" htmlFor="ime" error={errors.ime}>
              <Input id="ime" name="ime" autoComplete="given-name" required invalid={!!errors.ime} />
            </Field>
            <Field label="Priimek" htmlFor="priimek" error={errors.priimek}>
              <Input
                id="priimek"
                name="priimek"
                autoComplete="family-name"
                required
                invalid={!!errors.priimek}
              />
            </Field>
          </div>
          <Field label="Telefon" htmlFor="telefon" hint="Potrebujemo ga za dostavo." error={errors.telefon}>
            <Input
              id="telefon"
              name="telefon"
              type="tel"
              autoComplete="tel"
              required
              invalid={!!errors.telefon}
            />
          </Field>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-display text-h3">Način prevzema</legend>

          <div className="grid gap-3">
            <DeliveryOption
              value="dostava"
              current={delivery}
              onSelect={setDelivery}
              icon={<Truck size={20} weight="light" aria-hidden="true" />}
              title="Dostava po Sloveniji"
              body="Strošek dostave je prikazan pred potrditvijo naročila."
            />
            <DeliveryOption
              value="prevzem"
              current={delivery}
              onSelect={setDelivery}
              icon={<MapPin size={20} weight="light" aria-hidden="true" />}
              title={site.pickup.label}
              body={`${site.pickup.address}. ${site.pickup.note}.`}
              highlight="Brezplačno"
            />
          </div>

          {delivery === "dostava" ? (
            <div className="grid gap-4 pt-2">
              <Field label="Naslov" htmlFor="naslov" error={errors.naslov}>
                <Input
                  id="naslov"
                  name="naslov"
                  autoComplete="street-address"
                  invalid={!!errors.naslov}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,8rem)_minmax(0,1fr)]">
                <Field label="Poštna številka" htmlFor="postna" error={errors.postna}>
                  <Input
                    id="postna"
                    name="postna"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    invalid={!!errors.postna}
                  />
                </Field>
                <Field label="Kraj" htmlFor="kraj" error={errors.kraj}>
                  <Input
                    id="kraj"
                    name="kraj"
                    autoComplete="address-level2"
                    invalid={!!errors.kraj}
                  />
                </Field>
              </div>
              <Field label="Država" htmlFor="drzava">
                <Select id="drzava" name="drzava" defaultValue="SI" autoComplete="country">
                  <option value="SI">Slovenija</option>
                </Select>
              </Field>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-display text-h3">Opomba</legend>
          <Field label="Sporočilo ob naročilu" htmlFor="opomba" optional>
            <Textarea id="opomba" name="opomba" placeholder="Na primer: pustite pri sosedu." />
          </Field>
        </fieldset>

        <div className="grid gap-3 border-t border-border pt-6">
          <p className="flex items-start gap-2 border border-gold-200 bg-gold-50 p-4 text-small text-ink-soft">
            <Info size={16} weight="light" aria-hidden="true" className="mt-0.5 shrink-0 text-gold-700" />
            To je predstavitvena blagajna. Naročilo se zabeleži, plačilo pa se ne izvede.
          </p>
          <Button type="submit" variant="primary" size="lg" fullWidth disabled={submitting}>
            {submitting ? "Oddajam…" : `Oddaj naročilo · ${formatPrice(subtotal)}`}
          </Button>
          <p className="text-small text-muted">
            Z oddajo potrjujete{" "}
            <Link href="/splosni-pogoji" className="underline underline-offset-3 hover:text-violet-700">
              splošne pogoje
            </Link>{" "}
            in{" "}
            <Link href="/politika-zasebnosti" className="underline underline-offset-3 hover:text-violet-700">
              politiko zasebnosti
            </Link>
            .
          </p>
        </div>
      </form>

      {/* On a phone the summary leads. Left in DOM order it landed below the
          submit button, so the shopper filled eight fields before anything
          confirmed what they were buying or what it cost. The desktop
          two-column placement is unchanged — `order` only applies below lg. */}
      <aside aria-label="Povzetek naročila" className="max-lg:order-first">
        {/* Expandable on mobile, always visible on desktop. */}
        <div className="lg:hidden">
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            aria-expanded={summaryOpen}
            className="flex min-h-14 w-full items-center justify-between gap-3 border border-border bg-white px-4 text-base"
          >
            <span className="font-medium">
              Povzetek · {productCount(count)}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-display text-title tabular-nums">{formatPrice(subtotal)}</span>
              <CaretDown
                size={16}
                weight="light"
                aria-hidden="true"
                className={cn("transition-transform duration-300", summaryOpen && "rotate-180")}
              />
            </span>
          </button>
          {summaryOpen ? (
            <div className="border border-t-0 border-border bg-white p-4">{summary}</div>
          ) : null}
        </div>

        <div className="hidden border border-border bg-white p-6 lg:sticky lg:top-28 lg:block">
          <h2 className="mb-4 font-sans text-body font-medium">
            Povzetek · {productCount(count)}
          </h2>
          {summary}
        </div>
      </aside>
    </div>
  );
}

function DeliveryOption({
  value,
  current,
  onSelect,
  icon,
  title,
  body,
  highlight,
}: {
  value: Delivery;
  current: Delivery;
  onSelect: (v: Delivery) => void;
  icon: React.ReactNode;
  title: string;
  body: string;
  highlight?: string;
}) {
  const active = current === value;
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 border p-4 transition-colors",
        active ? "border-violet-700 bg-violet-50" : "border-border-control bg-white hover:border-violet-500"
      )}
    >
      <input
        type="radio"
        name="dostava"
        value={value}
        checked={active}
        onChange={() => onSelect(value)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border bg-white",
          "border-border-control transition-colors peer-checked:border-violet-700 peer-checked:bg-violet-700",
          "peer-checked:[&>span]:scale-100",
          "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-violet-500"
        )}
      >
        <span className="h-1.5 w-1.5 scale-0 rounded-full bg-white transition-transform duration-150" />
      </span>
      <span className="shrink-0 text-gold-700">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base font-medium text-ink">{title}</span>
          {highlight ? (
            <span className="rounded-xs bg-success px-1.5 py-0.5 text-micro font-medium text-white">
              {highlight}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-small text-muted">{body}</span>
      </span>
    </label>
  );
}
