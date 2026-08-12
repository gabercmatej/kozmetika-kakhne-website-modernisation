import * as cheerio from "cheerio";

export const slugFromUrl = (href = "") => {
  const m = href.match(/\/produkt\/([^/?#]+)/);
  return m ? decodeURIComponent(m[1]) : null;
};

/** "76,20 €" -> 76.2 */
export const parsePrice = (text = "") => {
  const m = text.replace(/\s/g, "").match(/([\d.]+),(\d{2})/);
  if (m) return Number(`${m[1].replace(/\./g, "")}.${m[2]}`);
  return null;
};

/**
 * The price box has two shapes. A product at full price renders a single
 * `.price`; a reduced one renders `.old_price` struck through beside
 * `.new_price`, and shows the reduction in a separate `.discount` badge over
 * the photograph.
 *
 * Both shapes are read from one scoped container. On a listing card the badge
 * sits inside that container; on a detail page it sits over the gallery, so
 * the caller can point at it separately. The badge's own figure is kept rather
 * than recomputed — the shop's rounding is part of the published offer.
 */
export function parsePriceBox($scope, $badgeScope = $scope) {
  const newPrice = parsePrice($scope.find(".new_price").first().text());
  const oldPrice = parsePrice($scope.find(".old_price").first().text());
  const discount = $badgeScope.find(".discount .text").first().text().match(/(\d+)\s*%/);
  const onSale = newPrice != null && oldPrice != null && oldPrice > newPrice;
  return {
    price: newPrice ?? parsePrice($scope.find(".price").first().text()),
    listPrice: onSale ? oldPrice : null,
    discountPercent: onSale && discount ? Number(discount[1]) : null,
  };
}

export const clean = (s = "") =>
  s
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/**
 * The source markup carries inline style attributes pasted from a word
 * processor. Strip presentation, keep structure.
 */
export function sanitizeHtml($, html) {
  if (!html) return null;
  const $frag = cheerio.load(`<div id="__r">${html}</div>`);
  const $root = $frag("#__r");
  $root.find("*").each((_, el) => {
    const $el = $frag(el);
    for (const attr of Object.keys(el.attribs || {})) {
      if (attr !== "href") $el.removeAttr(attr);
    }
    if (el.tagName === "span" || el.tagName === "font") {
      $el.replaceWith($el.html() || "");
    }
  });
  $root.find("p").each((_, el) => {
    const $el = $frag(el);
    if (!clean($el.text()) && !$el.find("img").length) $el.remove();
  });
  return clean($root.html() || "") || null;
}

/** Turn a block of HTML into { lead, bullets[], paragraphs[] }. */
export function structureBlock($, html) {
  if (!html) return { lead: null, bullets: [], paragraphs: [] };
  const $frag = cheerio.load(`<div id="__r">${html}</div>`);
  const $root = $frag("#__r");

  const bullets = [];
  $root.find("li").each((_, el) => {
    const t = clean($frag(el).text());
    if (t) bullets.push(t);
  });

  const paragraphs = [];
  let lead = null;
  $root.find("p, div").each((_, el) => {
    const $el = $frag(el);
    if ($el.find("li").length) return;
    const t = clean($el.text());
    if (!t) return;
    const isStrong = $el.find("strong, b").length > 0 && clean($el.find("strong, b").first().text()) === t;
    if (!lead && isStrong) lead = t;
    else if (!paragraphs.includes(t)) paragraphs.push(t);
  });

  if (!lead && paragraphs.length) lead = paragraphs.shift();
  return { lead, bullets, paragraphs };
}

/** Product cards from a listing fragment or full listing page. */
export function parseProductCards(html) {
  const $ = cheerio.load(html);
  const out = [];
  $(".product_card").each((_, el) => {
    const $c = $(el);
    const href = $c.find("a.product_bg").attr("href") || "";
    const slug = slugFromUrl(href);
    if (!slug) return;
    const onclick = $c.find("button.add_to_cart").attr("onclick") || "";
    const idMatch = onclick.match(/add_to_cart\('([^']+)'\)/);
    out.push({
      slug,
      name: clean($c.find("h3").first().text()),
      ...parsePriceBox($c),
      badge: clean($c.find(".special").first().text()) || null,
      image: $c.find("img.product_img").attr("src") || null,
      sourceId: idMatch ? idMatch[1] : null,
    });
  });
  return out;
}

/** Product detail page. Selectors verified against the live template. */
export function parseProductPage(html, slug) {
  const $ = cheerio.load(html);

  const meta = (name) =>
    $(`meta[property="${name}"]`).attr("content") ||
    $(`meta[name="${name}"]`).attr("content") ||
    null;

  const gallery = [];
  $("a[href*='/products/'][href*='large-']").each((_, el) => {
    const href = $(el).attr("href");
    if (href && !gallery.includes(href)) gallery.push(href);
  });

  const stockText = clean($(".stock").first().text()).replace(/^Zaloga\s*/i, "");

  const shortHtml = $(".short").first().html();
  const short = structureBlock($, shortHtml);

  const crossSell = [];
  $(".combination_products a.combination_product").each((_, el) => {
    const s = slugFromUrl($(el).attr("href") || "");
    if (s && s !== slug && !crossSell.includes(s)) crossSell.push(s);
  });

  const related = [];
  $("a[href*='/produkt/']").each((_, el) => {
    const s = slugFromUrl($(el).attr("href") || "");
    if (s && s !== slug && !crossSell.includes(s) && !related.includes(s)) related.push(s);
  });

  // Bootstrap accordion: #product > .card, header link is the section title.
  const sections = [];
  $("#product > .card").each((_, el) => {
    const $card = $(el);
    const title = clean($card.find(".btn-header-link").first().text());
    const bodyHtml = $card.find(".card-body").first().html();
    if (!title || !bodyHtml) return;
    sections.push({ title, html: sanitizeHtml($, bodyHtml), text: clean($card.find(".card-body").first().text()) });
  });

  const pick = (re) => sections.find((s) => re.test(s.title)) || null;
  const inciSection = pick(/sestavin/i);
  const inciMatch = (inciSection?.text || "").match(/INCI sestavine:\s*([\s\S]+?)$/i);

  return {
    slug,
    name: clean($("h1").first().text()),
    metaTitle: $("title").text().trim() || null,
    metaDescription: meta("description") || meta("og:description"),
    keywords: meta("keywords"),
    ogImage: meta("og:image"),
    volume: clean($(".volume div").first().text()) || null,
    stock: stockText || null,
    /* Scoped to the one price box in the product body. A page-wide `.price`
       lookup picks up the related-product carousel further down, and a text
       fallback picks up whatever number appears first — both were wrong. */
    ...parsePriceBox($(".price_box").first(), $(".productImage").first()),
    badge: clean($(".special").first().text()) || null,
    gallery,
    crossSell,
    related: related.slice(0, 8),
    short,
    shortHtml: sanitizeHtml($, shortHtml),
    sections,
    description: pick(/opis/i),
    usage: pick(/namig|uporab/i),
    inci: inciMatch ? clean(inciMatch[1]) : null,
  };
}

export { cheerio };
