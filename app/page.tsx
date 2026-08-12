import type { Metadata } from "next";
import { BestSellers } from "@/components/sections/best-sellers";
import { BrandStory } from "@/components/sections/brand-story";
import { ExpertAdvice } from "@/components/sections/expert-advice";
import { FeaturedRoutine } from "@/components/sections/featured-routine";
import { Hero } from "@/components/sections/hero";
import { Journal } from "@/components/sections/journal";
import { Reviews } from "@/components/sections/reviews";
import { Services } from "@/components/sections/services";
import { TrustStrip } from "@/components/sections/trust-strip";
import { BookletBanner } from "@/components/ui/booklet";

export const metadata: Metadata = {
  title: "Kozmetika Kahne · Osrečujemo z učinki, že od leta 1987",
  description:
    "Učinkovita nega kože iz slovenske proizvodnje. Serumi, podlage in kreme, razvite z znanjem in izkušnjami od leta 1987.",
  alternates: { canonical: "/" },
};

/*
 * Section order is a deliberate funnel: campaigns, credibility, what sells,
 * how the products work together, what is happening now, who makes them,
 * proof, expertise, services. Dark bands (brand story video, expert photo)
 * are separated by light sections so the page breathes between them.
 *
 * The booklet band closes it, in the position the source gives it: the last
 * thing above the footer. The source repeats it on every page; here it runs
 * on the homepage only, because the offer is the same offer each time and a
 * violet band under all eighty-odd product pages would be repetition rather
 * than emphasis.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <BestSellers />
      <FeaturedRoutine />
      <Journal />
      <BrandStory />
      <Reviews />
      <ExpertAdvice />
      <Services />
      <BookletBanner />
    </>
  );
}
