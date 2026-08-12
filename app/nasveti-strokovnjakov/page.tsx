import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Prose } from "@/components/ui/misc";
import { PageBanner } from "@/components/ui/page-banner";
import { advice, articleImage } from "@/lib/content";
import { faqSchema, breadcrumbSchema, JsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Nasveti strokovnjakov",
  description:
    "Prava vprašanja strank o negi kože in odgovori, ki temeljijo na dolgoletni praksi Kozmetike Kahne.",
  alternates: { canonical: "/nasveti-strokovnjakov" },
};

/**
 * Answers are rendered open, not inside accordions. They are the reason the
 * page exists and hiding them behind interaction would keep them out of search
 * results as well as out of sight.
 */
export default function AdvicePage() {
  const crumbs = [
    { label: "Domov", href: "/" },
    { label: "Nasveti strokovnjakov", href: "/nasveti-strokovnjakov" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <JsonLd
        data={faqSchema(
          advice.map((a) => ({
            question: a.question,
            answer: a.answerHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
          }))
        )}
      />

      {/* The band carries the same photograph the homepage runs over its own
          advice section — there it sits under a near-opaque violet scrim, here
          it is shown plain — so arriving from that section does not feel like a
          different site. */}
      <PageBanner
        crumbs={crumbs}
        eyebrow="Vprašali ste, odgovorili smo"
        title="Nasveti strokovnjakov"
        intro="Vprašanja, ki nam jih pošiljajo stranke, in odgovori iz prakse. Če vašega vprašanja ni med njimi, nam pišite."
        action={
          <ButtonLink href="/kontakt" variant="primary">
            Zastavite svoje vprašanje
          </ButtonLink>
        }
        visual={articleImage("7-najpogostejsih-napak-pri-negi-obraza")}
        focal="42% 30%"
      />

      <div className="page-container pb-24">
        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="Seznam vprašanj" className="lg:sticky lg:top-28 lg:self-start">
            <p className="mb-3 text-micro font-semibold uppercase tracking-[0.12em] text-faint">
              Na tej strani
            </p>
            <ol className="grid gap-2.5">
              {advice.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="flex gap-2.5 text-base text-muted transition-colors hover:text-violet-700"
                  >
                    <span className="tabular-nums text-faint">{i + 1}.</span>
                    <span className="line-clamp-2">{item.question}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid gap-14">
            {advice.map((item) => (
              <article key={item.id} id={item.id} className="scroll-mt-28">
                <p className="text-small text-muted">{item.readingMinutes} min branja</p>
                <h2 className="mt-2 text-h3">{item.question}</h2>
                <Prose html={item.answerHtml} className="mt-5" />
              </article>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
