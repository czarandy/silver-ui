import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

/**
 * The landing page and the docs pages render different headers — one is
 * silver-ui's `TopNav` inside an `AppShell`, the other is Starlight's — but
 * they are the same site, so the bar must not change surface when a reader
 * crosses between them.
 *
 * Rather than assert two hardcoded colors match, these tests pin the coupling:
 * both sides must resolve their header background and hairline from the *same*
 * silver-ui token. Restyling one side alone fails here.
 */

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = resolve(siteRoot, '..');

const docsCss = readFileSync(resolve(siteRoot, 'src/styles/docs.css'), 'utf-8');
const landingCss = readFileSync(
  resolve(siteRoot, 'src/landing/styles.css'),
  'utf-8',
);
const appShellRecipe = readFileSync(
  resolve(repoRoot, 'src/components/AppShell/AppShell.recipe.ts'),
  'utf-8',
);

/**
 * Drop comments so prose about `@layer` is not mistaken for an at-rule.
 */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/**
 * Pull the silver-ui custom property a declaration resolves to.
 */
function tokenFor(css: string, pattern: RegExp): string {
  const match = pattern.exec(css);
  if (match?.[1] == null) {
    throw new Error(`no silver-ui token matched ${String(pattern)}`);
  }
  return match[1];
}

describe('header surface', () => {
  it('paints both headers from the same background token', () => {
    // Starlight's header background, remapped onto a silver-ui token.
    const docsBg = tokenFor(
      docsCss,
      /--sl-color-bg-nav:\s*var\((--silver-colors-[\w-]+)\)/,
    );
    // The landing TopNav, painted directly.
    const landingBg = tokenFor(
      landingCss,
      /\.page \.site-nav\s*\{[^}]*background:\s*var\((--silver-colors-[\w-]+)\)/,
    );

    expect(docsBg).toBe('--silver-colors-bg-subtle');
    expect(landingBg).toBe(docsBg);
  });

  it('draws both hairlines from the same border token', () => {
    const docsBorder = tokenFor(
      docsCss,
      /\.header\s*\{[^}]*border-bottom-color:\s*var\((--silver-colors-[\w-]+)\)/,
    );

    expect(docsBorder).toBe('--silver-colors-border');
    // The landing side gets its hairline from AppShell's `headerDivider`
    // variant, which resolves the same `border` token through Panda.
    expect(appShellRecipe).toMatch(/borderBlockEndColor:\s*'border'/);
  });

  it('stays unlayered so it outranks Starlight’s own layered rules', () => {
    // Starlight scopes every rule to a `starlight.*` layer, and unlayered
    // declarations beat layered ones outright. Wrapping this file in a layer
    // would silently hand the header back to Starlight's grey.
    expect(stripComments(docsCss)).not.toMatch(/@layer/);
  });

  it('matches the docs header geometry so the wordmark holds its place', () => {
    // Starlight's nav is 3.5rem tall with 1rem of inline padding, growing to
    // 4rem / 1.5rem at its 50rem breakpoint. The landing nav tracks both.
    expect(landingCss).toMatch(
      /\.page \.site-nav\s*\{[^}]*min-height:\s*3\.5rem;[^}]*padding:\s*0\.75rem 1rem;/,
    );
    expect(landingCss).toMatch(
      /@media \(min-width: 50rem\)\s*\{\s*\.page \.site-nav\s*\{[^}]*min-height:\s*4rem;[^}]*padding-inline:\s*1\.5rem;/,
    );
  });
});
