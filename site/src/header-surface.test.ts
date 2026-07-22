import {readFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {token} from 'styled-system/tokens';

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
const landingApp = readFileSync(
  resolve(siteRoot, 'src/landing/App.tsx'),
  'utf-8',
);
const docsSocialIcons = readFileSync(
  resolve(siteRoot, 'src/components/SocialIcons.astro'),
  'utf-8',
);
const astroConfig = readFileSync(resolve(siteRoot, 'astro.config.ts'), 'utf-8');

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
    // The selector must stay element-qualified (`header.header`): Starlight
    // also puts class `header` on a layout div inside the bar, and a bare
    // `.header` width paints a second stray hairline through the header.
    const docsBorder = tokenFor(
      docsCss,
      /(?<![\w.])header\.header\s*\{[^}]*border-bottom-color:\s*var\((--silver-colors-[\w-]+)\)/,
    );
    const docsBorderWidth = tokenFor(
      docsCss,
      /(?<![\w.])header\.header\s*\{[^}]*border-bottom-width:\s*var\((--silver-border-widths-[\w-]+)\)/,
    );
    // Forbid a selector that STARTS with bare `.header` (it would match both
    // elements); `header.header > .header` deliberately targets the inner div.
    expect(stripComments(docsCss)).not.toMatch(/(^|[,}])\s*\.header\s*[{,]/m);

    expect(docsBorder).toBe('--silver-colors-border');
    // The landing side gets its hairline from AppShell's `headerDivider`
    // variant, which resolves the same color and width tokens through Panda.
    expect(appShellRecipe).toMatch(/borderBlockEndColor:\s*'border'/);
    expect(docsBorderWidth).toBe('--silver-border-widths-default');
    expect(appShellRecipe).toMatch(/borderBlockEndWidth:\s*'default'/);
  });

  it('stays unlayered so it outranks Starlight’s own layered rules', () => {
    // Starlight scopes every rule to a `starlight.*` layer, and unlayered
    // declarations beat layered ones outright. Wrapping this file in a layer
    // would silently hand the header back to Starlight's grey.
    expect(stripComments(docsCss)).not.toMatch(/@layer/);
  });

  it('matches the docs header geometry so the wordmark holds its place', () => {
    // Starlight's nav is 3.5rem tall with 1rem of inline padding, growing to
    // 4rem / 1.5rem at its 50rem breakpoint. Its divider is inside that fixed
    // height; AppShell's divider wraps TopNav, so the landing nav subtracts
    // the shared width to give both wordmarks the same vertical center.
    expect(landingCss).toMatch(
      /\.page \.site-nav\s*\{[^}]*min-height:\s*calc\(3\.5rem - var\(--silver-border-widths-default\)\);[^}]*padding:\s*0\.75rem 1rem;/,
    );
    expect(landingCss).toMatch(
      /@media \(min-width: 50rem\)\s*\{\s*\.page \.site-nav\s*\{[^}]*min-height:\s*calc\(4rem - var\(--silver-border-widths-default\)\);[^}]*padding-inline:\s*1\.5rem;/,
    );
  });
});

describe('header content', () => {
  const toggleRule = /\.theme-toggle\s*\{([^}]*)\}/.exec(docsCss)?.[1] ?? '';

  it('keeps the nav links on the landing line height so text does not jump', () => {
    // The landing TopNavItem inherits Panda's base 1.5 line height, while the
    // docs header sits in Starlight's ambient 1.75. Without restating the
    // token, the docs link boxes grow 4px and the text baseline snaps to a
    // different device pixel at fractional display scaling, so the links
    // visibly shift when crossing between the two headers.
    const linkRule = /\.header-nav-link\s*\{([^}]*)\}/.exec(docsCss)?.[1] ?? '';
    expect(linkRule).toMatch(
      /line-height:\s*var\(--silver-line-heights-normal\)/,
    );
    // Pin the token to the value Panda's base styles give the landing nav.
    expect(token('lineHeights.normal')).toBe('1.5');
  });

  it('sizes the inner header row exactly so zoom cannot re-round it', () => {
    // Starlight gives its inner layout div `height: 100%`; under fractional
    // page zoom that percentage resolves against a rounded ancestor box, so
    // the centered links and toggle land a fraction of a pixel lower than the
    // landing nav's and snap to a different device pixel. The override states
    // the same height as an exact calc from the vars Starlight sizes the bar
    // with, keeping both headers' centering math identical at every zoom.
    expect(docsCss).toMatch(
      /header\.header\s*>\s*\.header\s*\{[^}]*height:\s*calc\(\s*var\(--sl-nav-height\)\s*-\s*2\s*\*\s*var\(--sl-nav-pad-y\)\s*-\s*var\(--silver-border-widths-default\)\s*\)/,
    );
  });

  it('keeps the toggle a direct flex item like the landing one', () => {
    // The landing toggle is centered by its nav's `align-items`. The docs
    // button sits inside the `<silver-theme-toggle>` custom element; without
    // `display: contents` that wrapper is the flex item and the button rides
    // a text baseline set by Starlight's 1.75 line strut, a fraction of a
    // pixel lower than the landing button.
    expect(docsCss).toMatch(/silver-theme-toggle\s*\{[^}]*display:\s*contents/);
  });

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

  it('renders the docs header links from the shared list, not a copy', () => {
    // Both navs map NAV_LINKS, so a link added to one appears in the other.
    expect(landingApp).toMatch(
      /import \{LINKS, NAV_LINKS\} from '\.\.\/nav-links'/,
    );
    expect(landingApp).toMatch(/NAV_LINKS\.map\(/);
    expect(docsSocialIcons).toMatch(
      /import \{NAV_LINKS\} from '\.\.\/nav-links'/,
    );
    expect(docsSocialIcons).toMatch(/NAV_LINKS\.map\(/);

    // Neither may hardcode a destination alongside the shared list.
    expect(docsSocialIcons).not.toMatch(/href="(https?:)?\//);
  });

  it('routes the docs links through the slot Starlight actually renders', () => {
    // `SocialIcons` is the only header slot that appears both in the desktop
    // right group and in the mobile menu footer, which is where the landing
    // nav puts its links (bar, then drawer).
    expect(astroConfig).toMatch(
      /SocialIcons:\s*'\.\/src\/components\/SocialIcons\.astro'/,
    );
    // With the slot overridden, nothing reads `social` — leaving it would
    // imply an icon row that never renders.
    expect(astroConfig).not.toMatch(/^\s*social:/m);
  });

  it('styles the docs links like the landing TopNavItem text form', () => {
    expect(topNavItemRecipe).toMatch(/px:\s*'3'/);
    expect(topNavItemRecipe).toMatch(/fontWeight:\s*'medium'/);

    const linkRule = /\.header-nav-link\s*\{([^}]*)\}/.exec(docsCss)?.[1] ?? '';
    expect(linkRule).toMatch(/padding-inline:\s*var\(--silver-spacing-3\)/);
    expect(linkRule).toMatch(/min-height:\s*var\(--silver-sizes-8\)/);
    expect(linkRule).toMatch(/color:\s*var\(--silver-colors-fg-muted\)/);
    expect(linkRule).toMatch(
      /font-weight:\s*var\(--silver-font-weights-medium\)/,
    );

    // Starlight draws a divider beside the icons this slot used to hold.
    expect(docsCss).toMatch(
      /\.header \.social-icons::after\s*\{[^}]*content:\s*none/,
    );
  });
});
