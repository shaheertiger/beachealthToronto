#!/usr/bin/env node
// One-time migration from the existing WordPress site, run while it is still online:
//   npm run import                       (defaults to https://beachealth.com)
//   node scripts/import-wordpress.mjs https://beachealth.com --no-images
//
// Pulls every public post, page and custom post type (e.g. team) through the WordPress REST API,
// keeps each item's exact URL path, the Yoast SEO title/description, publish/modified dates,
// categories and featured image, and downloads images from /wp-content/uploads/ to the same paths.
// Output: content/wordpress/items.json, content/wordpress/categories.json, public/wp-content/uploads/…
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const SRC = (args.find((a) => !a.startsWith("--")) || "https://beachealth.com").replace(/\/+$/, "");
const IMAGES = !args.includes("--no-images");
const OUT = path.join(ROOT, "content/wordpress");
const SKIP_TYPES = new Set(["attachment", "nav_menu_item", "wp_block", "wp_template", "wp_template_part", "wp_navigation", "wp_global_styles", "wp_font_family", "wp_font_face", "elementor_library", "et_pb_layout"]);
const host = new URL(SRC).hostname.replace(/^www\./, "");

async function get(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": "BeachHealth-migration/1.0", Accept: "application/json" } });
      if (r.status === 400 && url.includes("page=")) return { data: [], pages: 0 }; // past last page
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      return { data: await r.json(), pages: +r.headers.get("x-wp-totalpages") || 1 };
    } catch (e) {
      if (i === 3) throw new Error(`GET ${url} failed: ${e.message}`);
      await new Promise((res) => setTimeout(res, 1000 * 2 ** i));
    }
  }
}

async function all(endpoint, extra = "") {
  const out = [];
  for (let page = 1; ; page++) {
    const { data, pages } = await get(`${SRC}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}${extra}`);
    out.push(...data);
    if (page >= pages || !data.length) break;
  }
  return out;
}

const isOwn = (url) => { try { return new URL(url, SRC).hostname.replace(/^www\./, "") === host; } catch { return false; } };
const toPath = (url) => { const p = new URL(url, SRC).pathname; return p.endsWith("/") || /\.[a-z0-9]+$/i.test(p) ? p : p + "/"; };
const decode = (s = "") => s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const text = (h = "") => decode(h.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const images = new Set();

// Normalize page-builder markup into clean, semantic HTML that the new stylesheet can render.
function clean(html = "") {
  let h = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript|form|button|svg)[\s\S]*?<\/\1>/gi, "")
    .replace(/\[\/?(et_pb|vc_|fusion_|av_|elementor|caption|gallery|su_)[^\]]*\]/gi, "")
    .replace(/<\/?(div|span|section|font|center)[^>]*>/gi, (m) => (m.startsWith("</div") || m.startsWith("</section") ? "\n" : ""))
    .replace(/\s(class|id|style|data-[\w-]+|srcset|sizes|decoding|fetchpriority|aria-describedby)="[^"]*"/gi, "")
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "")
    .replace(/<h1(\s|>)/gi, "<h2$1").replace(/<\/h1>/gi, "</h2>"); // the page template owns the only <h1>
  // Same-site links become root-relative so they keep working on the new host.
  h = h.replace(/(href|src)="([^"]+)"/gi, (m, attr, url) => {
    if (!/^https?:\/\//i.test(url) || !isOwn(url)) return m;
    const u = new URL(url);
    if (attr.toLowerCase() === "src" || u.pathname.startsWith("/wp-content/uploads/")) {
      if (u.pathname.startsWith("/wp-content/uploads/")) images.add(u.pathname);
      return `${attr}="${u.pathname}"`;
    }
    return `${attr}="${toPath(url)}${u.hash}"`;
  });
  h = h.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy"');
  return h.replace(/\n{3,}/g, "\n\n").trim();
}

function featured(item) {
  const m = item._embedded?.["wp:featuredmedia"]?.[0];
  if (!m?.source_url || !isOwn(m.source_url)) return null;
  const p = new URL(m.source_url).pathname;
  images.add(p);
  return { src: p, alt: m.alt_text || "", width: m.media_details?.width, height: m.media_details?.height };
}

async function download(p) {
  const dest = path.join(ROOT, "public", p);
  if (fs.existsSync(dest)) return true;
  try {
    const r = await fetch(SRC + encodeURI(decodeURI(p)));
    if (!r.ok) throw new Error(r.status);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
    return true;
  } catch (e) {
    console.warn(`  image failed ${p}: ${e.message}`);
    return false;
  }
}

console.log(`Importing from ${SRC} …`);
const { data: types } = await get(`${SRC}/wp-json/wp/v2/types`);
const items = [];
for (const [slug, t] of Object.entries(types)) {
  if (SKIP_TYPES.has(slug) || !t.rest_base) continue;
  let list;
  try { list = await all(t.rest_base, "&_embed=1&status=publish"); } catch (e) { console.warn(`  skipped ${slug}: ${e.message}`); continue; }
  for (const it of list) {
    if (!it.link || !isOwn(it.link)) continue;
    const y = it.yoast_head_json || {};
    const author = it._embedded?.author?.[0]?.name;
    items.push({
      type: slug === "post" || slug === "page" ? slug : it.type || slug,
      id: it.id,
      path: toPath(it.link),
      title: decode(it.title?.rendered || ""),
      html: clean(it.content?.rendered || ""),
      excerpt: text(it.excerpt?.rendered || ""),
      date: it.date_gmt ? it.date_gmt + "Z" : it.date,
      modified: it.modified_gmt ? it.modified_gmt + "Z" : it.modified,
      ...(author && !/^admin$/i.test(author) && { author }),
      ...(it.categories && { categories: it.categories }),
      image: featured(it),
      seo: { title: y.title ? decode(y.title) : undefined, description: y.description ? decode(y.description) : undefined },
      ...(y.robots?.index === "noindex" && { noindex: true })
    });
  }
  console.log(`  ${slug}: ${list.length}`);
}

let cats = [];
try {
  cats = (await all("categories")).filter((c) => c.link && isOwn(c.link)).map((c) => ({ id: c.id, name: decode(c.name), slug: c.slug, path: toPath(c.link), description: text(c.description), parent: c.parent }));
  console.log(`  categories: ${cats.length}`);
} catch (e) { console.warn(`  categories skipped: ${e.message}`); }

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "items.json"), JSON.stringify(items, null, 2));
fs.writeFileSync(path.join(OUT, "categories.json"), JSON.stringify(cats, null, 2));

if (IMAGES) {
  console.log(`Downloading ${images.size} images to public/wp-content/uploads …`);
  const queue = [...images];
  let ok = 0;
  await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) if (await download(queue.shift())) ok++; }));
  console.log(`  ${ok}/${images.size} images saved`);
}
console.log(`Done: ${items.length} items → content/wordpress/. Now run \`npm run build\` and commit content/ and public/wp-content/.`);
