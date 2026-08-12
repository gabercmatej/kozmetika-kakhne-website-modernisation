import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photography is downloaded and optimised at build time into
    // /public/izdelki, so no remote patterns are needed at runtime.
    formats: ["image/avif", "image/webp"],
  },

  /**
   * Legacy URLs from the current site that have no direct equivalent here.
   * Permanent redirects so link equity and bookmarks survive the rebuild.
   */
  async redirects() {
    return [
      // Password reset is handled by the existing account system.
      { source: "/pozabljeno-geslo", destination: "/prijava", permanent: false },
      // Search results are the product listing with a query.
      { source: "/iskanje", destination: "/produkti", permanent: true },
      // Individual apartment listings collapse onto the overview page.
      { source: "/apartma/:slug", destination: "/apartmaji", permanent: true },
      // The source site's generic error route.
      { source: "/napaka", destination: "/", permanent: true },
      // Manuals sit under a single index on the source site.
      { source: "/prirocnik", destination: "/prirocnik/nega-koze", permanent: true },
    ];
  },
};

export default nextConfig;
