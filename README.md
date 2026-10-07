# beachealth.com

Mobile-first static site for **Beach Health**, a multidisciplinary clinic at 350 Beech Ave in Toronto's Beaches. It is generated from the Claude Design prototype and has no runtime dependencies: every page is plain HTML that search engines and AI crawlers can read without JavaScript.

```
npm run build      # → dist/ for https://beachealth.com
npm run check      # legacy-URL coverage, broken links, JSON-LD, titles, h1s
npm run preview    # build + serve at http://localhost:8080
npm run import     # one-time WordPress migration (see below)
```

| File | What to edit |
| --- | --- |
| `src/config.mjs` | Address, phone, email, hours, booking link, areas served, social profiles, optional photos |
| `src/content.mjs` | Services, FAQs, first-visit steps, values |
| `src/legacy-urls.mjs` | Every URL from the old Yoast sitemaps, plus the fallback page for each |
| `public/` | Static files copied as-is (logo, CSS, JS, icons, imported `wp-content/uploads`) |

## URL structure (kept from the WordPress site)

All 201 URLs in the old Yoast sitemaps (120 posts, 45 pages, 9 team profiles and 27 categories) still resolve:

- **Redesigned pages keep their existing URLs:** `/`, `/services/`, `/services/osteopathy/`, `/services/chiropody/`, `/services/chiropody/medical-pedicure/`, `/services/chiropody/orthotics/`, `/services/massage-therapy/`, `/services/physio-pilates/`, `/services/running-analysis/`, `/services/shockwave-therapy/`, `/services/chiropractic/`, `/about/`, `/contact/` and `/book-appointment/`. There are two new pages: `/services/dry-needling/` and `/team/`.
- **Imported WordPress content** (posts, team bios, the remaining pages and category archives) is published on exactly the same path, with the original Yoast title and meta description, publish and update dates, author and images. Image URLs are kept too (`/wp-content/uploads/...`).
- **Anything not imported yet** gets a 301 redirect to the closest relevant page (a real HTTP redirect on Vercel, with a meta-refresh fallback page). That means no legacy URL ever returns a 404.
- The sitemap file names are the ones Yoast used (`sitemap_index.xml`, `page-sitemap.xml`, `post-sitemap.xml`, `team-sitemap.xml`, `category-sitemap.xml`), so the sitemaps already submitted to Search Console keep working.

## Search and AI-answer-engine optimization

- JSON-LD `@graph` on every page:
  - `MedicalClinic` with address, hours, specialties, area served, offer catalog and `ReserveAction`
  - `WebSite` and `BreadcrumbList` on every page
  - `MedicalWebPage`, `Service` and `FAQPage` on service pages
  - `BlogPosting` on articles and `ProfilePage`/`Person` on team bios
- Answer-first content. Each service page has a question-led H2 structure, an "at a glance" fact box and 5–6 FAQs written to be quoted verbatim.
- `llms.txt` and `llms-full.txt` (https://llmstxt.org). Every page also has a Markdown twin at `<url>index.md`, linked with `rel="alternate" type="text/markdown"`.
- `robots.txt` explicitly allows the major AI search and assistant crawlers (OpenAI, Anthropic, Perplexity, Google, Apple, Bing and others).
- Canonical URLs, Open Graph and Twitter cards, en-CA locale, a 1200×630 share image, favicons and a web app manifest.
- Fast pages: about 16 KB of CSS, 1 KB of progressive-enhancement JS, no framework and no layout shift from the logo.
- Only `beachealth.com` is indexable: Vercel preview hosts get `X-Robots-Tag: noindex`, and builds made for any other URL are `noindex` too.

## Going live on Vercel

1. **Import the project:** in Vercel choose **Add New → Project** and pick this repo. `vercel.json` already sets everything: no framework, build command `node build.mjs && node scripts/check.mjs`, output folder `dist`, trailing slashes on (matching WordPress), real 301 redirects, and security and caching headers. Every push deploys, and pull requests get preview URLs. Previews (`*.vercel.app`) are sent `X-Robots-Tag: noindex`.
2. **Migrate the WordPress content before switching DNS**, while beachealth.com still runs WordPress:
   ```
   npm run import                # pulls posts, pages, team, categories + images via /wp-json
   npm run build && npm run check
   git add content public/wp-content vercel.json && git commit -m "Import WordPress content" && git push
   ```
   The build regenerates the redirect list in `vercel.json`, so imported URLs serve real pages and only leftovers redirect. Always commit `vercel.json` after building; the GitHub check fails if it is out of date.
3. **Check the clinic facts** in `src/config.mjs`: add the postal code, confirm the hours, add `geo` coordinates and add Google Business Profile, Instagram and Facebook URLs to `sameAs`.
4. **Point the domain:**
   - In Vercel go to **Project → Settings → Domains** and add `beachealth.com` and `www.beachealth.com`.
   - At your DNS provider, set an `A` record for `@` → `76.76.21.21` and a `CNAME` for `www` → `cname.vercel-dns.com`. Use whatever values Vercel's Domains screen shows if they differ.
   - `www` permanently redirects to the apex domain.
5. **After launch:**
   - In Google Search Console and Bing Webmaster Tools, resubmit `https://beachealth.com/sitemap_index.xml` and request indexing of the home and service pages.
   - Spot-check a few old URLs. Each should either load the same article or 301 to a related page.

Redirects work in two layers. `vercel.json` sends real HTTP 301s, and each legacy path also has a static meta-refresh page as a backup, so the `dist/` folder works on any static host.
