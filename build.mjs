// Static site generator for beachealth.com — zero dependencies, Node 18+.
//   node build.mjs                      → dist/ for https://beachealth.com
//   SITE_URL=https://x.github.io/repo node build.mjs  → preview build (noindex) served from a sub-path
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import config from "./src/config.mjs";
import { services, groups, steps, values, disciplines, clinicFaqs, updated } from "./src/content.mjs";
import { legacy, fallbackFor } from "./src/legacy-urls.mjs";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, "dist");
const PROD = config.siteUrl.replace(/\/+$/, "");
const DEPLOY = (process.env.SITE_URL || PROD).replace(/\/+$/, "");
const INDEXABLE = process.env.FORCE_INDEX === "1" || new URL(DEPLOY).origin === new URL(PROD).origin;
const ORIGIN = new URL(DEPLOY).origin;
const BASE = new URL(DEPLOY + "/").pathname; // "/" in production, "/repo/" on a GitHub project page
const u = (p = "/") => BASE + String(p).replace(/^\//, "");
const abs = (p = "/") => ORIGIN + u(p);
const C = config;
const A = C.address;
const warnings = [];

// ---------- helpers ----------
const esc = (s = "") => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const decode = (s = "") => String(s)
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'")
  .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&hellip;/g, "…").replace(/&ndash;/g, "–").replace(/&mdash;/g, "—")
  .replace(/&rsquo;|&lsquo;/g, "'").replace(/&rdquo;|&ldquo;/g, '"').replace(/&amp;/g, "&");
const strip = (h = "") => decode(String(h).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const clip = (s, n = 158) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(" ", n - 1)).replace(/[,.;:\s]+$/, "") + "…");
const hash = (f) => crypto.createHash("sha1").update(fs.readFileSync(f)).digest("hex").slice(0, 8);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
const t12 = (t) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""}${h < 12 ? "am" : "pm"}`; };
const hoursText = C.hours.map(([, d, o, c]) => `${d} ${o ? `${t12(o)}–${t12(c)}` : "closed"}`).join(", ");
const fullAddress = `${A.street}, ${A.locality}, ${A.region}${A.postalCode ? " " + A.postalCode : ""}`;
const bookHost = C.bookingUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

function htmlToMd(html) {
  let s = String(html)
    .replace(/<(script|style|noscript)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n\n${"#".repeat(+n)} ${strip(t)}\n\n`)
    .replace(/<img[^>]*?src="([^"]+)"[^>]*?>/gi, (m, src) => { const alt = (m.match(/alt="([^"]*)"/i) || [])[1] || ""; return `![${decode(alt)}](${src.startsWith("/") ? abs(src) : src})`; })
    .replace(/<a[^>]*?href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, h, t) => `[${strip(t)}](${h.startsWith("/") ? abs(h) : h})`)
    .replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, "**$2**")
    .replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, "_$2_")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|ul|ol|blockquote|figure|table|tr)>/gi, "\n\n")
    .replace(/<[^>]+>/g, "");
  return decode(s).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------- imported WordPress content (see scripts/import-wordpress.mjs) ----------
function readJson(f, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, "content/wordpress", f), "utf8")); } catch { return fallback; }
}
const imported = readJson("items.json", []);
const categories = readJson("categories.json", []);
const posts = imported.filter((i) => i.type === "post").sort((a, b) => (b.date || "").localeCompare(a.date || ""));
const teamItems = imported.filter((i) => i.type === "team" || i.path.startsWith("/team/"));
const byPath = new Map(imported.map((i) => [i.path, i]));
// Root-relative links/images in imported HTML get the deploy base path prefixed.
const rebase = (html) => BASE === "/" ? html : html.replace(/(href|src)="\/(?!\/)/g, `$1="${BASE}`);

// ---------- art (decorative; swap for real photos by setting `image` on a service) ----------
const waves = `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false"><circle cx="290" cy="150" r="62" fill="#fff" opacity=".55"/><path d="M0 300C70 270 130 330 200 300S330 270 400 300V500H0Z" fill="#fff" opacity=".35"/><path d="M0 350C80 320 140 380 210 350S330 320 400 350V500H0Z" fill="#0a8fd1" opacity=".55"/><path d="M0 410C70 385 150 440 220 410S340 385 400 410V500H0Z" fill="#0b2a3c" opacity=".5"/><path d="M0 455C90 435 160 475 240 455S350 440 400 455V500H0Z" fill="#f3eee5"/></svg>`;
const art = (img, alt = "") => img
  ? `<div class="art"><img src="${esc(u(img))}" alt="${esc(alt)}" loading="lazy" style="width:100%;height:100%;object-fit:cover"></div>`
  : `<div class="art">${waves}</div>`;
const gClass = (g) => ({ "Manual therapy": "g-manual", "Foot care": "g-foot", "Movement & recovery": "g-move" })[g];
const initials = (n) => n.split(/\s+/).map((w) => w[0]).join("").slice(0, 2);
const svcByName = (n) => services.find((s) => s.name === n);

// ---------- JSON-LD ----------
const ID = { clinic: abs("/") + "#clinic", site: abs("/") + "#website" };
const clinicNode = {
  "@type": "MedicalClinic",
  "@id": ID.clinic,
  name: C.name,
  legalName: C.legalName,
  description: `${C.name} is a multidisciplinary health clinic at ${fullAddress}, in Toronto's Beaches neighbourhood, offering ${services.map((s) => s.name.toLowerCase()).join(", ")}.`,
  url: abs("/"),
  logo: { "@type": "ImageObject", url: abs("/assets/logo.png"), width: 572, height: 121 },
  image: abs("/assets/og.png"),
  telephone: C.phoneE164,
  email: C.email,
  address: { "@type": "PostalAddress", streetAddress: A.street, addressLocality: A.locality, addressRegion: A.region, ...(A.postalCode && { postalCode: A.postalCode }), addressCountry: A.country },
  ...(C.geo && { geo: { "@type": "GeoCoordinates", latitude: C.geo.lat, longitude: C.geo.lng } }),
  hasMap: C.mapUrl,
  openingHoursSpecification: C.hours.filter((h) => h[2]).map(([day, , opens, closes]) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: `https://schema.org/${day}`, opens, closes })),
  medicalSpecialty: ["https://schema.org/Musculoskeletal", "https://schema.org/Physiotherapy", "https://schema.org/Podiatric"],
  areaServed: [{ "@type": "City", name: "Toronto" }, ...C.areaServed.map((n) => ({ "@type": "Place", name: n.replace(/^the /, "The ") }))],
  knowsAbout: [...services.map((s) => s.name), ...new Set(services.flatMap((s) => s.helps))],
  hasOfferCatalog: { "@type": "OfferCatalog", name: "Treatments", itemListElement: services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", "@id": abs(s.path) + "#service", name: s.name, url: abs(s.path) } })) },
  potentialAction: { "@type": "ReserveAction", target: { "@type": "EntryPoint", urlTemplate: C.bookingUrl, actionPlatform: ["https://schema.org/DesktopWebPlatform", "https://schema.org/MobileWebPlatform"] }, result: { "@type": "Reservation", name: "Appointment" } },
  sameAs: C.sameAs
};
const siteNode = { "@type": "WebSite", "@id": ID.site, url: abs("/"), name: C.name, inLanguage: C.locale, publisher: { "@id": ID.clinic } };
const faqEntities = (faqs) => faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } }));

