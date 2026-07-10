// Post-build smoke test for the static site output. Asserts the SEO-critical
// invariants that unit tests can't see (they run against source, not the
// built dist/): the landing page is prerendered with real body content, the
// docs pages exist, and the sitemap was generated.
import {readFileSync, statSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');

const failures = [];

function check(description, fn) {
  try {
    fn();
  } catch (error) {
    failures.push(`${description}: ${error.message}`);
  }
}

function read(relativePath) {
  return readFileSync(resolve(dist, relativePath), 'utf-8');
}

function assertContains(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`missing ${label}: ${needle}`);
  }
}

check('landing page is prerendered with SEO content', () => {
  const html = read('index.html');
  assertContains(
    html,
    '<link rel="canonical" href="https://www.silver-ui.com/"',
    'canonical link',
  );
  assertContains(html, 'application/ld+json', 'JSON-LD');
  // The React island must be statically rendered, not an empty shell.
  assertContains(html, 'component library', 'prerendered hero copy');
  assertContains(html, '70+ fast and accessible', 'prerendered lede');
});

check('getting-started docs page is generated', () => {
  const html = read('getting-started/index.html');
  assertContains(html, 'Installation', 'installation heading');
  // The install commands render as Starlight package-manager tabs, which only
  // compile because the page is emitted as .mdx (a plain .md would leak the
  // literal <Tabs> markup instead). Assert the compiled tab UI and every
  // command so a regression to markdown, or a dropped package manager, fails.
  assertContains(html, 'starlight-tabs', 'compiled package-manager tabs');
  assertContains(html, 'npm install silver-ui', 'npm install command');
  assertContains(html, 'pnpm add silver-ui', 'pnpm install command');
  assertContains(html, 'yarn add silver-ui', 'yarn install command');
});

check('theming guide is generated from THEME.md', () => {
  const html = read('theming/index.html');
  assertContains(html, 'Quick start', 'THEME.md section heading');
  assertContains(html, '--silver-colors-primary', 'CSS variable reference');
});

check('components overview page is generated', () => {
  const html = read('components/index.html');
  assertContains(html, 'Layout &amp; Structure', 'category heading');
  assertContains(html, '/components/button/', 'component link');
});

check('component pages are generated with props tables', () => {
  const html = read('components/button/index.html');
  assertContains(html, '<h2', 'API heading');
  assertContains(html, 'variant', 'variant prop row');
  assertContains(html, 'isIconOnly', 'discriminated union group');
  // Sidebar links to a page from another category prove the full sidebar
  // rendered.
  assertContains(html, '/components/date-input', 'sidebar cross-link');
});

check('live demos are prerendered into the page', () => {
  const html = read('components/button/index.html');
  assertContains(html, 'data-component-preview', 'demo preview box');
  // The story island must contain server-rendered component markup (a real
  // <button> with Panda classes), not an empty hydration shell.
  if (!/<astro-island[^>]*>\s*<button[^>]*class="silver-/.test(html)) {
    throw new Error("no SSR'd <button> markup inside a story island");
  }
  // And the code snippet next to it.
  assertContains(html, 'variant=', 'story snippet');
});

check('sitemap index is generated', () => {
  const sitemap = read('sitemap-index.xml');
  assertContains(sitemap, '<sitemapindex', 'sitemapindex root element');
});

check('pagefind search index is generated', () => {
  const size = statSync(resolve(dist, 'pagefind/pagefind.js')).size;
  if (size <= 0) {
    throw new Error('pagefind/pagefind.js is empty');
  }
});

if (failures.length > 0) {
  process.stderr.write(`smoke-dist: FAILED\n  ${failures.join('\n  ')}\n`);
  process.exit(1);
}

process.stdout.write('smoke-dist: all checks passed\n');
