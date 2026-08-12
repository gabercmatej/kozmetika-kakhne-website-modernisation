"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowsClockwise } from "@phosphor-icons/react/dist/ssr";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import { AddRoutineButton } from "@/components/commerce/add-routine-button";
import { AddToCartButton } from "@/components/commerce/add-to-cart";
import { ProductImage } from "@/components/commerce/product-image";
import { Button, ButtonLink } from "@/components/ui/button";
import { displayName, formatPrice } from "@/lib/format";
import { filterGroups, primaryImage } from "@/lib/products";
import { buildRoutine, EMPTY_ANSWERS, routineTotal, type RoutineAnswers } from "@/lib/routine";
import { cn } from "@/lib/utils";

type Question = {
  id: keyof RoutineAnswers;
  title: string;
  help: string;
  options: { value: string; label: string }[];
  optional?: boolean;
};

/**
 * Four short questions mapped onto tags that already exist in the catalogue.
 * Every step can be skipped, and the result explains itself, because this is
 * guidance rather than any kind of diagnosis.
 */
const QUESTIONS: Question[] = [
  {
    id: "tipKoze",
    title: "Kako bi opisali svojo kožo?",
    help: "Izberite tisto, kar velja večino časa.",
    options: filterGroups.tipKoze,
  },
  {
    id: "stanjeKoze",
    title: "Kaj bi najraje izboljšali?",
    help: "Eno stvar, ki vas najbolj moti.",
    options: filterGroups.stanjeKoze,
    optional: true,
  },
  {
    id: "obcutljiva",
    title: "Je vaša koža občutljiva?",
    help: "Se hitro pordeči, peče ali reagira na nove izdelke?",
    options: [
      { value: "da", label: "Da, pogosto reagira" },
      { value: "ne", label: "Ne posebej" },
    ],
  },
  {
    id: "depth",
    title: "Kakšno rutino želite?",
    help: "Vedno lahko začnete manjše in dodate pozneje.",
    options: [
      { value: "osnovna", label: "Osnovna, trije koraki" },
      { value: "celovita", label: "Celovita, štirje koraki" },
    ],
  },
];

export function RoutineFinder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<RoutineAnswers>(EMPTY_ANSWERS);
  const [done, setDone] = useState(false);
  const reduce = useReducedMotion();

  const routine = useMemo(() => (done ? buildRoutine(answers) : []), [done, answers]);
  const total = routineTotal(routine);

  const answer = (question: Question, value: string | null) => {
    setAnswers((prev) => {
      if (question.id === "obcutljiva") return { ...prev, obcutljiva: value === "da" };
      if (question.id === "depth")
        return { ...prev, depth: (value as RoutineAnswers["depth"]) ?? "celovita" };
      return { ...prev, [question.id]: value };
    });
    if (step === QUESTIONS.length - 1) setDone(true);
    else setStep((s) => s + 1);
  };

  const currentValue = (question: Question): string | null => {
    if (question.id === "obcutljiva") return answers.obcutljiva ? "da" : "ne";
    if (question.id === "depth") return answers.depth;
    return (answers[question.id] as string | null) ?? null;
  };

  if (done) {
    return (
      <div className="mt-10">
        {routine.length ? (
          <>
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-h2">Predlagana rutina</h2>
                <p className="mt-2 max-w-xl text-base text-muted">
                  Sestavljena iz izdelkov, ki so v našem katalogu označeni kot primerni za vaše
                  odgovore. To ni medicinska diagnoza.
                </p>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <p className="text-base text-muted">Skupaj</p>
                <p className="font-display text-h2 tabular-nums">{formatPrice(total)}</p>
              </div>
            </div>

            <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {routine.map((entry, i) => {
                const image = primaryImage(entry.product);
                return (
                  <motion.li
                    key={entry.step.id}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col border border-border bg-white p-4"
                  >
                    <p className="flex items-baseline gap-2">
                      <span className="font-display text-title leading-none text-violet-700">
                        {String(entry.step.order).padStart(2, "0")}
                      </span>
                      <span className="text-base font-medium">{entry.step.title}</span>
                    </p>

                    <Link href={`/produkt/${entry.product.slug}`} className="group mt-4 block">
                      <ProductImage
                        image={image}
                        sizes="(min-width: 1024px) 22vw, 45vw"
                        className="aspect-square w-full"
                        inset="sm"
                        imageClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.04]"
                      />
                      <p className="mt-3 text-base font-medium leading-snug text-ink transition-colors group-hover:text-violet-700">
                        {displayName(entry.product.name)}
                      </p>
                    </Link>

                    <p className="mt-1.5 flex-1 text-small text-muted">{entry.reason}</p>

                    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <span className="text-base tabular-nums">
                        {formatPrice(entry.product.price)}
                      </span>
                      <AddToCartButton
                        product={entry.product}
                        size="sm"
                        variant="secondary"
                        label="Dodaj"
                      />
                    </div>
                  </motion.li>
                );
              })}
            </ol>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <AddRoutineButton slugs={routine.map((r) => r.product.slug)} />
              <Button
                variant="ghost"
                onClick={() => {
                  setAnswers(EMPTY_ANSWERS);
                  setStep(0);
                  setDone(false);
                }}
              >
                <ArrowsClockwise size={16} weight="light" aria-hidden="true" />
                Začni znova
              </Button>
            </div>
          </>
        ) : (
          <div className="border border-dashed border-border-strong bg-white p-10 text-center">
            <p className="font-display text-h3">Za te odgovore nismo našli celotne rutine</p>
            <p className="mx-auto mt-2 max-w-md text-base text-muted">
              Poskusite z drugačno kombinacijo ali si oglejte celoten izbor.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => {
                  setAnswers(EMPTY_ANSWERS);
                  setStep(0);
                  setDone(false);
                }}
              >
                Začni znova
              </Button>
              <ButtonLink href="/produkti" variant="secondary">
                Vsi izdelki
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    );
  }

  const question = QUESTIONS[step];
  const selected = currentValue(question);

  /* The reading column is capped per element rather than on the wrapper: two
     of the four questions carry six options that need ~735px laid out in a
     row, and a 42rem wrapper wrapped them onto a second line as 5 + 1. The
     prose stays at its measure; only the answer row is allowed to run wider. */
  return (
    <div className="mt-10">
      <div className="flex max-w-2xl items-center gap-3">
        <div
          className="h-0.5 flex-1 bg-border"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={QUESTIONS.length}
          aria-valuenow={step + 1}
          aria-label="Napredek"
        >
          <div
            className="h-full bg-violet-700 transition-[width] duration-500 ease-[var(--ease-out-soft)]"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="shrink-0 text-small tabular-nums text-muted">
          {step + 1} / {QUESTIONS.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
          transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8"
        >
          <fieldset>
            <legend className="max-w-2xl font-display text-h2">{question.title}</legend>
            <p className="mt-2 max-w-2xl text-base text-muted">{question.help}</p>

            <div className="mt-6 flex max-w-4xl flex-wrap gap-2.5">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={selected === option.value}
                  onClick={() => answer(question, option.value)}
                  className={cn(
                    "min-h-12 rounded border px-5 text-base transition-colors",
                    selected === option.value
                      ? "border-violet-700 bg-violet-700 text-white"
                      : "border-border-control bg-white text-ink hover:border-violet-700 hover:text-violet-700"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-8 flex max-w-2xl items-center gap-4">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft size={15} weight="bold" aria-hidden="true" />
                Nazaj
              </Button>
            ) : null}
            {question.optional ? (
              <Button variant="quiet" onClick={() => answer(question, null)}>
                Preskoči
                <ArrowRight size={15} weight="bold" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
