import type { Metadata } from "next";
import Link from "next/link";
import { IngredientIndex, type IngredientIndexData } from "@/components/catalog/ingredient-index";
import { Booklet } from "@/components/ui/booklet";
import { ButtonLink } from "@/components/ui/button";
import { PageBanner } from "@/components/ui/page-banner";
import { advice, adviceExcerpt, bannerImage } from "@/lib/content";
import { declaredProducts, ingredientIndex } from "@/lib/ingredients";
import { productCount } from "@/lib/format";
import { products } from "@/lib/products";
import { breadcrumbSchema, JsonLd } from "@/lib/seo";
import { fold } from "@/lib/utils";

/**
 * The companion to `/prirocnik/navodila-za-uporabo`, and the second of the two
 * handbook URLs the source menu links to and then serves as an empty
 * `<iframe>`.
 *
 * It used to be four grids of links — routine steps to categories, skin types
 * and concerns to filtered listings, questions to the advice page — and not one
 * sentence a visitor could not already read somewhere else. A page whose whole
 * content is directions to other pages is not a handbook; the filter rail on
 * `/produkti` and the questionnaire on `/rutina` both did that job better, so
 * those grids are gone rather than duplicated a third time.
 *
 * The four routine steps went the same way, later and for the same reason:
 * they were written here and again on `/rutina`, one page apart, and only one
 * of the two is the page a visitor arrives at looking for a routine. The
 * treatment they had here — hairline grid, step number, a link into the
 * category each step draws from — moved with them.
 *
 * What stands in their place is the shop's own booklet, which the source
 * publishes on this very URL as a FlipHTML5 reader and promotes from a band
 * above every footer. This rebuild had dropped it; it is the one piece of
 * long-form material the company wrote for exactly this page.
 *
 * The rest is the one thing the shop publishes and never collects:
 * its ingredient declarations. Seventy-two products print a full INCI list on
 * their own page and nowhere else, which answers "what is in this?" but never
 * "which of these contain it?" — the question somebody avoiding an ingredient
 * actually arrives with, and one that cannot be answered without opening
 * seventy-two pages. `lib/ingredients.ts` inverts that relation.
 *
 * Nothing here says what an ingredient does. That would be a claim, and the
 * shop has not made it. The page says where each one appears and how to read
 * the list it appears in, which is the honest half and the useful half.
 */
export const metadata: Metadata = {
  title: "Priročnik za nego kože",
  description:
    "Brezplačni priročnik Kozmetike Kahne, kako brati seznam sestavin in v katerih izdelkih se posamezna sestavina pojavi.",
  alternates: { canonical: "/prirocnik/nega-koze" },
};

const crumbs = [
  { label: "Domov", href: "/" },
  { label: "Priročnik za nego kože", href: "/prirocnik/nega-koze" },
];

/**
 * How an EU cosmetic label is ordered and named — Uredba (ES) št. 1223/2009.
 * This is the labelling convention every package in the union follows, not a
 * statement about any Kahne product, which is why it can be written here at all.
 */
const LABEL_RULES = [
  {
    term: "Vrstni red pove razmerje",
    detail:
      "Sestavine so naštete od tiste, ki je je največ, do tiste, ki je je najmanj. Pravilo velja do enega odstotka; kar je pod njim, sme biti zapisano v poljubnem vrstnem redu, zato pri repu seznama zaporedje ne pomeni več ničesar.",
  },
  {
    term: "Imena so mednarodna, ne slovenska",
    detail:
      "Zapisana so po sistemu INCI, ki je enak na vsaki embalaži v EU — zato voda nastopa kot Aqua in glicerin kot Glycerin. Ista sestavina se tako brez prevajanja prepozna na izdelku katere koli znamke.",
  },
  {
    term: "Parfum je ena postavka",
    detail:
      "Pod imenom Parfum je zapisana celotna dišavna sestava. Dišavne snovi, ki so na seznamu prijavljenih alergenov, morajo biti nad določenim pragom navedene ločeno, z lastnim imenom.",
  },
];

