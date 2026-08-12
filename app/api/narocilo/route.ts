import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";

/**
 * ORDER STUB.
 *
 * This project is a storefront rebuild; the live shop's ordering, payment and
 * inventory systems run on a separate platform that is not reachable from
 * here. This endpoint therefore validates the submission, recomputes the total
 * server-side from the catalogue (never trusting client prices) and returns a
 * reference. It does NOT take payment, reserve stock or create a real order.
 *
 * See INTEGRATIONS.md for exactly where a payment provider and order API
 * attach.
 */

type Line = { slug: string; quantity: number };

type OrderPayload = {
  email?: string;
  ime?: string;
  priimek?: string;
  telefon?: string;
  naslov?: string;
  postna?: string;
  kraj?: string;
  dostava?: "dostava" | "prevzem";
  opomba?: string;
  lines?: Line[];
};

const required: (keyof OrderPayload)[] = ["email", "ime", "priimek", "telefon"];

export async function POST(request: Request) {
  let payload: OrderPayload;
  try {
    payload = (await request.json()) as OrderPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Neveljaven zahtevek." }, { status: 400 });
  }

  const errors: Record<string, string> = {};

  for (const field of required) {
    if (!payload[field] || String(payload[field]).trim().length < 2) {
      errors[field] = "To polje je obvezno.";
    }
  }
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email)) {
    errors.email = "Vnesite veljaven e-poštni naslov.";
  }
  if (payload.dostava === "dostava") {
    if (!payload.naslov?.trim()) errors.naslov = "Za dostavo potrebujemo naslov.";
    if (!payload.postna?.trim()) errors.postna = "Vnesite poštno številko.";
    if (!payload.kraj?.trim()) errors.kraj = "Vnesite kraj.";
  }

  const lines = Array.isArray(payload.lines) ? payload.lines : [];
  if (!lines.length) errors.lines = "Košarica je prazna.";

  if (Object.keys(errors).length) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  /* Prices come from the catalogue, never from the request body. */
  let subtotal = 0;
  const resolved: { slug: string; name: string; quantity: number; price: number }[] = [];
  for (const line of lines) {
    const product = getProduct(line.slug);
    if (!product || product.price == null) continue;
    const quantity = Math.min(99, Math.max(1, Math.round(Number(line.quantity) || 1)));
    subtotal += product.price * quantity;
    resolved.push({ slug: product.slug, name: product.name, quantity, price: product.price });
  }

  if (!resolved.length) {
    return NextResponse.json(
      { ok: false, errors: { lines: "Izdelkov v košarici ni bilo mogoče prepoznati." } },
      { status: 422 }
    );
  }

  const reference = `KK-${Date.now().toString(36).toUpperCase()}`;

  console.info("[narocilo:stub] povpraševanje prejeto", {
    reference,
    email: payload.email,
    dostava: payload.dostava,
    items: resolved.length,
    subtotal: Number(subtotal.toFixed(2)),
  });

  return NextResponse.json({
    ok: true,
    reference,
    subtotal: Number(subtotal.toFixed(2)),
    items: resolved,
    /* Explicit so no caller can mistake this for a completed transaction. */
    stub: true,
    message:
      "Naročilo je zabeleženo v predstavitvenem okolju. Plačilo ni bilo izvedeno.",
  });
}
