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
const topNavItemRecipe = readFileSync(
  resolve(repoRoot, 'src/components/TopNav/TopNavItem.recipe.ts'),
  'utf-8',
);
const topNavHeadingRecipe = readFileSync(
  resolve(repoRoot, 'src/components/TopNav/TopNavHeading.recipe.ts'),
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

describe('header content', () => {
  const toggleRule = /\.theme-toggle\s*\{([^}]*)\}/.exec(docsCss)?.[1] ?? '';

  it('sizes the docs toggle off the same values as the landing TopNavItem', () => {
    // The recipe's icon-only box is `min-height: sizes.8`, `px: '2'`,
    // `py: '1.5'` and `aspect-ratio: square` around a 20px icon. docs.css
    // restates those declarations rather than the 36px they happen to produce,
    // so the two buttons stay the same size if the recipe is retuned.
    expect(topNavItemRecipe).toMatch(/minH:\s*'8'/);
    expect(topNavItemRecipe).toMatch(/py:\s*'1\.5'/);
    expect(topNavItemRecipe).toMatch(
      /isIconOnly:\s*\{\s*true:\s*\{\s*px:\s*'2'/,
    );
    expect(topNavItemRecipe).toMatch(/aspectRatio:\s*'square'/);

    expect(toggleRule).toMatch(/min-height:\s*var\(--silver-sizes-8\)/);
    expect(toggleRule).toMatch(/padding-block:\s*0\.375rem/);
    expect(toggleRule).toMatch(/padding-inline:\s*var\(--silver-spacing-2\)/);
    expect(toggleRule).toMatch(/aspect-ratio:\s*1 \/ 1/);
    // A fixed width/height would silently pin the box to the wrong size.
    expect(toggleRule).not.toMatch(/^\s*(width|height):/m);
  });

  it('colors the docs toggle like the landing one: only the background moves', () => {
    expect(topNavItemRecipe).toMatch(/color:\s*'fg\.muted'/);
    expect(topNavItemRecipe).toMatch(/_hover:\s*\{bg:\s*'bg\.hover'\}/);

    expect(toggleRule).toMatch(/color:\s*var\(--silver-colors-fg-muted\)/);

    const hover = /\.theme-toggle:hover\s*\{([^}]*)\}/.exec(docsCss)?.[1] ?? '';
    expect(hover).toMatch(
      /background-color:\s*var\(--silver-colors-bg-hover\)/,
    );
    // Starlight's own controls brighten their text on hover; ours must not, or
    // it drifts from the landing toggle on every pointer-over.
    expect(hover).not.toMatch(/(^|[^-])color:/);
  });

  it('pulls the landing wordmark flush by exactly TopNavHeading’s padding', () => {
    expect(topNavHeadingRecipe).toMatch(/px:\s*'2'/);
    expect(landingCss).toMatch(
      /\.page \.site-nav__heading\s*\{[^}]*margin-inline-start:\s*calc\(-1 \* var\(--silver-spacing-2\)\)/,
    );
  });

  it('leaves the toggle alone on the right of the docs header', () => {
    // The landing nav's right side is the toggle and nothing else.
    expect(docsCss).toMatch(/\.header \.social-icons\s*\{[^}]*display:\s*none/);
  });
});
