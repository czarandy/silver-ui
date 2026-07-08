import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function readSiteFile(relativePath: string): string {
  return readFileSync(resolve(siteRoot, relativePath), 'utf-8');
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
});
