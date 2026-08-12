import type { Metadata, Viewport } from "next";
import { Newsreader, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Footer } from "@/components/layout/footer";
import { Shell } from "@/components/layout/shell";
import { products } from "@/lib/products";
import { site } from "@/lib/site";
import { organisationSchema } from "@/lib/seo";

/*
 * Newsreader is a reading serif rather than a fashion Didone: this is a family
 * laboratory that has published skincare advice since 1987, not a magazine.
 * Schibsted Grotesk carries navigation, product data and long Slovenian names.
 * Both are loaded with the latin-ext subset for c/s/z with carons.
 */
const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-newsreader",
  axes: ["opsz"],
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-schibsted",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Učinkovita nega kože iz slovenske proizvodnje. Serumi, podlage in kreme, razvite z znanjem in izkušnjami od leta 1987.",
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    url: site.url,
    title: `${site.name} · ${site.tagline}`,
    description:
      "Učinkovita nega kože iz slovenske proizvodnje. Serumi, podlage in kreme, razvite z znanjem in izkušnjami od leta 1987.",
  },
  alternates: { canonical: "/" },
  icons: { icon: "/brand/favicon.png" },
};

export const viewport: Viewport = {
  themeColor: "#46166b",
  width: "device-width",
  initialScale: 1,
};

/** The cart needs prices and names; long-form copy stays on the server. */
const catalogue = products.map((p) => ({
  ...p,
  sections: [],
  intro: [],
  inci: null,
  seo: { title: null, description: null, keywords: null },
}));

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl" className={`${newsreader.variable} ${schibsted.variable}`}>
      <head>
        {/* Scroll reveals start hidden and are resolved by JavaScript. If it
            never runs, the content must still be readable. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-[100dvh] flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema()) }}
        />
        <a
          href="#vsebina"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded focus:bg-violet-700 focus:px-4 focus:py-2.5 focus:text-white"
        >
          Preskoči na vsebino
        </a>
        <AnnouncementBar />
        <Shell catalogue={catalogue}>
          <main id="vsebina" className="flex-1">
            {children}
          </main>
          <Footer />
        </Shell>
      </body>
    </html>
  );
}
