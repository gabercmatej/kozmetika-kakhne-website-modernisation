import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { AmbientVideo } from "@/components/ui/ambient-video";
import { PetalMark } from "@/components/ui/mark";
import { Reveal } from "@/components/ui/reveal";
import { getProduct, primaryImage } from "@/lib/products";
import { site } from "@/lib/site";

/**
 * The first of the page's two dark bands. It is built to the same recipe as
 * "Vprašali ste, odgovorili smo": one media layer on `violet-950`, then a
 * single flat `violet-950/88` scrim across the whole band. Because the scrim
 * covers the section rather than the media, the ground reads as one colour and
 * the media has no edge of its own to give away where it stops.
 *
 * The clip is held to the right of the composition, behind the copy, and is
 * contained rather than cropped — the founder's photograph carries the story,
 * the video is only movement behind it.
 */
export function BrandStory() {
  const portrait = primaryImage(getProduct("hialuron-serum")!)
    ? getProduct("hialuron-serum")!.images[4] ?? null
    : null;

  return (
    <section className="relative isolate overflow-hidden bg-violet-950 text-violet-200">
      {/*
       * Three layers, painted in order under the copy.
       *
       * 1. A flat ground across the whole band. Without it the scrim sits on
       *    bare violet everywhere except behind the clip, so the section had
       *    one tone where the video was and a darker one where it was not.
       *    Filling the rest to match means the band reads as a single surface,
       *    the way the photographic band under "Vprašali ste" does.
       *
       *    Its value is solved, not picked. The scrim below composites as
       *    `0.82 x violet-950 + 0.18 x ground`, and the band it has to match —
       *    "Vprašali ste, odgovorili smo" — measures rgb(53,35,69) where its
       *    photograph is flat. Rearranged, that needs a ground of rgb(162,153,165).
       *    It read as white while the scrim was 88%, where the difference was
       *    invisible; at 82% white put this band at rgb(70,53,85), visibly the
       *    lighter of the two. Sampled after the change: rgb(53,35,69), exact.
       * 2. The clip, in a box carrying its own 16:9 ratio so nothing is
       *    cropped and the feather mask lines up with the frame it softens.
       * 3. One flat scrim over both.
       */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#a299a5]" />
      <AmbientVideo
        className="absolute right-0 top-1/2 -z-10 aspect-video w-full -translate-y-1/2 lg:w-[70%]"
        srcMp4="/video/brand-story.mp4"
        srcWebm="/video/brand-story.webm"
        poster="/video/brand-story-poster.jpg"
      />
      {/* 82%, not 88%. The extra six points are what let the turning bottle
          read at all; below about 70% the band goes grey and the body copy
          falls under 4.5:1 against the ground. The clip meets it halfway by
          being graded to the ground's own tone rather than brightened past it
          — see `grade` in ambient-video.tsx. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-violet-950/82" />

      <div className="page-container relative py-20 md:py-28">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
          {portrait ? (
            <Reveal className="order-2 lg:order-1">
              <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden bg-violet-900 lg:max-w-none">
                <Image
                  src={portrait.src}
                  alt={`${site.founder}, ustanoviteljica Kozmetike Kahne`}
                  fill
                  sizes="(min-width: 1024px) 38vw, 88vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-small text-violet-200/75">
                {site.founder}, ustanoviteljica
              </p>
            </Reveal>
          ) : null}

          <div className="order-1 max-w-xl lg:order-2">
            <Reveal>
              <p className="mb-4 flex items-center gap-2 text-small font-medium text-gold-500">
                <PetalMark className="h-3 w-3" />
                Od leta {site.foundedYear}
              </p>
              <h2 className="text-h2 text-white">
                Vse se je začelo v stanovanjski hiši v Trbovljah.
              </h2>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-5 grid gap-4 text-lead">
                <p>
                  {site.founder} je podjetje ustanovila leta {site.foundedYear}, potem ko je
                  leta delala s strankami v kozmetičnih salonih in se izobraževala na
                  mednarodnih simpozijih.
                </p>
                <p>
                  Formulacije še danes razvijamo skupaj s partnerskim laboratorijem v Monaku, s
                  katerim sodelujemo skoraj štirideset let. Ostajamo majhni in specializirani.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href="/kozmeticna-hisa-kahne"
                  className="inline-flex min-h-11 items-center gap-2 border-b border-gold-500 pb-1 text-base font-medium text-gold-500 transition-colors hover:border-white hover:text-white"
                >
                  Naša zgodba
                  <ArrowRight size={15} weight="bold" aria-hidden="true" />
                </Link>
                <Link
                  href="/o-izdelkih"
                  className="min-h-11 text-base leading-[2.75rem] text-violet-200 underline decoration-white/25 underline-offset-4 transition-colors hover:text-white"
                >
                  Kako nastajajo izdelki
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
