/**
 * Company facts, all taken verbatim from the live site. Nothing here is
 * inferred or embellished. Anything the source does not publish (delivery
 * pricing, free-shipping thresholds, per-product ratings) is deliberately
 * absent rather than guessed.
 */
export const site = {
  name: "Kozmetika Kahne",
  legalName: "KOZMETIKA KAHNE d.o.o.",
  tagline: "Osrečujemo z učinki, že od leta 1987",
  foundedYear: 1987,
  founder: "Zdenka Kahne",
  url: "https://kozmetikakahne.com",
  locale: "sl_SI",

  address: {
    street: "Dom in vrt 21A",
    postalCode: "1420",
    city: "Trbovlje",
    country: "Slovenija",
    /**
     * The embed the source site serves on /kontakt, kept verbatim. The `pb`
     * parameter is an opaque, pre-signed description of a map view; it cannot
     * be composed by hand, so re-typing the address into a different embed form
     * would quietly change which pin is dropped. Copying it is the only way to
     * show the same map.
     */
    mapEmbedSrc:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2763.8248185458892!2d15.050778415173376!3d46.15423439515578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47656b5f7b72d5f7%3A0x9b39487da6d510a!2sDom%20in%20Vrt%2021a%2C%201420%20Trbovlje!5e0!3m2!1sen!2ssi!4v1644222031289!5m2!1sen!2ssi",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Dom+in+vrt+21A%2C+1420+Trbovlje",
  },

  registration: {
    vatId: "SI75247844",
    companyId: "9222545000",
  },

  contact: {
    phone: "03 56 31880",
    phoneHref: "tel:+38635631880",
    email: "narocila@kozmetikakahne.com",
  },

  /** The one genuinely current utility message on the source site. */
  pickup: {
    available: true,
    label: "Brezplačen osebni prevzem v Ljubljani",
    address: "Železna cesta 14, Ljubljana",
    note: "Zupančičeva jama, pri Severnem mestnem parku",
    mapLink: "https://www.google.com/maps/search/?api=1&query=%C5%BDelezna+cesta+14%2C+Ljubljana",
  },

  /**
   * The shop's own booklet, "Osebni priročnik za nego kože".
   *
   * The source site publishes it exactly once, as a FlipHTML5 reader in an
   * `<iframe class="flipbook">` on /prirocnik/nega-koze, and promotes it from
   * a violet band above the footer on every page. It is hosted by FlipHTML5,
   * not by the shop, so there is no PDF on kozmetikakahne.com to serve
   * ourselves — this URL is the publication. Kept verbatim for the same
   * reason as the map embed above: it is an opaque publisher-issued
   * identifier, not something that can be reconstructed from the title.
   */
  booklet: {
    title: "Osebni priročnik za nego kože",
    /** The source's own promotional line, split as it splits it. */
    promo: "Pridobite si brezplačni priročnik",
    cta: "Podrobnosti",
    embedSrc: "https://online.fliphtml5.com/gmiaf/agob/#p=1",
    href: "https://online.fliphtml5.com/gmiaf/agob/",
  },

  /** Site-wide aggregate. There is no per-product rating data on the source. */
  rating: {
    value: 4.8,
    countLabel: "Preko 1200 mnenj",
    countApprox: 1200,
  },

  loyalty: {
    discountPercent: 10,
    note: "Popust velja pri nakupu v spletni trgovini.",
  },

  newsletter: {
    discountPercent: 10,
  },

  social: [
    { label: "Facebook", href: "https://www.facebook.com/KozmetikaKahne" },
    { label: "Instagram", href: "https://www.instagram.com/kozmetika_kahne/" },
  ],

  paymentMethods: ["Visa", "Maestro", "Diners", "American Express"],

  /** Claims the source site makes about its own products. */
  claims: [
    "Slovenska proizvodnja",
    "Dermatološko testirano",
    "Ni testirano na živalih",
    "Minimalna količina konzervansov",
  ],

  /**
   * Accreditations the company presents as its own, supplied as artwork by the
   * shop rather than scraped — the live storefront does not publish these seals
   * anywhere, so there is no source page to trace them to. CIDESCO and the
   * ambassadorship are corroborated by the CMS copy on /vodstvo, which
   * describes the founder as a "mednarodna diplomantka CIDESCO" and an
   * "ambasadorka znanj". The other two rest on the shop's own word.
   *
   * They are drawn as seals rather than shipped as images (see
   * components/ui/accreditations.tsx) so they stay sharp at any size and
   * inherit the brand violet instead of carrying a second one.
   */
  accreditations: [
    {
      id: "ozs",
      arc: "Priznanje za kakovost",
      monogram: "OZS",
      lines: ["Obrtno-podjetniška", "zbornica Slovenije"],
      label: "Priznanje za kakovost, Obrtno-podjetniška zbornica Slovenije",
    },
    {
      id: "cidesco",
      arc: "Mednarodna diploma",
      monogram: "C",
      lines: ["CIDESCO"],
      label: "Mednarodna diploma CIDESCO",
    },
    {
      id: "inovacije",
      arc: "Priznanje za inovacije",
      monogram: "idea",
      lines: ["Slovenski forum", "inovacij"],
      label: "Priznanje za inovacije, Slovenski forum inovacij",
    },
    {
      id: "ambasador",
      arc: "Ambassadors of Knowledge",
      monogram: "AK",
      lines: ["Ambasadorka znanj"],
      label: "Ambassadors of Knowledge",
    },
  ],
} as const;

export type Site = typeof site;
