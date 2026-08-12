import { NextResponse } from "next/server";

/**
 * MESSAGE STUB.
 *
 * Both customer-facing forms on this site end up in the same place on the live
 * shop: an email to the orders inbox. They therefore share one endpoint,
 * discriminated by `vrsta`, so that attaching a real mail transport (Gmail
 * API, SMTP, a transactional provider) is a single edit in a single file.
 *
 * This route validates the submission and returns a reference. It does NOT
 * send anything. See `deliver()` below and INTEGRATIONS.md.
 */

type Kind = "vprasanje" | "kartica-zvestobe";

type Payload = {
  vrsta?: Kind;
  ime?: string;
  email?: string;
  telefon?: string;
  tema?: string;
  sporocilo?: string;
  naslov?: string;
  postna?: string;
  kraj?: string;
  rojstvo?: string;
  pogoji?: boolean;
};

/** Which fields each form must carry, and the label used in the log line. */
const FORMS: Record<Kind, { label: string; required: (keyof Payload)[] }> = {
  vprasanje: {
    label: "Vprašanje strokovnjakinji",
    required: ["ime", "email", "sporocilo"],
  },
  "kartica-zvestobe": {
    label: "Prijava na kartico zvestobe",
    required: ["ime", "email", "telefon", "naslov", "postna", "kraj"],
  },
};

const LABELS: Partial<Record<keyof Payload, string>> = {
  ime: "Vnesite ime in priimek.",
  email: "Vnesite e-poštni naslov.",
  telefon: "Vnesite telefonsko številko.",
  sporocilo: "Napišite svoje vprašanje.",
  naslov: "Vnesite naslov.",
  postna: "Vnesite poštno številko.",
  kraj: "Vnesite kraj.",
};

/**
 * The single point where a real transport attaches. Give it a mail client and
 * this whole file becomes real; nothing else in the app needs to change.
 */
async function deliver(kind: Kind, payload: Payload, reference: string) {
  console.info(`[sporocilo:stub] ${FORMS[kind].label}`, {
    reference,
    email: payload.email,
    ime: payload.ime,
  });
}

export async function POST(request: Request) {
  let payload: Payload;
  try {
    payload = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "Neveljaven zahtevek." }, { status: 400 });
  }

  const kind = payload.vrsta;
  if (!kind || !(kind in FORMS)) {
    return NextResponse.json({ ok: false, error: "Neznana vrsta obrazca." }, { status: 400 });
  }

  const errors: Record<string, string> = {};

  for (const field of FORMS[kind].required) {
    const value = payload[field];
    if (typeof value !== "string" || value.trim().length < 2) {
      errors[field] = LABELS[field] ?? "To polje je obvezno.";
    }
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
    errors.email = "Vnesite veljaven e-poštni naslov.";
  }
  if (kind === "vprasanje" && payload.sporocilo && payload.sporocilo.trim().length < 15) {
    errors.sporocilo = "Opišite vprašanje z nekaj več besedami, da vam lahko koristno odgovorimo.";
  }
  if (kind === "kartica-zvestobe" && !payload.pogoji) {
    errors.pogoji = "Za prijavo potrebujemo vaše soglasje s splošnimi pogoji.";
  }

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  const reference = `KK-${Date.now().toString(36).toUpperCase()}`;
  await deliver(kind, payload, reference);

  return NextResponse.json({
    ok: true,
    reference,
    /* Explicit so no caller can mistake this for a delivered message. */
    stub: true,
    message:
      kind === "vprasanje"
        ? "Vprašanje je zabeleženo v predstavitvenem okolju. Pošta še ni povezana, zato odgovora ne bo."
        : "Prijava je zabeležena v predstavitvenem okolju. Pošta še ni povezana, zato kartice še ne bomo poslali.",
  });
}
