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
  assertContains(html, 'npm install silver-ui', 'install command');
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
