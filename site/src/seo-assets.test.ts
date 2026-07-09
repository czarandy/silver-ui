import {readFileSync, statSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalOrigin = 'https://www.silver-ui.com';
const canonicalUrl = `${canonicalOrigin}/`;

function readSiteFile(relativePath: string): string {
  return readFileSync(resolve(siteRoot, relativePath), 'utf-8');
}

function siteFileSize(relativePath: string): number {
  return statSync(resolve(siteRoot, relativePath)).size;
}

describe('SEO static assets', () => {
  it('robots.txt allows crawling and points at the generated sitemap index', () => {
    const robots = readSiteFile('public/robots.txt');
    expect(robots).toMatch(/User-agent:\s*\*/);
    expect(robots).toMatch(/Allow:\s*\//);
    // Starlight registers @astrojs/sitemap, which emits sitemap-index.xml at
    // build time (the static public/sitemap.xml was removed).
    expect(robots).toContain(`Sitemap: ${canonicalOrigin}/sitemap-index.xml`);
  });

  it('landing layout uses the www host for canonical and social URLs', () => {
    const layout = readSiteFile('src/layouts/LandingLayout.astro');

    expect(layout).toContain(
      `const canonicalUrl = 'https://www.silver-ui.com/';`,
    );
    expect(layout).toContain(
      `const ogImage = '${canonicalOrigin}/og-image.png';`,
    );
    expect(layout).toContain('<link rel="canonical" href={canonicalUrl} />');
    expect(layout).toContain(
      '<meta property="og:url" content={canonicalUrl} />',
    );
    expect(layout).toContain('<meta property="og:image" content={ogImage} />');
  });

  it('landing layout embeds valid SoftwareApplication JSON-LD', () => {
    const layout = readSiteFile('src/layouts/LandingLayout.astro');
    const match = layout.match(/const jsonLd = (\{[\s\S]*?\n\});/);
    if (match == null) {
      throw new Error('No jsonLd object found in LandingLayout.astro');
    }

    // The frontmatter object is plain JS referencing two frontmatter consts;
    // evaluate it with those bound to validate the structured data it
    // serializes.
    const descriptionMatch = layout.match(
      /const socialDescription =\s*'([^']+)';/,
    );
    if (descriptionMatch == null) {
      throw new Error(
        'No socialDescription const found in LandingLayout.astro',
      );
    }
    const data = new Function(
      'socialDescription',
      'canonicalUrl',
      `return (${match[1]});`,
    )(descriptionMatch[1], canonicalUrl) as Record<string, unknown>;
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.name).toBe('silver-ui');
    expect(data.url).toBe(canonicalUrl);
    expect(data.sameAs).toEqual([
      'https://github.com/czarandy/silver-ui',
      'https://www.npmjs.com/package/silver-ui',
      'https://storybook.silver-ui.com/',
    ]);
    expect(data.applicationSubCategory).toBe('React component library');
    expect(data.programmingLanguage).toBe('TypeScript');
    expect(data.runtimePlatform).toBe('React');
    expect(data.downloadUrl).toBe('https://www.npmjs.com/package/silver-ui');
    expect(data.isAccessibleForFree).toBe(true);
    expect(layout).toContain(
      '<script type="application/ld+json" set:html={JSON.stringify(jsonLd)} />',
    );
  });

  it('loads only the fonts that are actually used', () => {
    const layout = readSiteFile('src/layouts/LandingLayout.astro');
    // Used by the body and the theme presets.
    expect(layout).toContain('family=Inter');
    expect(layout).toContain('family=Figtree');
    expect(layout).toContain('family=Roboto');
    // Loaded but never applied (code uses the system "mono" token).
    expect(layout).not.toContain('family=JetBrains');
  });

  it('loads the font stylesheet without blocking render', () => {
    const layout = readSiteFile('src/layouts/LandingLayout.astro');
    // The applied stylesheet is deferred via the print-media swap, with a
    // no-JS fallback, so it does not block first paint.
    expect(layout).toMatch(/media="print"\s+onload="this\.media\s*=\s*'all'"/);
    expect(layout).toContain('<noscript>');
    expect(layout).toContain('rel="preload"');
  });

  it('links favicon, apple-touch-icon, and the web manifest', () => {
    const layout = readSiteFile('src/layouts/LandingLayout.astro');
    expect(layout).toContain('<link rel="icon" href="/favicon.ico"');
    expect(layout).toContain(
      'rel="apple-touch-icon" href="/apple-touch-icon.png"',
    );
    expect(layout).toContain('rel="manifest" href="/site.webmanifest"');
  });

  it('ships the icon assets referenced by the head and manifest', () => {
    for (const asset of [
      'public/favicon.ico',
      'public/apple-touch-icon.png',
      'public/icon-192.png',
      'public/icon-512.png',
      'public/icon-maskable-512.png',
    ]) {
      expect(siteFileSize(asset)).toBeGreaterThan(0);
    }
  });

  it('web manifest is valid and references existing icons', () => {
    const manifest = JSON.parse(readSiteFile('public/site.webmanifest')) as {
      name: string;
      theme_color: string;
      icons: Array<{src: string; sizes: string; purpose: string}>;
    };
    expect(manifest.name).toBe('silver-ui');
    expect(manifest.theme_color).toBe('#1ca49e');
    expect(manifest.icons.length).toBeGreaterThan(0);
    expect(manifest.icons.some(icon => icon.purpose === 'maskable')).toBe(true);

    for (const icon of manifest.icons) {
      expect(siteFileSize(`public${icon.src}`)).toBeGreaterThan(0);
    }
  });
});
