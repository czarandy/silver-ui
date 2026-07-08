# Marketing Site SEO Audit - 2026-07-08

Audit target: https://www.silver-ui.com/

## Executive Summary

The marketing site has a strong baseline: the homepage is prerendered with real body content, it has a single descriptive title and meta description, Open Graph and Twitter card metadata, JSON-LD, a crawlable robots.txt, and a sitemap. The main SEO risk is canonical consistency. The live host redirects `https://silver-ui.com/` to `https://www.silver-ui.com/`, but the page metadata, sitemap, robots.txt, and JSON-LD all declare the apex domain as canonical. That should be fixed first.

The next largest growth opportunity is content depth. The homepage is the only URL in the sitemap, and the primary component documentation destination is Storybook, which serves mostly app shell HTML with a generic `Storybook` title. That is fine for interactive demos, but it is weak for organic search queries like "React button component", "themeable React components", or "Panda CSS component library".

## What Is Working

- The homepage returns `200` at `https://www.silver-ui.com/`.
- The apex domain redirects to the `www` domain with HTTP `308`.
- The document includes a useful `<title>` and meta description.
- The homepage is prerendered; crawlers receive actual hero copy, feature cards, links, and component showcase markup instead of an empty React root.
- The page has one primary `h1` and descriptive feature headings.
- Open Graph and Twitter card metadata are present, including a 1200 x 630 PNG image.
- `robots.txt` allows crawling and points to a sitemap.
- `sitemap.xml` is valid and lists the homepage.
- JSON-LD is present using `SoftwareApplication`.
- Existing tests cover SEO-critical prerender output and static SEO assets.

## Priority Recommendations

### P0: Align All Canonical URLs

Observed:

- `https://silver-ui.com/` redirects to `https://www.silver-ui.com/`.
- The homepage declares `<link rel="canonical" href="https://silver-ui.com/" />`.
- `og:url`, `og:image`, `twitter:image`, JSON-LD `url`, `robots.txt`, and `sitemap.xml` also use the apex domain.

Recommendation:

Choose one canonical host and use it everywhere. Since the live deployment redirects apex to `www`, the lowest-friction fix is to make `https://www.silver-ui.com/` canonical in:

- `site/index.html`
- `site/public/robots.txt`
- `site/public/sitemap.xml`
- `site/src/seo-assets.test.ts`
- Any future generated SEO constants

Implementation note:

Add a shared `SITE_URL = 'https://www.silver-ui.com'` constant or a small generation step so canonical, Open Graph, Twitter, JSON-LD, robots, sitemap, and tests cannot drift independently.

### P1: Add Crawlable Documentation Pages

Observed:

- The sitemap only includes the homepage.
- The main "Components" CTA goes to `https://storybook.silver-ui.com/`.
- Storybook pages are useful for demos but return generic app shell HTML such as `<title>Storybook</title>` and do not provide static, keyword-targeted component documentation in the initial HTML.
- `https://storybook.silver-ui.com/robots.txt` returns a 404.

Recommendation:

Create crawlable documentation pages on the main marketing domain, or a docs subdomain with explicit SEO metadata. At minimum, add static pages for:

- `/docs/getting-started`
- `/docs/theming`
- `/docs/dark-mode`
- `/components/button`
- `/components/text-input`
- `/components/select`
- `/components/date-input`
- `/components/search-filter-input`

Each page should have a unique title, meta description, canonical URL, `h1`, install/import snippets, usage examples, accessibility notes, and links to the corresponding Storybook demo.

### P1: Expand the Homepage for Search Intent

Observed:

The homepage communicates the product clearly but is short on implementation-oriented copy. Search visitors evaluating a component library usually need proof of installation, styling, theming, accessibility, and framework compatibility.

Recommendation:

Add crawlable sections for:

- Quick start: install, import `silver-ui/styles.css`, render the first component.
- Theming: short CSS variable or `Theme` example.
- Accessibility: keyboard navigation, focus rings, ARIA behavior, and what is built in.
- Comparison-ready claims: React 19, Panda CSS, tree-shakeable imports, dark mode.
- Package links: npm, GitHub, Storybook, license.

Keep the hero concise, but give crawlers and evaluators more concrete text below the fold.

### P1: Improve Storybook Search Handling

Observed:

Storybook is publicly accessible, lacks `robots.txt`, and exposes generic metadata.

Recommendation:

Decide whether Storybook should be indexed:

- If the new static docs pages become the canonical documentation, add `robots.txt` or meta robots rules to keep Storybook out of search results and point users to docs pages instead.
- If Storybook should be indexed, customize Storybook metadata, add a sitemap, and ensure docs pages render meaningful per-component titles and descriptions.

The first option is usually cleaner: keep Storybook as the interactive demo environment and make static docs the SEO surface.

### P2: Strengthen Structured Data

Observed:

`SoftwareApplication` JSON-LD exists and is valid JSON.

Recommendation:

Keep `SoftwareApplication`, but consider adding:

- `sameAs`: GitHub, npm, Storybook.
- `applicationSubCategory`: `React component library`.
- `programmingLanguage`: `TypeScript`.
- `runtimePlatform`: `React`.
- `downloadUrl`: npm package URL.
- `isAccessibleForFree`: `true`.

Avoid adding fake ratings, reviews, or popularity metrics.

### P2: Tune Titles and Headings

Observed:

- Title: `silver-ui | themeable React component library`.
- H1: `A themeable React component library`.

Recommendation:

The title is good. Consider making the H1 brand-specific:

`silver-ui React component library`

This keeps the most important brand and category terms in the visible primary heading.

### P2: Review Performance Budget

Observed from live headers:

- Homepage HTML: about 115 KB uncompressed.
- Main JavaScript asset: about 653 KB uncompressed.
- Main CSS asset: about 124 KB uncompressed.
- Open Graph image: about 60 KB.

Recommendation:

Run Lighthouse or WebPageTest before and after changes. Specific opportunities to evaluate:

- Lazy-load or simplify the interactive component showcase if it increases main-thread work.
- Split non-critical demo interactions out of the initial bundle.
- Reduce font families and weights if they are not all needed.
- Keep the prerendered content, but avoid shipping unnecessary hydrated controls above the fold.

### P2: Add Security and Trust Headers

Observed:

The site sends HSTS, but the sampled homepage response did not include common browser hardening headers.

Recommendation:

Add Vercel headers for:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` with only needed browser features
- A Content Security Policy after accounting for Google Fonts and inline font-load handling

This is not direct SEO, but it improves deployment quality and reduces avoidable risk.

## Suggested Implementation Order

1. Fix canonical host consistency and update tests.
2. Add a static docs/getting-started page and include it in the sitemap.
3. Add component documentation pages for the highest-value components.
4. Decide whether Storybook should be noindexed or made SEO-aware.
5. Run Lighthouse and set a performance budget for the marketing page.
6. Add deployment security headers.

## Validation Checklist

- `curl -I https://silver-ui.com/` redirects to the chosen canonical host.
- The canonical URL, `og:url`, sitemap URLs, JSON-LD `url`, and robots sitemap URL all match.
- `https://www.silver-ui.com/sitemap.xml` lists every public marketing/docs URL.
- `view-source:https://www.silver-ui.com/` contains the H1, primary copy, and CTA links.
- Google Rich Results Test accepts the JSON-LD.
- Lighthouse SEO score remains 100 after changes.
- New docs pages have unique titles and descriptions.
