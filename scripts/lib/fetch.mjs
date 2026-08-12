const BASE = "https://www.kozmetikakahne.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Polite sequential fetch with retry. The source is a small business site. */
export async function get(path, { retries = 3, delay = 250 } = {}) {
  const url = path.startsWith("http") ? path : BASE + path;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      await sleep(delay);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(500 * (attempt + 1));
    }
  }
}

export async function getBuffer(url, { retries = 3 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(500 * (attempt + 1));
    }
  }
}

/**
 * The listing is filtered through an undocumented endpoint the site's own
 * search.js calls: POST /search with pre-built query-string fragments as
 * form values. Reproduced exactly so the tag map comes from real data.
 */
export async function searchProducts({
  category = "all",
  sorting = "rand",
  types = [],
  status = [],
  years = [],
} = {}) {
  const body = new URLSearchParams();
  body.set("GlobalSearchCategory", `?category=${category}`);
  body.set("GlobalSearchOrder", `sorting=${sorting}`);
  if (types.length) body.set("GlobalSearchSkinType", `&types=${types.join(",")}`);
  if (status.length) body.set("GlobalSearchSkinStatus", `&status=${status.join(",")}`);
  if (years.length) body.set("GlobalSearchYears", `&years=${years.join(",")}`);

  const res = await fetch(BASE + "/search", {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  if (!res.ok) throw new Error(`search HTTP ${res.status}`);
  await sleep(250);
  return await res.text();
}

export { BASE };