export default function SkincareHandbookPage() {
  const entries = ingredientIndex();
  const declared = declaredProducts();

  /* Position-referenced, so the island receives two fields per product instead
     of a slice of the catalogue. */
  const order = new Map(products.map((p, i) => [p.slug, i]));
  const data: IngredientIndexData = {
    products: products.map((p) => ({ slug: p.slug, name: p.name })),
    ingredients: entries.map((entry) => ({
      key: entry.key,
      name: entry.name,
      folded: fold(entry.name),
      products: entry.products.map((p) => order.get(p.slug) ?? 0),
    })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />

      <PageBanner
        crumbs={crumbs}
        eyebrow="Priročnik"
        title="Priročnik za nego kože"
        intro="Naš brezplačni priročnik, kako se bere seznam sestavin in v katerih izdelkih se posamezna sestavina pojavi."
        action={
          <>
            <ButtonLink href="/rutina" variant="primary">
              Poiščite svojo rutino
            </ButtonLink>
            <ButtonLink href="/prirocnik/navodila-za-uporabo" variant="secondary">
              Navodila za uporabo
            </ButtonLink>
          </>
        }
        /* The skin itself, annotated — the closest thing in the library to a
           diagram, which is what a handbook opens on. */
        visual={bannerImage("zascitnik-koze-pred-pigmentnimi-madezi")}
        focal="55% 45%"
      />

      <div className="page-container pb-24">
        {/* 1 — the shop's own booklet */}
        <section className="mt-16 scroll-mt-28" id="prirocnik">
          <h2 className="text-h2">Osebni priročnik za nego kože</h2>
          <p className="mt-3 max-w-2xl text-lead text-muted">
            Brezplačni priročnik Kozmetike Kahne, list za listom. Obrnite stran s puščicama ali
            ga odprite v celozaslonskem načinu.
          </p>

          <Booklet />
        </section>

        {/* 2 — how to read the declaration the next section indexes */}
        <section className="mt-20 scroll-mt-28" id="branje-sestavin">
          <h2 className="text-h2">Kako se bere seznam sestavin</h2>
          <p className="mt-3 max-w-2xl text-lead text-muted">
            Seznam na embalaži ni naključen. Tri pravila, po katerih je sestavljen — enaka za
            vsako kozmetiko v Evropski uniji.
          </p>

          <dl className="mt-10 grid gap-px border border-border bg-border lg:grid-cols-3">
            {LABEL_RULES.map((rule) => (
              <div key={rule.term} className="bg-paper p-6">
                <dt className="font-display text-[1.2rem] leading-tight">{rule.term}</dt>
                <dd className="mt-2.5 text-base leading-relaxed text-muted">{rule.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 3 — the catalogue's own declarations, inverted */}
        <section className="mt-20 scroll-mt-28" id="sestavine">
          <h2 className="text-h2">Katera sestavina je v katerem izdelku</h2>
          <p className="mt-3 max-w-2xl text-lead text-muted">
            Vse sestavine, ki jih objavljamo, in izdelki, na katerih seznamu stojijo. Uporabno,
            kadar se eni izogibate ali jo, nasprotno, iščete.
          </p>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Sestavljeno iz seznamov, ki jih objavlja {productCount(declared.length)}. Kompleti
            sestavin ne naštevajo posebej — navajajo jih izdelki v njih, vsak zase.
          </p>

          <div className="mt-10">
            <IngredientIndex data={data} />
          </div>
        </section>

        {/* 4 — the shop's own answers, quoted rather than paraphrased */}
        <section className="mt-20 scroll-mt-28" id="vprasanja">
          <h2 className="text-h2">Vprašali ste, odgovorili smo</h2>
          <p className="mt-3 max-w-2xl text-lead text-muted">
            Vprašanja strank in odgovori naših strokovnjakov, v celoti na strani z nasveti.
          </p>

          <ul className="mt-10 grid gap-x-10 gap-y-8 lg:grid-cols-2">
            {advice.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/nasveti-strokovnjakov#${item.id}`}
                  className="group flex h-full flex-col border-t border-border pt-5"
                >
                  <span className="text-small text-faint">{item.readingMinutes} min branja</span>
                  {/* Customers write in at length — one of these questions runs
                      to fifty words — so the heading is clamped or a single card
                      sets the height of the whole row. */}
                  <span className="mt-1.5 line-clamp-2 font-display text-[1.2rem] leading-snug text-ink transition-colors group-hover:text-violet-700">
                    {item.question}
                  </span>
                  <span className="mt-2 line-clamp-3 text-base leading-relaxed text-muted">
                    {adviceExcerpt(item, 180)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <ButtonLink href="/nasveti-strokovnjakov" variant="secondary" className="mt-10">
            Vsi nasveti strokovnjakov
          </ButtonLink>
        </section>

        {/* 5 — hand off to the per-product manual */}
        <section className="mt-20 border-t border-border pt-10">
          <h2 className="text-h3">Navodila za posamezen izdelek</h2>
          <p className="mt-2 max-w-2xl text-base text-muted">
            Koliko izdelka uporabiti, kako ga nanesti in kako pogosto — za vsak izdelek posebej,
            z njegove strani.
          </p>
          <ButtonLink href="/prirocnik/navodila-za-uporabo" variant="secondary" className="mt-4">
            Odprite navodila za uporabo
          </ButtonLink>
        </section>
      </div>
    </>
  );
}
