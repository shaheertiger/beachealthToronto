// Post-build checks: legacy URL coverage, broken internal links, JSON-LD validity, titles, h1s.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { legacy } from "../src/legacy-urls.mjs";
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const errors = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const html = walk(DIST).filter((f) => f.endsWith(".html"));
const base = (() => { const m = fs.readFileSync(path.join(DIST, "index.html"), "utf8").match(/<link rel="canonical" href="([^"]+)"/); return new URL(m[1]).pathname; })();
const exists = (p) => { const rel = p.slice(base.length); const f = path.join(DIST, rel); return fs.existsSync(f) && (fs.statSync(f).isFile() || fs.existsSync(path.join(f, "index.html"))); };

for (const p of Object.values(legacy).flat()) if (!exists(base + p.slice(1))) errors.push(`legacy URL missing: ${p}`);

const titles = new Map();
for (const f of html) {
  const s = fs.readFileSync(f, "utf8");
  const rel = path.relative(DIST, f);
  if (/http-equiv="refresh"/.test(s)) {
    const to = s.match(/url=([^"]+)"/)[1];
    if (!exists(to)) errors.push(`${rel}: redirect target missing ${to}`);
    continue;
  }
  const h1 = (s.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) errors.push(`${rel}: ${h1} <h1> elements`);
  const title = s.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) errors.push(`${rel}: no title`);
  else if (titles.has(title) && !rel.startsWith("404")) errors.push(`${rel}: duplicate title with ${titles.get(title)}`); else titles.set(title, rel);
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { errors.push(`${rel}: bad JSON-LD ${e.message}`); } }
  for (const m of s.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const h = m[1].split("#")[0].split("?")[0];
    if (!h || !h.startsWith("/") || h.startsWith("//")) continue;
    if (!exists(h)) errors.push(`${rel}: broken link ${h}`);
  }
}
const uniq = [...new Set(errors)];
uniq.slice(0, 50).forEach((e) => console.error("✗", e));
console.log(uniq.length ? `${uniq.length} problems` : `OK: ${html.length} HTML files checked, all ${Object.values(legacy).flat().length} legacy URLs resolve, no broken internal links`);
process.exit(uniq.length ? 1 : 0);
