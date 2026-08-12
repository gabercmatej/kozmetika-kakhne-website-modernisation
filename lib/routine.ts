import { optionLabel, products } from "./products";
import type { Product } from "./types";

/**
 * The shop's own category structure is already a routine: cleansing products,
 * then "podlage ali osrečevalci" (the layer applied before a cream), then
 * creams and oils. Targeted care is derived from the concern tags rather than
 * from a category, because that is where the concern data actually lives.
 */
export type StepId = "ocisti" | "pripravi" | "cilja" | "zascita";

export type RoutineStepDef = {
  id: StepId;
  order: number;
  title: string;
  purpose: string;
  category?: string;
  /** Nudges the pick toward the product type the step is actually about. */
  prefer?: RegExp;
  demote?: RegExp;
};

export const ROUTINE_STEPS: RoutineStepDef[] = [
  {
    id: "ocisti",
    order: 1,
    title: "Očistite",
    purpose: "Odstranite ličila in nečistoče, brez izsuševanja.",
    category: "izdelki-za-ciscenje-koze",
    prefer: /čistiln|cistiln|mleko|pena/i,
    demote: /odstranitev ličil|piling/i,
  },
  {
    id: "pripravi",
    order: 2,
    title: "Pripravite",
    purpose: "Podlaga pred kremo, ki navlaži in poveže nadaljnjo nego.",
    category: "podlage-ali-osrecevalci",
    prefer: /serum|mazilo|meglica/i,
  },
  {
    id: "cilja",
    order: 3,
    title: "Ciljno negujte",
    purpose: "Izdelek, izbran po tem, kar vas na koži moti.",
    prefer: /serum|dotox|krema proti|kolagenski|lifting|vitamin/i,
  },
  {
    id: "zascita",
    order: 4,
    title: "Zaključite",
    purpose: "Krema ali olje, ki nego zaklene in ščiti čez dan.",
    category: "kreme-in-olja-za-obraz",
    prefer: /krema/i,
  },
];

/**
 * Accusative forms, so the explanation reads as Slovenian rather than as
 * concatenated filter labels ("za suho kožo", not "za suha kožo").
 */
const TIP_ACC: Record<string, string> = {
  suha: "suho",
  obcutljiva: "občutljivo",
  normalna: "normalno",
  mesana: "mešano",
  problematicna: "problematično",
  mastna: "mastno",
};

const STANJE_ACC: Record<string, string> = {
  "pigmentni-madezi": "pigmentne madeže",
  podocnjaki: "podočnjake",
  "povesene-veke": "povešene veke",
  gube: "gube",
  akne: "akne",
  rdecica: "rdečico",
};

export type RoutineAnswers = {
  tipKoze: string | null;
  stanjeKoze: string | null;
  obcutljiva: boolean;
  depth: "osnovna" | "celovita";
};

export const EMPTY_ANSWERS: RoutineAnswers = {
  tipKoze: null,
  stanjeKoze: null,
  obcutljiva: false,
  depth: "celovita",
};

export type RoutineStepResult = {
  step: RoutineStepDef;
  product: Product;
  reason: string;
};

/** Multipacks, gift wraps and vouchers are purchases, not routine steps. */
const MULTIPACK = /^\d+\s*x\s|darilno pakiranje|darilni set|darilna|tester/i;

const isSelectable = (p: Product) =>
  p.inStock &&
  p.price != null &&
  p.price > 0 &&
  p.kind !== "accessory" &&
  p.kind !== "voucher" &&
  p.kind !== "mini" &&
  !MULTIPACK.test(p.name);

/**
 * Scores a product against the answers. Everything scored here is a real tag
 * from the catalogue, so a recommendation can always be explained back to the
 * customer in plain language.
 */
function scoreProduct(product: Product, answers: RoutineAnswers, step: RoutineStepDef): number {
  let score = 0;

  if (step.category) {
    if (!product.categories.includes(step.category)) return -Infinity;
  } else {
    /* The targeted step must be a single treatment for the stated concern. */
    if (!answers.stanjeKoze || !product.stanjeKoze.includes(answers.stanjeKoze)) return -Infinity;
    if (product.categories.includes("izdelki-za-ciscenje-koze")) return -Infinity;
    if (product.kind === "set") return -Infinity;
    score += 10;
  }

  if (step.prefer?.test(product.name)) score += 7;
  if (step.demote?.test(product.name)) score -= 9;

  if (answers.tipKoze && product.tipKoze.includes(answers.tipKoze)) score += 8;
  if (answers.obcutljiva && product.tipKoze.includes("obcutljiva")) score += 6;
  if (answers.stanjeKoze && product.stanjeKoze.includes(answers.stanjeKoze)) score += 5;

  if (product.badge === "Prodajna uspešnica") score += 4;
  if (product.badge === "Priporočajo strokovnjaki") score += 3;
  if (product.images.length > 1) score += 1;
  if (product.kind === "set") score -= 6;
  /* The finder asks nothing about gender, so the men's edition is never the
     default answer; it stays discoverable through the catalogue instead. */
  if (/mo[šs]ki special/i.test(product.name)) score -= 12;

  return score;
}

/**
 * Written as an impersonal clause so it stays grammatical regardless of the
 * product's gender ("Za suho kožo, naslavlja gube.").
 */
function reasonFor(product: Product, answers: RoutineAnswers, step: RoutineStepDef): string {
  const bits: string[] = [];

  if (answers.tipKoze && product.tipKoze.includes(answers.tipKoze)) {
    bits.push(`za ${TIP_ACC[answers.tipKoze] ?? optionLabel("tipKoze", answers.tipKoze)} kožo`);
  } else if (answers.obcutljiva && product.tipKoze.includes("obcutljiva")) {
    bits.push("za občutljivo kožo");
  }

  if (answers.stanjeKoze && product.stanjeKoze.includes(answers.stanjeKoze)) {
    bits.push(
      `naslavlja ${STANJE_ACC[answers.stanjeKoze] ?? optionLabel("stanjeKoze", answers.stanjeKoze)}`
    );
  }

  if (!bits.length) return step.purpose;
  const sentence = bits.join(", ");
  return sentence.charAt(0).toLocaleUpperCase("sl") + sentence.slice(1) + ".";
}

export function buildRoutine(answers: RoutineAnswers): RoutineStepResult[] {
  const steps =
    answers.depth === "osnovna"
      ? ROUTINE_STEPS.filter((s) => s.id !== "cilja")
      : ROUTINE_STEPS;

  const used = new Set<string>();
  const result: RoutineStepResult[] = [];

  for (const step of steps) {
    if (step.id === "cilja" && !answers.stanjeKoze) continue;

    const best = products
      .filter(isSelectable)
      .filter((p) => !used.has(p.slug))
      .map((product) => ({ product, score: scoreProduct(product, answers, step) }))
      .filter((r) => r.score > -Infinity)
      .sort((a, b) => b.score - a.score)[0];

    if (!best) continue;
    used.add(best.product.slug);
    result.push({ step, product: best.product, reason: reasonFor(best.product, answers, step) });
  }

  return result;
}

export const routineTotal = (steps: RoutineStepResult[]): number =>
  steps.reduce((sum, s) => sum + (s.product.price ?? 0), 0);

/** The routine shown on the homepage: a broadly suitable everyday sequence. */
export const featuredRoutine = (): RoutineStepResult[] =>
  buildRoutine({ tipKoze: "suha", stanjeKoze: "gube", obcutljiva: false, depth: "celovita" });
