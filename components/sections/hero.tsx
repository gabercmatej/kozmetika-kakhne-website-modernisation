import { HeroCarousel, type HeroSlide } from "./hero-carousel";
import { displayName } from "@/lib/format";
import { bannerImage } from "@/lib/content";
import { getProduct } from "@/lib/products";
import type { Product } from "@/lib/types";

/**
 * Builds the hero's campaigns on the server, entirely from published material.
 * Every headline maps to a real product or a real published page, and every
 * body line is drawn from that item's own copy, so the carousel can never
 * drift into invented claims.
 *
 * The photography comes from `content/banners.json` — the campaign images the
 * shop runs on its own homepage rail. A retired banner falls back to the
 * product's own lifestyle shot, then to its packshot, so a slide never renders
 * an empty frame after a re-scrape.
 */
const packshotOf = (p: Product) => p.images.find((i) => i.fit !== "cover") ?? p.images[0];
const lifestyleOf = (p: Product) => p.images.find((i) => i.fit === "cover") ?? null;

export function Hero() {
  const slides: HeroSlide[] = [];

  const push = (
    slug: string,
    slide: Omit<HeroSlide, "visual" | "chip"> & { banner: string }
  ) => {
    const product = getProduct(slug);
    if (!product) return;
    const { banner, ...rest } = slide;
    const visual = bannerImage(banner) ?? lifestyleOf(product) ?? packshotOf(product);
    if (!visual) return;
    slides.push({
      ...rest,
      visual,
      chip: {
        name: displayName(product.name),
        price: product.price,
        href: `/produkt/${product.slug}`,
      },
    });
  };

  push("hialuron-serum", {
    id: "znamka",
    banner: "zakaj-nam-stranke-zaupajo",
    focal: "50% 38%",
    eyebrow: "Kozmetika Kahne",
    titleTop: "Učinkovita nega kože",
    titleAccent: "že od leta 1987.",
    body: "Slovenska proizvodnja, formulacije iz monaškega laboratorija in nega, sestavljena po vaši koži.",
    primary: { label: "Poiščite svojo rutino", href: "/rutina" },
    secondary: { label: "Poglejte izdelke", href: "/produkti" },
  });

  push("poletna-rutina", {
    id: "sonce",
    banner: "priprava-na-sonce",
    focal: "40% 40%",
    eyebrow: "Poletna rutina",
    titleTop: "Priprava",
    titleAccent: "na sonce.",
    body: "Koža, pripravljena na poletje že od znotraj. Celotna rutina štirih izdelkov v enem kompletu.",
    primary: { label: "Poglejte rutino", href: "/produkt/poletna-rutina" },
    secondary: { label: "Vsi izdelki", href: "/produkti" },
  });

  push("poletni-duo", {
    id: "prijatelja",
    banner: "poletna-prijatelja",
    focal: "48% 50%",
    eyebrow: "Poletni duo",
    titleTop: "Poletna",
    titleAccent: "prijatelja.",
    body: "Stabilni vitamin C in Naravno mazilo iz morskih alg. Nega, ki jo koži podarite pred zaščito pred soncem.",
    primary: { label: "Spoznajte duo", href: "/produkt/poletni-duo" },
    secondary: {
      label: "Vsi best sellerji",
      href: "/produkti?category=best-sellerji-in-predlogi-za-specificne-potrebe-koze",
    },
  });

  push("naravno-mazilo-iz-morskih-alg", {
    id: "morje",
    banner: "zakladi-morja",
    focal: "42% 50%",
    eyebrow: "Naravno mazilo iz morskih alg",
    titleTop: "Zakladi",
    titleAccent: "morja.",
    body: "Visoka koncentracija morskih elementov, ki z vezavo vode preprečuje izgubo vlažnosti kože.",
    primary: { label: "Odkrijte mazilo", href: "/produkt/naravno-mazilo-iz-morskih-alg" },
    secondary: { label: "Vsi izdelki", href: "/produkti" },
  });

  push("moski-special-edition-serum-in-krema", {
    id: "moski",
    banner: "moska-nega-special-edition",
    frame: "contain",
    eyebrow: "Moški special edition",
    titleTop: "Nega za",
    titleAccent: "sodobnega moškega.",
    body: "Serum in krema za kožo, ki vsak dan prenaša tempo, stres in zunanje vplive. Enostavna, učinkovita.",
    primary: { label: "Poglejte komplet", href: "/produkt/moski-special-edition-serum-in-krema" },
    secondary: { label: "Vsi izdelki", href: "/produkti" },
  });

  /* The prize draw is a real, dated campaign on the source site, so it gets a
     slide of its own. It links to the page rather than to a product. */
  const dotox = getProduct("dotox");
  const nagradna = bannerImage("nagradna-igra");
  if (dotox && nagradna) {
    slides.push({
      id: "nagradna-igra",
      eyebrow: "Nagradna igra",
      titleTop: "Žrebamo",
      titleAccent: "po dopustih.",
      body: "Prijavite se na e-novice in sodelujte v mesečni nagradni igri Kozmetike Kahne.",
      primary: { label: "Pravila in prijava", href: "/nagradne-igre" },
      secondary: { label: "Kartica zvestobe", href: "/kartica-zvestobe" },
      visual: nagradna,
      frame: "contain",
      chip: {
        name: displayName(dotox.name),
        price: dotox.price,
        href: `/produkt/${dotox.slug}`,
      },
    });
  }

  if (!slides.length) return null;
  return <HeroCarousel slides={slides} />;
}
