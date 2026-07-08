import {readFileSync, statSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readSiteFile(relativePath: string): string {
  return readFileSync(resolve(siteRoot, relativePath), 'utf-8');
}

function siteFileSize(relativePath: string): number {
  return statSync(resolve(siteRoot, relativePath)).size;
}

describe('SEO static assets', () => {
  it('robots.txt allows crawling and points at the sitemap', () => {
    const robots = readSiteFile('public/robots.txt');
    expect(robots).toMatch(/User-agent:\s*\*/);
    expect(robots).toMatch(/Allow:\s*\//);
    expect(robots).toContain('Sitemap: https://silver-ui.com/sitemap.xml');
  });

  it('sitemap.xml is well-formed and lists the canonical URL', () => {
    const sitemap = readSiteFile('public/sitemap.xml');
    expect(sitemap).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    );
    expect(sitemap).toContain('<loc>https://silver-ui.com/</loc>');
  });

  it('index.html embeds valid SoftwareApplication JSON-LD', () => {
    const html = readSiteFile('index.html');
    const match = html.match(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
    );
    if (match == null) {
      throw new Error('No JSON-LD script found in index.html');
    }

    const data = JSON.parse(match[1]) as Record<string, unknown>;
    expect(data['@context']).toBe('https://schema.org');
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.name).toBe('silver-ui');
    expect(data.url).toBe('https://silver-ui.com/');
  });

  it('loads only the fonts that are actually used', () => {
    const html = readSiteFile('index.html');
    // Used by the body and the theme presets.
    expect(html).toContain('family=Inter');
    expect(html).toContain('family=Figtree');
    expect(html).toContain('family=Roboto');
    // Loaded but never applied (code uses the system "mono" token).
    expect(html).not.toContain('family=JetBrains');
  });

  it('loads the font stylesheet without blocking render', () => {
    const html = readSiteFile('index.html');
    // The applied stylesheet is deferred via the print-media swap, with a
    // no-JS fallback, so it does not block first paint.
    expect(html).toMatch(/media="print"\s+onload="this\.media\s*=\s*'all'"/);
    expect(html).toContain('<noscript>');
    expect(html).toContain('rel="preload"');
  });

  it('links favicon, apple-touch-icon, and the web manifest', () => {
    const html = readSiteFile('index.html');
    expect(html).toContain('<link rel="icon" href="/favicon.ico"');
    expect(html).toContain(
      'rel="apple-touch-icon" href="/apple-touch-icon.png"',
    );
    expect(html).toContain('rel="manifest" href="/site.webmanifest"');
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