// ---------- page chrome ----------
const NAV = [["Services", "/services/"], ["Our team", "/team/"], ["About", "/about/"], ...(posts.length ? [["Articles", "/blog/"]] : []), ["Contact", "/contact/"]];
const ICON = {
  home: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  services: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
  team: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M22 21v-1a6 6 0 0 0-4-5.6",
  call: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z",
  book: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"
};
const svg = (d) => `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
const cur = (a, b) => (a === b ? ' aria-current="page"' : "");
const section = (p) => (p.startsWith("/services/") ? "/services/" : p.startsWith("/team/") ? "/team/" : p);

const CSS_V = hash(path.join(ROOT, "public/assets/styles.css"));
const JS_V = hash(path.join(ROOT, "public/assets/app.js"));

function layout(pg) {
  const sec = section(pg.path);
  const robots = INDEXABLE && !pg.noindex ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, follow";
  const crumbs = pg.crumbs ? [["Home", "/"], ...pg.crumbs] : null;
  const graph = [clinicNode, siteNode, {
    "@type": pg.schemaType || "WebPage",
    "@id": abs(pg.path) + "#webpage",
    url: abs(pg.path),
    name: pg.title,
    description: pg.description,
    inLanguage: C.locale,
    isPartOf: { "@id": ID.site },
    ...(pg.path === "/" ? { about: { "@id": ID.clinic } } : {}),
    ...(pg.modified && { dateModified: pg.modified }),
    ...(crumbs && { breadcrumb: { "@id": abs(pg.path) + "#breadcrumb" } }),
    ...(pg.faqs && { mainEntity: faqEntities(pg.faqs) }),
    ...pg.pageExtra
  }];
  if (crumbs) graph.push({ "@type": "BreadcrumbList", "@id": abs(pg.path) + "#breadcrumb", itemListElement: crumbs.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(p) })) });
  if (pg.jsonld) graph.push(...pg.jsonld);
  const ld = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  const ogImage = pg.image ? (pg.image.startsWith("http") ? pg.image : abs(pg.image)) : abs("/assets/og.png");
  const bar = pg.bar || "tabs";

  return `<!doctype html>
<html lang="${C.locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(pg.title)}</title>
<meta name="description" content="${esc(pg.description)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${abs(pg.path)}">
${pg.md ? `<link rel="alternate" type="text/markdown" href="${u(pg.path + "index.md")}" title="Markdown version">\n` : ""}${posts.length ? `<link rel="alternate" type="application/rss+xml" href="${u("/feed.xml")}" title="${esc(C.name)} articles">\n` : ""}<meta property="og:type" content="${pg.ogType || "website"}">
<meta property="og:site_name" content="${esc(C.name)}">
<meta property="og:locale" content="en_CA">
<meta property="og:title" content="${esc(pg.ogTitle || pg.title)}">
<meta property="og:description" content="${esc(pg.description)}">
<meta property="og:url" content="${abs(pg.path)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${C.themeColor}">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="${u("/favicon.svg")}" type="image/svg+xml">
<link rel="icon" href="${u("/favicon-48.png")}" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="${u("/apple-touch-icon.png")}">
<link rel="manifest" href="${u("/site.webmanifest")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&display=swap">
<link rel="stylesheet" href="${u("/assets/styles.css")}?v=${CSS_V}">
<script type="application/ld+json">${ld}</script>
</head>
<body class="${bar === "book" ? "has-bar" : "has-tabs"}">
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="logo" href="${u("/")}" aria-label="${esc(C.name)} home"><img src="${u("/assets/logo.png")}" alt="${esc(C.name)}" width="104" height="22"></a>
    <nav class="desk-nav" aria-label="Main">${NAV.map(([l, p]) => `<a href="${u(p)}"${cur(sec, p)}>${l}</a>`).join("")}</nav>
    <div class="head-actions">
      <a class="btn btn-primary btn-sm" href="${u("/book-appointment/")}">Book</a>
      <button class="menu-btn" type="button" aria-label="Menu" aria-expanded="false" aria-controls="menu"><span></span><span></span></button>
    </div>
  </div>
</header>
<nav id="menu" class="menu" aria-label="Menu">
  ${[["Home", "/"], ...NAV, ["Book an appointment", "/book-appointment/"]].map(([l, p]) => `<a href="${u(p)}"${cur(sec, p)}>${l}</a>`).join("\n  ")}
  <p class="menu-meta">${esc(fullAddress)}<br><a href="tel:${C.phoneE164}" style="font-size:16px;font-family:var(--sans);border:0;padding:0;color:var(--link)">${C.phone}</a></p>
