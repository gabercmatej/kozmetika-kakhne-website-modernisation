import { articleImage, bannerImage } from "./content";
import type { ProductImage } from "./types";

/**
 * The "O nas" section, as one ordered list.
 *
 * The source site scatters these pages behind a hover menu and nothing else:
 * once a visitor is on one of them, the only way to the next is back up to the
 * header. They are short, related documents about a single company, so they are
 * treated here as one section with a persistent index — the same shape the
 * advice page already uses for its questions.
 *
 * The holiday flat in Portorož is not one of them. It is a property listing
 * that happens to sit on a skincare company's site, and it was the one entry in
 * this section a shopper could open and find nothing about skin in. `/apartmaji`
 * still resolves through the catch-all — the URL is the shop's and stays live —
 * it is simply no longer carried in the menu or the section index.
 *
 * `blurb` is navigation copy, not page content. It says what a visitor will
 * find, and is deliberately the only prose in this file; everything the pages
 * actually assert still comes from `content/pages.json`.
 */
export type AboutEntry = {
  slug: string;
  label: string;
  blurb: string;
  eyebrow: string;
  /** Resolved lazily so a retired image degrades to a photo-less band. */
  visual: () => ProductImage | null;
  focal?: string;
  /** Set where the photograph is a portrait; see `PageBanner`'s `tall`. */
  tall?: boolean;
  /** `contain` shows a portrait whole rather than cropping it to the rail. */
  frame?: "cover" | "contain";
  /** Legal text reads better on a longer measure than an editorial page. */
  wide?: boolean;
};

export const ABOUT_PAGES: AboutEntry[] = [
  {
    slug: "kozmeticna-hisa-kahne",
    label: "Kozmetična hiša Kahne",
    blurb: "Kako se je iz stanovanjske hiše v Trbovljah leta 1987 razvila blagovna znamka.",
    eyebrow: "O nas",
    visual: () => articleImage("zgodba-o-uspehu"),
    focal: "50% 42%",
  },
  {
    slug: "vodstvo",
    label: "Vodstvo",
    blurb: "Ustanoviteljica Zdenka Kahne in ekipa, ki danes vodi podjetje.",
    eyebrow: "O nas",
    /* The only portrait in the library, so the only band that is contained
       rather than cropped: filled to the rail's width the face was enlarged to
       660px and cut off below the mouth. */
    visual: () => articleImage("osrecujemo-z-ucinki"),
    frame: "contain",
    tall: true,
  },
  {
    slug: "o-izdelkih",
    label: "O izdelkih",
    blurb: "Kako so formulacije sestavljene, kje nastanejo in kaj je na njih preverjeno.",
    eyebrow: "O nas",
    /* The products themselves, lined up and unaccompanied — a page about how
       the formulations are built wants the bottles, not the people. */
    visual: () => articleImage("zimski-favoriti-ki-jih-enostavno-dodate-vasi-negi"),
    focal: "50% 52%",
  },
  /*
   * Values come after the people and the products, not before them. Read in
   * order the section now argues from evidence to claim — who built the house,
   * who runs it, what it makes — and only then what it says it stands for. Put
   * second, as it was, the five values arrive before the visitor has been given
   * any reason to credit them.
   */
  {
    slug: "vizija-in-poslanstvo",
    label: "Vizija in poslanstvo",
    blurb: "Pet vrednot, po katerih hiša dela: zaupanje, kvaliteta, inovativnost, dostopnost, zadovoljstvo.",
    eyebrow: "O nas",
    /* The values page argues why to choose the house, so it carries the
       photograph from the article that makes that argument, rather than the
       seaside snapshot of a travel pack it used to run — packaging says
       nothing about zaupanje or zadovoljstvo. */
    visual: () => articleImage("zakaj-izbrati-kozmetiko-kahne"),
    focal: "38% 38%",
  },
  {
    slug: "partnerji",
    label: "Partnerji",
    blurb: "Trgovine in lekarne, kjer je izdelke mogoče kupiti tudi zunaj spletne trgovine.",
    eyebrow: "O nas",
    /* The whole range staged on one table. The page lists eight retailers on
       equal terms, so its photograph cannot be one of their shop fronts —
       putting Nama's doorway at the top promotes one partner over the seven
       below it. What every partner has in common is the range itself. */
    visual: () => bannerImage("zakaj-nam-stranke-zaupajo"),
    focal: "50% 46%",
  },
  /*
   * The two legal documents are entries in this section, not exits from it.
   * They sit behind the same "O nas" menu, so leaving them to the plain
   * catch-all branch dropped the visitor out of the section index the moment
   * they opened one — the same dead end this file exists to remove.
   *
   * They carry no photograph: a banner over terms and conditions decorates a
   * document nobody opens for pleasure, and `PageBanner` already supports a
   * null visual by running the copy full width on the tinted ground.
   */
  {
    slug: "splosni-pogoji",
    label: "Splošni pogoji poslovanja",
    blurb: "Pogoji nakupa, dostave, plačila in vračila v spletni trgovini.",
    eyebrow: "Pravno",
    visual: () => null,
    wide: true,
  },
  {
    slug: "politika-zasebnosti",
    label: "Politika zasebnosti",
    blurb: "Kateri podatki se zbirajo, čemu služijo in kako jih je mogoče urediti.",
    eyebrow: "Pravno",
    visual: () => null,
    wide: true,
  },
];

export const aboutEntry = (slug: string): AboutEntry | undefined =>
  ABOUT_PAGES.find((p) => p.slug === slug);

/**
 * The one route reached from the "O nas" menu that is not an entry in the
 * section: contact has a form, a map and a route of its own, so it genuinely
 * leaves. It is listed last and marked with an arrow, which is what that arrow
 * is for — everything above it keeps the visitor inside the section.
 */
export const ABOUT_RELATED: { slug: string; label: string; href: string }[] = [
  { slug: "kontakt", label: "Kontakt in dostava", href: "/kontakt" },
];
