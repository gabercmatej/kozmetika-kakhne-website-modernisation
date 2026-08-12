import type { MetadataRoute } from "next";
import { articles, pages } from "@/lib/content";
import { categories, products } from "@/lib/products";
import { isoDate } from "@/lib/format";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url("/"), priority: 1, changeFrequency: "weekly" },
    { url: url("/produkti"), priority: 0.9, changeFrequency: "weekly" },
    { url: url("/rutina"), priority: 0.8, changeFrequency: "monthly" },
    { url: url("/nasveti-strokovnjakov"), priority: 0.8, changeFrequency: "monthly" },
    { url: url("/aktualno"), priority: 0.7, changeFrequency: "weekly" },
    { url: url("/akcijska-ponudba"), priority: 0.7, changeFrequency: "weekly" },
    { url: url("/mnenja"), priority: 0.6, changeFrequency: "monthly" },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: url(`/produkti?category=${c.slug}`),
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: url(`/produkt/${p.slug}`),
    priority: 0.8,
    changeFrequency: "weekly",
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: url(`/novica/${a.slug}`),
    priority: 0.5,
    changeFrequency: "yearly",
    lastModified: isoDate(a.date),
  }));

  const pageRoutes: MetadataRoute.Sitemap = pages.map((p) => ({
    url: url(`/${p.slug}`),
    priority: 0.4,
    changeFrequency: "yearly",
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...articleRoutes, ...pageRoutes];
}
