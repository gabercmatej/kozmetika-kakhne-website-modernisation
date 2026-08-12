import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";

/**
 * The shop's own booklet, embedded as the source embeds it.
 *
 * FlipHTML5 hosts the publication; there is no PDF on kozmetikakahne.com to
 * serve directly, so the reader is the artefact and the iframe is the only way
 * to show it. The source gives it a flat `height: 800px`, which on a phone is
 * more than a screenful of scrolling for a reader that then draws its book
 * across the middle and leaves the rest dark. The frame is proportional here
 * instead, and landscape at every width: FlipHTML5 lays the booklet out as a
 * two-page spread and does not fall back to single pages on a narrow screen,
 * so a portrait frame buys nothing but grey — measured at 348×464, the book
 * filled 215px of it. It settles at the source's own 800px from lg up, where
 * there is room for that to be the right number.
 *
 * The link below the frame is not decoration. A third-party embed is the one
 * thing on this site that can fail for reasons none of this code controls —
 * a blocked frame, a tracking-protection rule, a reader that will not size
 * itself on an old browser — and when it does, the booklet has to remain
 * reachable rather than becoming a grey rectangle.
 */
export function Booklet() {
  return (
    <div className="mt-10">
      <div className="relative w-full overflow-hidden border border-border bg-surface">
        <iframe
          src={site.booklet.embedSrc}
          title={site.booklet.title}
          loading="lazy"
          allowFullScreen
          className="block aspect-[4/3] w-full border-0 lg:aspect-auto lg:h-[800px]"
        />
      </div>

      <a
        href={site.booklet.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex min-h-11 items-center gap-2 text-base font-medium text-violet-700 underline decoration-violet-200 underline-offset-4 transition-colors hover:decoration-violet-700"
      >
        Odprite priročnik v novem zavihku
        <ArrowSquareOut size={15} weight="light" aria-hidden="true" />
      </a>
    </div>
  );
}

/**
 * The violet band the source runs above its footer on every page, promoting
 * the booklet. Reproduced in the same shape and the same words — the headline
 * in two weights, an outlined button that fills on hover — in this site's own
 * type and spacing rather than the original's 20px/14px Bootstrap scale.
 *
 * It takes the footer's own `violet-900` rather than `violet-700`, and meets
 * it with no seam, so the two read as one closing block instead of as a
 * coloured strip stacked on a darker one.
 *
 * `text-white` sits on the heading itself, not only on the section. The base
 * layer in globals.css gives every h1–h4 `color: var(--color-ink)`, which is
 * more specific than an inherited colour from an ancestor — so a heading on a
 * dark ground that relies on the section's `text-white` renders near-black.
 * On this band it did exactly that, at roughly 1.2:1.
 */
export function BookletBanner() {
  return (
    /*
     * `-mb-24` cancels the footer's own `mt-24`. That margin is the gap
     * between a page's content and the footer, and this band is not page
     * content — it is the footer's first row. Sharing the ground colour is
     * only half of that; with the gap left in, the same violet appeared twice
     * with a stripe of paper between, which reads as a mistake rather than as
     * one block.
     */
    <section className="-mb-24 bg-violet-900 text-white">
      <div className="page-container flex flex-col items-center gap-5 py-8 text-center sm:flex-row sm:justify-center sm:gap-8 sm:py-7">
        <h2 className="text-balance font-sans text-lead font-bold leading-snug text-white">
          {site.booklet.title}.{" "}
          {/* Weight alone separates the offer from the title, as on the
              source. Both stay pure white — a tinted second half on this
              ground trades one voice for one legibility. */}
          <span className="font-normal">{site.booklet.promo}</span>
        </h2>
        <Link
          href="/prirocnik/nega-koze"
          className="inline-flex h-12 shrink-0 items-center justify-center border-2 border-white px-8 text-small font-semibold uppercase tracking-[0.06em] text-white transition-colors duration-300 hover:bg-white hover:text-violet-900"
        >
          {site.booklet.cta}
        </Link>
      </div>
    </section>
  );
}