</nav>
<main id="main" class="wrap">
${pg.body}
</main>
${footer()}
${bar === "book"
  ? `<div class="bar"><div><a class="btn btn-soft call" href="tel:${C.phoneE164}">Call</a><a class="btn btn-primary book" href="${esc(pg.bookHref || C.bookingUrl)}">${esc(pg.bookLabel || "Book now")}</a></div></div>`
  : `<nav class="tabs" aria-label="Quick links"><ul>
  <li><a href="${u("/")}"${cur(sec, "/")}>${svg(ICON.home)}<span>Home</span></a></li>
  <li><a href="${u("/services/")}"${cur(sec, "/services/")}>${svg(ICON.services)}<span>Services</span></a></li>
  <li><a href="${u("/team/")}"${cur(sec, "/team/")}>${svg(ICON.team)}<span>Team</span></a></li>
  <li><a href="tel:${C.phoneE164}">${svg(ICON.call)}<span>Call</span></a></li>
  <li><a class="primary" href="${u("/book-appointment/")}">${svg(ICON.book)}<span>Book</span></a></li>
</ul></nav>`}
<script src="${u("/assets/app.js")}?v=${JS_V}" defer></script>
</body>
</html>
`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="stack g12">
      <div class="foot-logo"><img src="${u("/assets/logo.png")}" alt="${esc(C.name)}" width="85" height="18" loading="lazy"></div>
      <p style="font-size:16px;line-height:1.55">Multidisciplinary health clinic in the Beaches, Toronto.</p>
      <address>${esc(A.street)}<br>${esc(A.locality)}, ${esc(A.region)} ${esc(A.postalCode)}<br><a href="tel:${C.phoneE164}">${C.phone}</a><a href="mailto:${C.email}">${C.email}</a></address>
    </div>
    <div class="stack g6">
      <span class="h">Services</span>
      <div class="foot-svc">${services.map((s) => `<a href="${u(s.path)}">${s.name}</a>`).join("")}</div>
    </div>
    <div class="stack g6">
      <span class="h">Clinic</span>
      <a href="${u("/about/")}">About</a><a href="${u("/team/")}">Our team</a>${posts.length ? `<a href="${u("/blog/")}">Articles</a>` : ""}<a href="${u("/book-appointment/")}">Book an appointment</a><a href="${u("/contact/")}">Contact &amp; hours</a>${byPath.has("/privacy-policy/") ? `<a href="${u("/privacy-policy/")}">Privacy policy</a>` : ""}
      <span class="copy">© ${new Date().getFullYear()} ${esc(C.name)}</span>
    </div>
  </div>
</footer>`;
}

// ---------- shared blocks ----------
const crumbsHtml = (items) => `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="${u("/")}">Home</a></li>${items.map(([n, p], i) => i === items.length - 1 ? `<li aria-current="page">${esc(n)}</li>` : `<li><a href="${u(p)}">${esc(n)}</a></li>`).join("")}</ol></nav>`;
const faqHtml = (faqs, heading = "Frequently asked questions") => `<section class="stack g12 faq" aria-labelledby="faq-h"><h2 id="faq-h">${heading}</h2>${faqs.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}</section>`;
const faqMd = (faqs, heading = "Frequently asked questions") => `## ${heading}\n\n` + faqs.map(([q, a]) => `### ${q}\n\n${a}`).join("\n\n");
const hoursTable = () => `<table class="hours"><caption class="sr-only">Opening hours</caption><tbody>${C.hours.map(([day, , o, c]) => `<tr data-day="${day}"><th scope="row">${day}</th><td>${o ? `<time>${t12(o)}</time> – <time>${t12(c)}</time>` : "Closed"}</td></tr>`).join("")}</tbody></table>`;
const hoursMd = () => C.hours.map(([day, , o, c]) => `- ${day}: ${o ? `${t12(o)}–${t12(c)}` : "Closed"}`).join("\n");
const infoCards = () => `<div class="info">
  <div class="card"><span class="eyebrow">Phone</span><a class="v" href="tel:${C.phoneE164}">${C.phone}</a></div>
  <div class="card"><span class="eyebrow">Address</span><a class="v" href="${esc(C.mapUrl)}" rel="noopener">${esc(fullAddress)}</a></div>
  <div class="card"><span class="eyebrow">Email</span><a class="v" href="mailto:${C.email}">${C.email}</a></div>
</div>`;
const bookCta = (title = "Book an appointment", text = "Not sure which treatment is right? Mention your symptoms when booking and we'll match you with the right practitioner.", href = C.bookingUrl, label = "Book online") => `<div class="cta"><span class="t">${esc(title)}</span><p>${esc(text)}</p><div class="btn-row"><a class="btn btn-primary" href="${esc(href)}">${esc(label)}</a><a class="btn btn-dark-soft" href="tel:${C.phoneE164}">Call ${C.phone}</a></div></div>`;
const serviceCard = (s) => `<a class="card" href="${u(s.path)}"><span class="card-top"><span class="eyebrow">${s.group}</span><span class="num">${s.num}</span></span><span class="name">${s.name}</span><span class="sum">${esc(s.short)}</span><span class="more">Read more →</span></a>`;
const postCard = (p) => `<li><a class="card" href="${u(p.path)}"><span class="eyebrow">${esc(fmtDate(p.date))}</span><span class="name">${esc(p.title)}</span><span class="sum">${esc(clip(strip(p.excerpt || p.html), 140))}</span><span class="more">Read article →</span></a></li>`;
const factsMd = () => `## Clinic facts\n\n- Name: ${C.name}\n- Address: ${fullAddress}, Canada (${A.neighbourhood})\n- Phone: ${C.phone}\n- Email: ${C.email}\n- Book online: ${C.bookingUrl}\n- Hours: ${hoursText}\n- Services: ${services.map((s) => s.name).join(", ")}`;

// ---------- pages ----------
const pages = new Map();
function add(pg) {
  if (pages.has(pg.path)) return;
  if (pg.description && pg.description.length > 165) warnings.push(`Long meta description (${pg.description.length}) on ${pg.path}`);
  pages.set(pg.path, pg);
}

