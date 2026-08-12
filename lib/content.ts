import articlesData from "@/content/articles.json";
import adviceData from "@/content/advice.json";
import bannersData from "@/content/banners.json";
import pagesData from "@/content/pages.json";
import partnersData from "@/content/partners.json";
import reviewsData from "@/content/reviews.json";
import type {
  AdviceItem,
  Article,
  Banner,
  LeaderProfile,
  Page,
  Partner,
  ProductImage,
  Review,
} from "./types";

/** One source article has no h1; fall back to its meta title. */
const titleFor = (a: Article): string =>
  a.title ??
  a.seo.title?.replace(/\s*[-|]\s*KOZMETIKA KAHNE.*$/i, "").trim() ??
  a.slug.replace(/[-:]+/g, " ");

export const articles: Article[] = (articlesData as Article[])
  .map((a) => ({ ...a, title: titleFor(a) }))
  .sort((a, b) => sortKey(b.date) - sortKey(a.date));

function sortKey(date: string | null): number {
  if (!date) return 0;
  const m = date.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return 0;
  return Number(m[3]) * 10000 + Number(m[2]) * 100 + Number(m[1]);
}

export const getArticle = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

/**
 * An article's own photograph, in the shape the image components expect. The
 * informational pages carry no imagery of their own in the CMS, so they borrow
 * from the article library rather than shipping stock.
 */
export const articleImage = (slug: string): ProductImage | null => {
  const image = getArticle(slug)?.image;
  if (!image) return null;
  return { src: image.src, width: image.width, height: image.height, fit: "cover" };
};

const adviceRaw = adviceData as { items: AdviceItem[]; meta: unknown };

/** Plain-text opening of an answer, for previews. Entities become characters. */
export const adviceExcerpt = (item: AdviceItem, length = 260): string => {
  const text = item.answerHtml
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&(#8211|#8212|ndash|mdash);/g, "-")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  return cut.slice(0, cut.lastIndexOf(" ")) + "…";
};

export const advice: AdviceItem[] = adviceRaw.items;

export const getAdvice = (id: string): AdviceItem | undefined =>
  advice.find((a) => a.id === id);

export const pages = pagesData as Page[];

export const getPage = (slug: string): Page | undefined => pages.find((p) => p.slug === slug);

/**
 * The three people on `/vodstvo`, lifted out of that page's own markup.
 *
 * The source builds each profile as a monogram tile next to an `h3`/`h4` pair
 * and a paragraph — a card, styled entirely by classes the scrape does not
 * keep. Rendered as plain prose the tiles survive as bare initials stranded on
 * their own lines ("ZK", then a heading, then a wall of text), which is how the
 * page read: one uninterrupted column in which three separate people were
 * indistinguishable.
 *
 * Parsing it back into records lets the page rebuild the card the source
 * intended. Nothing is added — the monogram, the name, the role and the
 * biography are all the CMS's own text; only the empty wrappers are dropped.
 *
 * A parse that finds nothing returns an empty array and the page falls back to
 * rendering the raw prose, so a re-scrape that changes this markup degrades to
 * the old behaviour instead of emptying the page.
 */
const PROFILE_RE =
  /<div>\s*([A-ZŽŠČĆĐ]{2,3})\s*<\/div>\s*<div>\s*<h3>([\s\S]*?)<\/h3>\s*<h4>([\s\S]*?)<\/h4>\s*<\/div>\s*<\/div>\s*<div>\s*([\s\S]*?)<\/div>/g;

const plain = (html: string): string =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, " ")
    .trim();

export const leadership = (): LeaderProfile[] => {
  const html = getPage("vodstvo")?.bodyHtml;
  if (!html) return [];
  return [...html.matchAll(PROFILE_RE)].map((m) => ({
    initials: m[1],
    name: plain(m[2]),
    role: plain(m[3]),
    bio: plain(m[4]),
  }));
};

export const banners = bannersData as Banner[];

/**
 * Campaign photography for the hero. Every banner is lifestyle work, so it is
 * always framed with `cover`; a slide whose banner has been retired falls back
 * to catalogue imagery rather than rendering an empty frame.
 */
export const bannerImage = (slug: string): ProductImage | null => {
  const banner = banners.find((b) => b.slug === slug);
  if (!banner) return null;
  return { src: banner.src, width: banner.width, height: banner.height, fit: "cover" };
};

/**
 * Retailers that stock the range, exactly as the source's /partnerji page lists
 * them. The source publishes no link for any of them, so neither does this.
 */
export const partners = partnersData as Partner[];

const reviewsRaw = reviewsData as {
  aggregate: { rating: number; countLabel: string; countApprox: number };
  reviews: Review[];
};

export const reviewAggregate = reviewsRaw.aggregate;

/**
 * Only genuine testimonials are surfaced. The source also renders customer
 * enquiries inside the same five-star component; presenting a question about
 * restocking as a review would be misleading, so those are excluded.
 */
export const reviews: Review[] = reviewsRaw.reviews
  .filter((r) => r.kind === "testimonial")
  .filter((r) => r.author && r.body.length > 40);

/** Short, quotable reviews for the homepage. Longer ones live on /mnenja. */
export const featuredReviews = (limit = 6): Review[] =>
  [...reviews].sort((a, b) => a.body.length - b.body.length).slice(2, 2 + limit);
