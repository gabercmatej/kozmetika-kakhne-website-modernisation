/**
 * The source catalogue stores product names in full or partial capitals.
 * Shouting every name hurts scanning and reads dated, so names are normalised
 * to Slovenian sentence case:
 *
 *   1. all-capital words are lowercased, unless they are genuine acronyms
 *   2. words the source already wrote in mixed case are left alone, because
 *      those are proper nouns (Lipesters, Skin Defender, Hialuron)
 *   3. the first letter of the result is capitalised
 */
const ACRONYMS = new Set(["DOTOX", "SPF", "SPF10", "UV", "CSS", "EU", "GMP", "INCI", "A", "C", "E"]);

const PROPER: Record<string, string> = {
  JASNA: "Jasna",
  KAHNE: "Kahne",
  NAMI: "NAMI",
  MONAKO: "Monako",
};

const isAllCaps = (word: string) => {
  const letters = word.replace(/[^\p{L}]/gu, "");
  return letters.length > 0 && letters === letters.toLocaleUpperCase("sl");
};

export function displayName(raw: string): string {
  if (!raw) return "";

  const result = raw
    .split(/(\s+)/)
    .map((token) => {
      if (/^\s+$/.test(token)) return token;
      const bare = token.replace(/[^\p{L}\p{N}]/gu, "").toLocaleUpperCase("sl");
      if (PROPER[bare]) return token.replace(/\p{L}+/u, PROPER[bare]);
      if (ACRONYMS.has(bare)) return token;
      if (!isAllCaps(token)) return token;
      return token.toLocaleLowerCase("sl");
    })
    .join("")
    .replace(/\s{2,}/g, " ")
    .trim();

  return result.charAt(0).toLocaleUpperCase("sl") + result.slice(1);
}

const eur = new Intl.NumberFormat("sl-SI", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

export const formatPrice = (value: number | null | undefined): string =>
  value == null ? "" : eur.format(value);

/** "15.12.2022" -> "15. december 2022" */
const MONTHS = [
  "januar",
  "februar",
  "marec",
  "april",
  "maj",
  "junij",
  "julij",
  "avgust",
  "september",
  "oktober",
  "november",
  "december",
];

export function formatDate(raw: string | null | undefined): string {
  if (!raw) return "";
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return raw;
  const month = MONTHS[Number(m[2]) - 1];
  return month ? `${Number(m[1])}. ${month} ${m[3]}` : raw;
}

/** ISO form for <time datetime> and structured data. */
export function isoDate(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  const m = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return undefined;
  return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
}

/** Slovenian plural for counts: 1 izdelek, 2 izdelka, 3 izdelki, 5 izdelkov. */
export function plural(n: number, forms: [string, string, string, string]): string {
  const mod100 = n % 100;
  if (mod100 === 1) return forms[0];
  if (mod100 === 2) return forms[1];
  if (mod100 === 3 || mod100 === 4) return forms[2];
  return forms[3];
}

export const productCount = (n: number) =>
  `${n} ${plural(n, ["izdelek", "izdelka", "izdelki", "izdelkov"])}`;