// Home
const homeFaqs = clinicFaqs(C);
add({
  path: "/", group: "page", modified: updated,
  title: `${C.name} | Osteopathy, Chiropody & Massage in the Beaches, Toronto`,
  description: `Multidisciplinary clinic at ${A.street} in Toronto's Beaches: osteopathy, chiropractic, chiropody, RMT massage, physio Pilates and more. Book online.`,
  faqs: homeFaqs,
  body: `<section class="hero">
  <div class="stack g18">
    <p class="eyebrow">Multidisciplinary clinic · The Beaches, Toronto</p>
    <h1>Move better. <em>Feel better.</em></h1>
    <p class="lead">${C.name} brings osteopathy, chiropody, chiropractic, massage and physio Pilates together in one clinic on ${A.street}, so your care team can treat the whole problem rather than one part of it.</p>
    <div class="btn-row"><a class="btn btn-primary" href="${u("/book-appointment/")}">Book an appointment</a><a class="btn btn-ghost" href="${u("/services/")}">View services</a></div>
  </div>
  <div class="hero-art">
    ${art(C.heroImage, "Inside the Beach Health clinic")}
    <dl class="stats"><div><dt>treatments</dt><dd>${services.length}</dd></div><div><dt>disciplines</dt><dd>${disciplines.length}</dd></div><div><dt>care team</dt><dd>1</dd></div></dl>
  </div>
</section>
<section class="section stack g20" aria-labelledby="svc-h">
  <div class="sec-head"><h2 id="svc-h">Our services</h2><a class="textlink" href="${u("/services/")}">See all ${services.length} →</a></div>
  <ul class="rail">${services.map((s) => `<li>${serviceCard(s)}</li>`).join("")}</ul>
</section>
<section class="section stack g20" aria-labelledby="visit-h">
  <h2 id="visit-h">Your first visit</h2>
  <ol class="grid">${steps.map(([t, b], i) => `<li class="card stack g10"><span class="step-n">${i + 1}</span><h3>${t}</h3><p class="sum">${b}</p></li>`).join("")}</ol>
</section>
<section class="section"><div class="dark">
  <div class="stack g14">
    <h2>One clinic, one care team</h2>
    <p>A sore knee might start at the foot; a stiff back might need hands-on treatment and an exercise plan. Our practitioners work side by side and refer between disciplines, so you get the right treatment without starting over somewhere else.</p>
    <div class="btn-row"><a class="btn btn-primary" href="${u("/team/")}">Meet the team</a><a class="btn btn-dark-soft" href="${u("/about/")}">About the clinic</a></div>
  </div>
  ${art(C.teamImage, "The Beach Health team")}
</div></section>
<section class="section stack g20" aria-labelledby="where-h">
  <h2 id="where-h">Find us in the Beaches</h2>
  <div class="grid">
    <div class="card stack g10"><span class="eyebrow">Address</span><p class="lead" style="font-size:18px">${esc(fullAddress)}</p><p class="sum">${esc(A.directions)}</p><a class="textlink" href="${esc(C.mapUrl)}" rel="noopener">Get directions →</a></div>
    <div class="card stack g10"><span class="eyebrow">Hours</span>${hoursTable()}</div>
  </div>
</section>
${posts.length ? `<section class="section stack g20" aria-labelledby="art-h"><div class="sec-head"><h2 id="art-h">From our practitioners</h2><a class="textlink" href="${u("/blog/")}">All articles →</a></div><ul class="post-list">${posts.slice(0, 3).map(postCard).join("")}</ul></section>` : ""}
<div class="section">${faqHtml(homeFaqs)}</div>`,
  md: `# ${C.name}: multidisciplinary health clinic in the Beaches, Toronto\n\n${C.name} brings osteopathy, chiropody, chiropractic, massage and physio Pilates together in one clinic at ${fullAddress}, so your care team can treat the whole problem rather than one part of it.\n\n${factsMd()}\n\n## Services\n\n${services.map((s) => `- [${s.name}](${abs(s.path)}): ${s.short}`).join("\n")}\n\n## Your first visit\n\n${steps.map(([t, b], i) => `${i + 1}. **${t}.** ${b}`).join("\n")}\n\n## Opening hours\n\n${hoursMd()}\n\n${faqMd(homeFaqs)}`
});

// Services index
add({
  path: "/services/", group: "page", modified: updated, crumbs: [["Services", "/services/"]], schemaType: "CollectionPage",
  title: `Services: Osteopathy, Chiropody, RMT Massage & More | ${C.name}`,
  description: `${services.length} treatments under one roof in Toronto's Beaches: manual therapy, foot care and movement & recovery. Read what each involves and book online.`,
  pageExtra: { mainEntity: { "@type": "ItemList", itemListElement: services.map((s, i) => ({ "@type": "ListItem", position: i + 1, url: abs(s.path), name: s.name })) } },
  body: `<section class="page-head stack g14"><h1>Services</h1><p>${services.length} treatments across manual therapy, foot care and movement. Choose one to read what it involves and who it helps.</p></section>
<div class="chips" role="group" aria-label="Filter services">${["All", ...groups].map((g) => `<button class="chip" type="button" data-filter="${g}" aria-pressed="${g === "All"}">${g}</button>`).join("")}</div>
<ul class="svc-list">${services.map((s) => `<li data-group="${s.group}"><a class="card" href="${u(s.path)}">${s.image ? `<img class="thumb" src="${u(s.image)}" alt="" loading="lazy">` : `<span class="thumb ${gClass(s.group)}" aria-hidden="true">${initials(s.name)}</span>`}<span class="stack g6" style="min-width:0"><span class="eyebrow" style="letter-spacing:.08em">${s.group}</span><span class="name">${s.name}</span><span class="sum">${esc(s.short)}</span></span></a></li>`).join("")}</ul>`,
  md: `# Services at ${C.name}\n\n${groups.map((g) => `## ${g}\n\n${services.filter((s) => s.group === g).map((s) => `- [${s.name}](${abs(s.path)}): ${s.short}`).join("\n")}`).join("\n\n")}`
});

// Service detail pages
for (const s of services) {
  const related = s.related.map(svcByName);
  const faqs = [
    [`What ${s.plural ? "are" : "is"} ${s.name.toLowerCase()}?`, s.intro],
    [`What can ${s.name.toLowerCase()} help with?`, `${s.name} at ${C.name} commonly helps with ${s.helps.slice(0, -1).join(", ").toLowerCase()} and ${s.helps.at(-1).toLowerCase()}.`],
    [`What happens at a first ${s.name.toLowerCase()} appointment?`, s.expect.join(" ")],
    ...s.faqs,
    [`Where can I get ${s.name.toLowerCase()} in Toronto's Beaches?`, `${C.name} offers ${s.name.toLowerCase()} at ${fullAddress}. Book online at ${bookHost} or call ${C.phone}.`]
  ];
  add({
    path: s.path, group: "page", modified: updated, faqs, bar: "book", bookLabel: `Book ${s.name}`,
    crumbs: [["Services", "/services/"], [s.name, s.path]],
    schemaType: ["MedicalWebPage", "FAQPage"],
    pageExtra: { about: { "@id": abs(s.path) + "#service" }, audience: { "@type": "Patient" }, lastReviewed: updated },
    jsonld: [{ "@type": "Service", "@id": abs(s.path) + "#service", name: s.name, serviceType: s.name, category: s.group, description: s.intro, url: abs(s.path), provider: { "@id": ID.clinic }, areaServed: { "@type": "City", name: "Toronto" }, availableChannel: { "@type": "ServiceChannel", serviceUrl: C.bookingUrl, servicePhone: { "@type": "ContactPoint", telephone: C.phoneE164, contactType: "appointments" }, serviceLocation: { "@id": ID.clinic } } }],
    title: `${s.name} in Toronto's Beaches | ${C.name}`,
    description: clip(`${s.short} ${s.name} at ${C.name}, ${A.street}, Toronto. Book online.`, 160),
    body: `${crumbsHtml([["Services", "/services/"], [s.name, s.path]])}
<article class="detail narrow stack g28">
  <header class="stack g14">
    <p class="eyebrow">${s.group}</p>
    <h1>${s.name}</h1>
    <p class="lead">${esc(s.intro)}</p>
  </header>
  <dl class="glance" aria-label="At a glance">
    <div><dt>What it is</dt><dd>${esc(s.short)}</dd></div>
    <div><dt>Helps with</dt><dd>${esc(s.helps.slice(0, 4).join(", "))}</dd></div>
    <div><dt>Where</dt><dd>${esc(fullAddress)} (${A.neighbourhood})</dd></div>
    <div><dt>Book</dt><dd><a href="${esc(C.bookingUrl)}">Online</a> or <a href="tel:${C.phoneE164}">${C.phone}</a></dd></div>
  </dl>
  ${art(s.image, `${s.name} at ${C.name}`)}
  <section class="stack g14"><h2>What can ${s.name.toLowerCase()} help with?</h2><ul class="pills">${s.helps.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></section>
  <section class="stack g12"><h2>What to expect at your first visit</h2>${s.expect.map((p) => `<p class="body">${esc(p)}</p>`).join("")}</section>
  ${bookCta(`Book ${s.name}`, undefined, C.bookingUrl, "Book online")}
  ${faqHtml(faqs, `${s.name} questions`)}
  <section class="stack g12 related"><h2>Often combined with</h2><div class="grid">${related.map((r) => `<a class="card" href="${u(r.path)}"><span class="name">${r.name}</span><span class="more">Read more →</span></a>`).join("")}</div></section>
  <p class="updated">Last updated <time datetime="${updated}">${fmtDate(updated)}</time></p>
</article>`,
    md: `# ${s.name} in Toronto's Beaches\n\n${s.intro}\n\n- Category: ${s.group}\n- Where: ${fullAddress} (${A.neighbourhood})\n- Book: ${C.bookingUrl} or ${C.phone}\n\n## What can ${s.name.toLowerCase()} help with?\n\n${s.helps.map((h) => `- ${h}`).join("\n")}\n\n## What to expect at your first visit\n\n${s.expect.join("\n\n")}\n\n${faqMd(faqs, `${s.name} questions`)}\n\n## Often combined with\n\n${related.map((r) => `- [${r.name}](${abs(r.path)})`).join("\n")}`
  });
  if (s.faqs.length < 2) warnings.push(`${s.name} has fewer than 2 custom FAQs`);
}

