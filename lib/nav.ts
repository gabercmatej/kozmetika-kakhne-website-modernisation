import { CONCERNS, SKIN_TYPES, concernHref, skinTypeHref } from "./concerns";

export type NavLink = { label: string; href: string; note?: string };

export type NavGroup = { title: string; links: NavLink[] };

export type NavItem = {
  label: string;
  href: string;
  /** Present when the item opens a mega menu. */
  groups?: NavGroup[];
  feature?: { title: string; body: string; href: string; cta: string };
};

/**
 * Category hrefs keep the source site's `?category=` parameter so existing
 * links, bookmarks and search results continue to resolve.
 */
const CAT = (slug: string) => `/produkti?category=${slug}`;

export const NAV: NavItem[] = [
  {
    /* The label itself navigates to /produkti; the mega menu is a hover
       shortcut into it, so no duplicate "Vsi izdelki" entry is needed. */
    label: "Trgovina",
    href: "/produkti",
    groups: [
      {
        title: "Kategorije",
        links: [
          { label: "Best sellerji", href: CAT("best-sellerji-in-predlogi-za-specificne-potrebe-koze") },
          { label: "Čiščenje kože", href: CAT("izdelki-za-ciscenje-koze") },
          { label: "Serumi in podlage", href: CAT("podlage-ali-osrecevalci") },
          { label: "Kreme in olja", href: CAT("kreme-in-olja-za-obraz") },
          { label: "Darilni seti", href: CAT("testna-potovalna-pakiranja-darilni-boni-darilna-embalaza") },
          { label: "Znižano", href: "/akcijska-ponudba" },
        ],
      },
      {
        title: "Težave kože",
        links: CONCERNS.map((c) => ({ label: c.label, href: concernHref(c.value) })),
      },
      {
        title: "Tip kože",
        links: SKIN_TYPES.map((c) => ({ label: c.label, href: skinTypeHref(c.value) })),
      },
    ],
    feature: {
      title: "Ne veste, kje začeti?",
      body: "Štiri kratka vprašanja in predlagamo rutino iz izdelkov, ki jih že imamo v ponudbi.",
      href: "/rutina",
      cta: "Poiščite svojo rutino",
    },
  },
  { label: "Rutine", href: "/rutina" },
  {
    label: "Nasveti",
    href: "/nasveti-strokovnjakov",
    groups: [
      {
        title: "Strokovna pomoč",
        links: [
          { label: "Nasveti strokovnjakov", href: "/nasveti-strokovnjakov" },
          { label: "Priročnik za nego kože", href: "/prirocnik/nega-koze" },
          { label: "Navodila za uporabo", href: "/prirocnik/navodila-za-uporabo" },
        ],
      },
      {
        title: "Skupnost",
        links: [
          { label: "Nagradne igre", href: "/nagradne-igre" },
          { label: "Mnenja strank", href: "/mnenja" },
        ],
      },
    ],
  },
  { label: "Aktualno", href: "/aktualno" },
  {
    label: "O nas",
    href: "/kozmeticna-hisa-kahne",
    groups: [
      {
        title: "Podjetje",
        links: [
          { label: "Kozmetika Kahne", href: "/kozmeticna-hisa-kahne" },
          { label: "Vodstvo", href: "/vodstvo" },
          { label: "Vizija in poslanstvo", href: "/vizija-in-poslanstvo" },
          { label: "Partnerji", href: "/partnerji" },
        ],
      },
      {
        title: "Informacije",
        links: [
          { label: "O izdelkih", href: "/o-izdelkih" },
          { label: "Splošni pogoji poslovanja", href: "/splosni-pogoji" },
          { label: "Politika zasebnosti", href: "/politika-zasebnosti" },
          /* Last, because it is the only one that leaves the section. */
          { label: "Kontakt in dostava", href: "/kontakt" },
        ],
      },
    ],
  },
];

export const FOOTER_GROUPS: NavGroup[] = [
  {
    title: "Nakup",
    links: [
      { label: "Vsi izdelki", href: "/produkti" },
      { label: "Best sellerji", href: CAT("best-sellerji-in-predlogi-za-specificne-potrebe-koze") },
      { label: "Čiščenje kože", href: CAT("izdelki-za-ciscenje-koze") },
      { label: "Serumi in podlage", href: CAT("podlage-ali-osrecevalci") },
      { label: "Kreme in olja", href: CAT("kreme-in-olja-za-obraz") },
      { label: "Darila in mini", href: CAT("testna-potovalna-pakiranja-darilni-boni-darilna-embalaza") },
      { label: "Znižano", href: "/akcijska-ponudba" },
    ],
  },
  {
    title: "Pomoč",
    links: [
      { label: "Poiščite svojo rutino", href: "/rutina" },
      { label: "Nasveti strokovnjakov", href: "/nasveti-strokovnjakov" },
      { label: "Priročnik za nego kože", href: "/prirocnik/nega-koze" },
      { label: "Kartica zvestobe", href: "/kartica-zvestobe" },
      { label: "Kontakt in dostava", href: "/kontakt" },
    ],
  },
  {
    title: "Podjetje",
    links: [
      { label: "O nas", href: "/kozmeticna-hisa-kahne" },
      { label: "Vodstvo", href: "/vodstvo" },
      { label: "O izdelkih", href: "/o-izdelkih" },
      { label: "Vizija in poslanstvo", href: "/vizija-in-poslanstvo" },
      { label: "Partnerji", href: "/partnerji" },
      { label: "Aktualno", href: "/aktualno" },
    ],
  },
  {
    title: "Pravno",
    links: [
      { label: "Splošni pogoji", href: "/splosni-pogoji" },
      { label: "Politika zasebnosti", href: "/politika-zasebnosti" },
      { label: "Nagradne igre", href: "/nagradne-igre" },
    ],
  },
];