// Team
const teamCards = teamItems.length
  ? teamItems.map((t) => `<li class="card person"><div class="person-top">${t.image ? `<img class="avatar" src="${esc(u(t.image.src))}" alt="${esc(t.title)}" width="76" height="76" loading="lazy">` : `<span class="avatar" aria-hidden="true">${esc(initials(t.title))}</span>`}<div class="stack g6" style="min-width:0"><h2 style="font-size:24px">${esc(t.title)}</h2>${t.role ? `<span class="role">${esc(t.role)}</span>` : ""}</div></div><p class="sum">${esc(clip(strip(t.excerpt || t.html), 160))}</p><a class="btn btn-ghost btn-sm" href="${u(t.path)}">Read profile</a></li>`).join("")
  : disciplines.map(([role, svcs]) => `<li class="card person"><div class="person-top"><span class="avatar" aria-hidden="true">${initials(role)}</span><div class="stack g6" style="min-width:0"><h2 style="font-size:24px">${role}</h2></div></div><div class="tags">${svcs.map((n) => `<a href="${u(svcByName(n).path)}">${n}</a>`).join("")}</div><a class="btn btn-primary btn-sm" href="${esc(C.bookingUrl)}">Book with a ${role.toLowerCase()}</a></li>`).join("");
add({
  path: "/team/", group: "page", modified: updated, crumbs: [["Our team", "/team/"]], schemaType: "CollectionPage",
  title: `Our Team: Osteopaths, Chiropodists, RMTs & More | ${C.name}`,
  description: `Meet the registered practitioners at ${C.name} in Toronto's Beaches: osteopathy, chiropody, chiropractic, physiotherapy and massage therapy in one clinic.`,
  body: `<section class="page-head stack g14"><h1>Our team</h1><p>Registered practitioners across ${disciplines.length} disciplines, working together in one clinic.</p></section>
<ul class="grid section" style="grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))">${teamCards}</ul>`,
  md: `# Our team at ${C.name}\n\nRegistered practitioners across ${disciplines.length} disciplines, working together in one clinic.\n\n` + (teamItems.length
    ? teamItems.map((t) => `## [${t.title}](${abs(t.path)})\n\n${clip(strip(t.excerpt || t.html), 300)}`).join("\n\n")
    : disciplines.map(([r, s]) => `- ${r}: ${s.join(", ")}`).join("\n"))
});

// About
const aboutFaqs = homeFaqs.slice(0, 2).concat(homeFaqs.slice(3, 5));
add({
  path: "/about/", group: "page", modified: updated, crumbs: [["About", "/about/"]], schemaType: ["AboutPage", "FAQPage"], faqs: aboutFaqs,
  title: `About ${C.name} | Multidisciplinary Clinic in the Beaches, Toronto`,
  description: `${C.name} is a multidisciplinary clinic at ${A.street} in Toronto's Beaches, where foot, manual therapy and movement specialists build one plan around you.`,
  body: `<section class="stack g24 narrow" style="padding:36px 0 48px">
  <h1>About ${C.name}</h1>
  <p class="lead">${C.name} is a multidisciplinary clinic in Toronto's Beaches neighbourhood offering osteopathy, chiropractic, chiropody, massage therapy, physio Pilates and more under one roof.</p>
  ${art(C.clinicImage, "Inside the clinic")}
  <p class="body">Pain and stiffness rarely have a single cause. Foot mechanics affect knees and hips, posture affects the neck and back, and recovery depends on how well you move afterwards. Having foot specialists, manual therapists and movement practitioners in the same clinic means they can share notes, refer to each other and build one plan around you.</p>
  <h2>How we work</h2>
  <div class="stack g10">${values.map(([t, b]) => `<div class="card stack g6"><h3>${t}</h3><p class="sum">${b}</p></div>`).join("")}</div>
  ${faqHtml(aboutFaqs)}
  <a class="btn btn-primary" href="${u("/book-appointment/")}">Book an appointment</a>
</section>`,
  md: `# About ${C.name}\n\n${C.name} is a multidisciplinary clinic in Toronto's Beaches neighbourhood offering osteopathy, chiropractic, chiropody, massage therapy, physio Pilates and more under one roof.\n\nPain and stiffness rarely have a single cause. Foot mechanics affect knees and hips, posture affects the neck and back, and recovery depends on how well you move afterwards. Having foot specialists, manual therapists and movement practitioners in the same clinic means they can share notes, refer to each other and build one plan around you.\n\n## How we work\n\n${values.map(([t, b]) => `- **${t}.** ${b}`).join("\n")}\n\n${factsMd()}\n\n${faqMd(aboutFaqs)}`
});

// Book
const bookFaqs = [homeFaqs[2], homeFaqs[3], homeFaqs[4]];
add({
  path: "/book-appointment/", group: "page", modified: updated, crumbs: [["Book an appointment", "/book-appointment/"]], schemaType: ["WebPage", "FAQPage"], faqs: bookFaqs,
  pageExtra: { potentialAction: clinicNode.potentialAction },
  title: `Book an Appointment | ${C.name}, Toronto`,
  description: `Book osteopathy, chiropody, chiropractic, massage therapy, physio Pilates and more at ${C.name}, ${A.street}, Toronto. Book online 24/7 or call ${C.phone}.`,
  body: `<section class="stack g24" style="padding:36px 0 48px;max-width:680px;margin:0 auto">
  <div class="stack g12"><h1>Book an appointment</h1><p class="lead">Book online in a couple of minutes, or call and the front desk will help you choose the right practitioner.</p></div>
  <div class="btn-row"><a class="btn btn-primary" href="${esc(C.bookingUrl)}">Book online</a><a class="btn btn-ghost" href="tel:${C.phoneE164}">Call ${C.phone}</a></div>
  <section class="card stack g12"><h2 style="font-size:28px">Not sure which service you need?</h2><p class="sum">Choose the closest match, or tell us your symptoms when you book and we'll point you to the right practitioner.</p><div class="tags">${services.map((s) => `<a href="${u(s.path)}">${s.name}</a>`).join("")}</div></section>
  ${infoCards()}
  <section class="card stack g10"><h2 style="font-size:28px">Opening hours</h2>${hoursTable()}<p class="note">Holiday hours can differ. Call ahead if you're unsure.</p></section>
  ${faqHtml(bookFaqs)}
</section>`,
  md: `# Book an appointment at ${C.name}\n\nBook online at ${C.bookingUrl} or call ${C.phone}. If you're unsure which service you need, tell us your symptoms when you book.\n\n${factsMd()}\n\n## Opening hours\n\n${hoursMd()}\n\n${faqMd(bookFaqs)}`
});

// Contact
const contactFaqs = [homeFaqs[0], homeFaqs[5], homeFaqs[2]];
add({
  path: "/contact/", group: "page", modified: updated, crumbs: [["Contact", "/contact/"]], schemaType: ["ContactPage", "FAQPage"], faqs: contactFaqs,
  title: `Contact, Hours & Location | ${C.name}, ${A.street} Toronto`,
  description: `${C.name} is at ${fullAddress} in the Beaches. Call ${C.phone}, email ${C.email} or book online. See opening hours and directions.`,
  body: `<section class="stack g24" style="padding:36px 0 48px;max-width:680px;margin:0 auto">
  <div class="stack g12"><h1>Contact &amp; location</h1><p class="lead">${esc(fullAddress)}. ${esc(A.directions)}</p></div>
  ${infoCards()}
  <div class="btn-row"><a class="btn btn-primary" href="${esc(C.bookingUrl)}">Book online</a><a class="btn btn-ghost" href="${esc(C.mapUrl)}" rel="noopener">Get directions</a></div>
  <section class="card stack g10"><h2 style="font-size:28px">Opening hours</h2>${hoursTable()}<p class="note">Holiday hours can differ. Call ahead if you're unsure.</p></section>
  ${faqHtml(contactFaqs)}
</section>`,
  md: `# Contact ${C.name}\n\n${factsMd()}\n\n- Directions: ${A.directions}\n- Map: ${C.mapUrl}\n\n## Opening hours\n\n${hoursMd()}\n\n${faqMd(contactFaqs)}`
});

// Blog index + category archives (only when WordPress posts have been imported)
if (posts.length) {
  add({
    path: "/blog/", group: "page", crumbs: [["Articles", "/blog/"]], schemaType: "CollectionPage", modified: posts[0].modified,
    title: `Health Articles from Our Practitioners | ${C.name}`,
    description: `Advice on back pain, foot problems, running injuries, posture and recovery from the osteopaths, chiropodists and therapists at ${C.name}, Toronto.`,
    body: `<section class="page-head stack g14"><h1>Articles</h1><p>Practical advice from the practitioners at ${C.name}.</p></section><ul class="post-list section">${posts.map(postCard).join("")}</ul>`,
    md: `# Articles from ${C.name}\n\n${posts.map((p) => `- [${p.title}](${abs(p.path)}): ${clip(strip(p.excerpt || p.html), 160)}`).join("\n")}`
  });
  const childIds = (id) => [id, ...categories.filter((c) => c.parent === id).flatMap((c) => childIds(c.id))];
  for (const cat of categories) {
    const ids = childIds(cat.id);
    const list = posts.filter((p) => (p.categories || []).some((c) => ids.includes(c)));
    if (!list.length) continue;
    add({
      path: cat.path, group: "category", crumbs: [["Articles", "/blog/"], [cat.name, cat.path]], schemaType: "CollectionPage", modified: list[0].modified,
      title: `${cat.name} Articles | ${C.name}`,
      description: clip(strip(cat.description) || `Articles about ${cat.name.toLowerCase()} from the practitioners at ${C.name} in Toronto's Beaches.`, 160),
      body: `${crumbsHtml([["Articles", "/blog/"], [cat.name, cat.path]])}<section class="page-head stack g14"><h1>${esc(cat.name)}</h1>${cat.description ? `<p>${esc(strip(cat.description))}</p>` : ""}</section><ul class="post-list section">${list.map(postCard).join("")}</ul>`,
      md: `# ${cat.name}\n\n${list.map((p) => `- [${p.title}](${abs(p.path)})`).join("\n")}`
    });
  }
}

// Imported WordPress posts, pages and team profiles keep their exact URLs
const segTitle = (p) => pages.get(p)?.crumbTitle || byPath.get(p)?.title || p.split("/").filter(Boolean).pop().replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
for (const it of imported) {
  if (pages.has(it.path)) continue; // the redesigned page wins
  if (["/login-customizer/", "/admin-page-changed/"].includes(it.path)) continue;
  const isPost = it.type === "post";
  const isTeam = teamItems.includes(it);
  let crumbs;
  if (isPost) crumbs = [["Articles", posts.length ? "/blog/" : "/"], [it.title, it.path]];
  else if (isTeam) crumbs = [["Our team", "/team/"], [it.title, it.path]];
  else {
    const segs = it.path.split("/").filter(Boolean);
    crumbs = segs.map((_, i) => "/" + segs.slice(0, i + 1).join("/") + "/").filter((p) => p === it.path || pages.has(p) || byPath.has(p)).map((p) => [p === it.path ? it.title : segTitle(p), p]);
  }
  const target = fallbackFor(it.path);
  const relSvc = services.find((s) => s.path === target);
  const cats = (it.categories || []).map((id) => categories.find((c) => c.id === id)).filter(Boolean);
  const desc = it.seo?.description || clip(strip(it.excerpt || it.html), 158);
  const img = it.image?.src;
  add({
    path: it.path, group: isTeam ? "team" : isPost ? "post" : it.type === "page" ? "page" : it.type,
    modified: (it.modified || it.date || "").slice(0, 10) || undefined,
    title: it.seo?.title || `${it.title} | ${C.name}`, ogTitle: it.title, description: desc, image: img, ogType: isPost ? "article" : "website",
    crumbs, crumbTitle: it.title,
    noindex: it.noindex,
    schemaType: isTeam ? "ProfilePage" : "WebPage",
    pageExtra: isTeam ? { mainEntity: { "@type": "Person", "@id": abs(it.path) + "#person", name: it.title, ...(it.role && { jobTitle: it.role }), worksFor: { "@id": ID.clinic }, ...(img && { image: abs(img) }), url: abs(it.path) } } : {},
    jsonld: isPost ? [{
      "@type": "BlogPosting", "@id": abs(it.path) + "#article", headline: it.title, description: desc, url: abs(it.path),
      mainEntityOfPage: { "@id": abs(it.path) + "#webpage" }, inLanguage: C.locale,
      datePublished: it.date, dateModified: it.modified || it.date,
      author: it.author ? { "@type": "Person", name: it.author } : { "@id": ID.clinic },
      publisher: { "@id": ID.clinic }, ...(img && { image: abs(img) }),
      ...(cats.length && { articleSection: cats.map((c) => c.name) }),
      ...(relSvc && { about: { "@id": abs(relSvc.path) + "#service" } })
    }] : [],
    bar: relSvc ? "book" : "tabs", bookLabel: relSvc ? `Book ${relSvc.name}` : undefined,
    body: `${crumbsHtml(crumbs)}
<article class="detail narrow stack g24">
  <header class="stack g14">
    ${isPost && cats.length ? `<p class="eyebrow">${cats.map((c) => `<a href="${u(c.path)}">${esc(c.name)}</a>`).join(" · ")}</p>` : ""}
    <h1>${esc(it.title)}</h1>
    ${isPost ? `<p class="meta">${it.author ? `<span>By ${esc(it.author)}</span>` : ""}<span>Published <time datetime="${esc(it.date)}">${fmtDate(it.date)}</time></span>${it.modified && it.modified.slice(0, 10) !== it.date.slice(0, 10) ? `<span>Updated <time datetime="${esc(it.modified)}">${fmtDate(it.modified)}</time></span>` : ""}</p>` : ""}
  </header>
  ${img && !it.html.includes(img) ? `<img class="feature" src="${esc(u(img))}" alt="${esc(it.image.alt || "")}" ${it.image.width ? `width="${it.image.width}" height="${it.image.height}"` : ""}>` : ""}
  <div class="prose">${rebase(it.html)}</div>
  ${relSvc ? bookCta(`Book ${relSvc.name}`, `${relSvc.short} Available at ${C.name}, ${A.street}.`, C.bookingUrl, "Book online") + `<a class="textlink" href="${u(relSvc.path)}">Learn about ${relSvc.name.toLowerCase()} →</a>` : bookCta()}
</article>`,
    md: `# ${it.title}\n\n${isPost ? `Published ${it.date.slice(0, 10)}${it.author ? ` by ${it.author}` : ""} · ${C.name}, Toronto\n\n` : ""}${htmlToMd(it.html)}`
  });
}

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "public"), OUT, { recursive: true });
const write = (rel, data) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
const fileFor = (p) => (p === "/" ? "" : p.replace(/^\//, ""));

for (const pg of pages.values()) {
  write(fileFor(pg.path) + "index.html", layout(pg));
  write(fileFor(pg.path) + "index.md", pg.md + `\n\n---\nSource: ${abs(pg.path)}\n`);
}

// Legacy URLs with no page yet → instant redirect to the closest live page (treated as a permanent redirect)
const redirects = [];
const resolve = (p) => { let t = fallbackFor(p), n = 0; while (!pages.has(t) && n++ < 5) t = fallbackFor(t); return pages.has(t) ? t : "/"; };
const redirectHtml = (to) => `<!doctype html><html lang="${C.locale}"><head><meta charset="utf-8"><title>Moved – ${esc(C.name)}</title><meta name="robots" content="noindex"><link rel="canonical" href="${abs(to)}"><meta http-equiv="refresh" content="0; url=${u(to)}"><script>location.replace(${JSON.stringify(u(to))}+location.hash)</script></head><body><p>This page has moved to <a href="${u(to)}">${abs(to)}</a>.</p></body></html>\n`;
for (const [kind, list] of Object.entries(legacy)) for (const p of list) {
  if (pages.has(p)) continue;
  const to = resolve(p);
  redirects.push([kind, p, to]);
  write(fileFor(p) + "index.html", redirectHtml(to));
}

// 404
write("404.html", layout({
  path: "/404/", title: `Page not found | ${C.name}`, description: "The page you're looking for isn't here.", noindex: true,
  body: `<section class="stack g18" style="padding:56px 0 64px;max-width:640px"><p class="eyebrow">404</p><h1>We couldn't find that page</h1><p class="lead">It may have moved when we redesigned the site. Try one of these instead:</p><div class="tags">${[["Home", "/"], ["Services", "/services/"], ["Book an appointment", "/book-appointment/"], ["Contact", "/contact/"], ...(posts.length ? [["Articles", "/blog/"]] : [])].map(([l, p]) => `<a href="${u(p)}">${l}</a>`).join("")}</div></section>`
}));

// Sitemaps — same file names Yoast used, so URLs already submitted to Search Console keep working
const xmlEsc = (s) => esc(s).replace(/'/g, "&apos;");
const groupsMap = {};
for (const pg of pages.values()) if (!pg.noindex) (groupsMap[pg.group] ||= []).push(pg);
const smFiles = [];
for (const [g, list] of Object.entries(groupsMap)) {
  const name = `${g}-sitemap.xml`;
  const lastmod = list.map((p) => p.modified || "").sort().at(-1);
  smFiles.push([name, lastmod]);
  write(name, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${list.map((p) => `<url><loc>${xmlEsc(abs(p.path))}</loc>${p.modified ? `<lastmod>${p.modified.slice(0, 10)}</lastmod>` : ""}</url>`).join("\n")}\n</urlset>\n`);
}
const smIndex = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${smFiles.map(([f, m]) => `<sitemap><loc>${abs("/" + f)}</loc>${m ? `<lastmod>${m.slice(0, 10)}</lastmod>` : ""}</sitemap>`).join("\n")}\n</sitemapindex>\n`;
write("sitemap_index.xml", smIndex);
write("sitemap.xml", smIndex);

// RSS feed for articles (also keeps old /feed/ subscribers working)
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>${esc(C.name)}</title><link>${abs("/")}</link><atom:link href="${abs("/feed.xml")}" rel="self" type="application/rss+xml"/><description>${esc(C.tagline)}</description><language>en-ca</language>\n${posts.slice(0, 30).map((p) => `<item><title>${esc(p.title)}</title><link>${abs(p.path)}</link><guid>${abs(p.path)}</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${esc(clip(strip(p.excerpt || p.html), 300))}</description></item>`).join("\n")}\n</channel></rss>\n`;
write("feed.xml", rss);
write("feed/index.html", redirectHtml("/feed.xml"));

// robots.txt — search and AI answer engines are explicitly welcome
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot", "Applebot-Extended", "Bingbot", "DuckAssistBot", "Meta-ExternalAgent", "MistralAI-User", "CCBot", "Amazonbot"];
write("robots.txt", INDEXABLE
  ? `# ${C.name} — ${abs("/")}\n# Search engines and AI assistants are welcome to crawl, index and cite this site.\n\nUser-agent: *\nAllow: /\n\n${aiBots.map((b) => `User-agent: ${b}`).join("\n")}\nAllow: /\n\nSitemap: ${abs("/sitemap_index.xml")}\n`
  : `# Preview build — not the live site (${PROD}).\nUser-agent: *\nDisallow: /\n`);

// llms.txt (https://llmstxt.org) + llms-full.txt
const llms = `# ${C.name}

> ${C.name} is a multidisciplinary health clinic at ${fullAddress}, Canada, in Toronto's Beaches neighbourhood. It offers ${services.map((s) => s.name.toLowerCase()).join(", ")}. Book online at ${C.bookingUrl} or call ${C.phone}.

Every page on this site has a Markdown version at the same URL plus \`index.md\` (for example ${abs("/services/osteopathy/index.md")}).

${factsMd().replace("## Clinic facts", "## Key facts")}
- Neighbourhoods served: ${C.areaServed.join(", ")}
- Hours can change on holidays; the clinic recommends calling ahead.

## Services

${services.map((s) => `- [${s.name}](${abs(s.path)}): ${s.short}`).join("\n")}

## Clinic

- [About ${C.name}](${abs("/about/")}): how the multidisciplinary care team works together
- [Our team](${abs("/team/")}): practitioners and their disciplines
- [Book an appointment](${abs("/book-appointment/")}): online booking, phone and hours
- [Contact & location](${abs("/contact/")}): address, directions and opening hours
${posts.length ? `\n## Articles\n\n${posts.map((p) => `- [${p.title}](${abs(p.path)})`).join("\n")}\n` : ""}
## Optional

- [Full site content as Markdown](${abs("/llms-full.txt")})
- [Sitemap](${abs("/sitemap_index.xml")})
`;
write("llms.txt", llms);
const order = [...pages.values()].sort((a, b) => (a.group === "post") - (b.group === "post"));
write("llms-full.txt", `# ${C.name} — full site content\n\n${factsMd()}\n\n` + order.map((p) => `${p.md}\n\nURL: ${abs(p.path)}`).join("\n\n---\n\n") + "\n");

// Manifest, IndexNow-friendly host files
write("site.webmanifest", JSON.stringify({ name: C.name, short_name: C.name, start_url: u("/"), scope: u("/"), display: "standalone", background_color: "#f3eee5", theme_color: C.themeColor, icons: [{ src: u("/apple-touch-icon.png"), sizes: "180x180", type: "image/png" }, { src: u("/icon-512.png"), sizes: "512x512", type: "image/png" }] }, null, 2));
write(".nojekyll", "");

// vercel.json — real 301s for legacy URLs that have no page yet, www → apex, caching and security headers.
// Regenerated on every build so it always matches the imported content; commit it after `npm run build`.
// Vercel previews (*.vercel.app) get `X-Robots-Tag: noindex` so only beachealth.com is indexed.
const apex = new URL(PROD).hostname;
const vercel = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  framework: null,
  buildCommand: "node build.mjs && node scripts/check.mjs",
  outputDirectory: "dist",
  trailingSlash: true,
  redirects: [
    { source: "/:path*", has: [{ type: "host", value: "www." + apex }], destination: `https://${apex}/:path*`, permanent: true },
    { source: "/feed", destination: "/feed.xml", permanent: true },
    { source: "/feed/", destination: "/feed.xml", permanent: true },
    { source: "/wp-sitemap.xml", destination: "/sitemap_index.xml", permanent: true },
    { source: "/wp-admin/:path*", destination: "/", permanent: false },
    { source: "/wp-login.php", destination: "/", permanent: false },
    ...redirects.flatMap(([, from, to]) => [
      { source: from, destination: to, permanent: true },
      { source: from.replace(/\/$/, ""), destination: to, permanent: true }
    ]).filter((r) => r.source)
  ],
  headers: [
    { source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }
    ] },
    { source: "/(.*)", missing: [{ type: "host", value: apex }], headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    { source: "/assets/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    { source: "/wp-content/uploads/(.*)", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }
  ]
};
if (!process.env.VERCEL) fs.writeFileSync(path.join(ROOT, "vercel.json"), JSON.stringify(vercel, null, 2) + "\n");

// ---------- report ----------
const count = (g) => [...pages.values()].filter((p) => p.group === g).length;
console.log(`Built ${pages.size} pages for ${DEPLOY} (${INDEXABLE ? "indexable production build" : "PREVIEW build: noindex"})`);
console.log(`  native/page: ${count("page")}, posts: ${count("post")}, team: ${count("team")}, categories: ${count("category")}`);
const legacyTotal = Object.values(legacy).flat().length;
console.log(`  legacy URLs: ${legacyTotal} → ${legacyTotal - redirects.length} served as pages, ${redirects.length} redirecting until WordPress content is imported`);
if (redirects.length && !imported.length) console.log("  Run `npm run import` while the old WordPress site is still online to bring the articles, team bios and categories across.");
for (const w of warnings) console.warn("  warn:", w);
