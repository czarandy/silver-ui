/**
 * Client logic for the docs-site dark mode toggle.
 *
 * Starlight stores the color scheme preference in `localStorage` under
 * `starlight-theme` and reflects the resolved scheme on
 * `document.documentElement.dataset.theme`. Its inlined `ThemeProvider`
 * script sets both before first paint, and its stock `ThemeSelect` renders a
 * dark/light/auto `<select>` over that state.
 *
 * `ThemeSelect.astro` overrides only the control — a single icon button that
 * flips between light and dark, matching the landing page nav. This module
 * keeps Starlight's storage contract intact so the override drops in without
 * a flash of the wrong theme, and re-implements the one behavior that lived
 * in the stock control: following the system scheme until the reader picks.
 */

export type Theme = 'auto' | 'dark' | 'light';
export type ColorScheme = 'dark' | 'light';

/**
 * Key in `localStorage` that Starlight reads the preference from.
 */
export const STORAGE_KEY = 'starlight-theme';

const ELEMENT_NAME = 'silver-theme-toggle';

const LIGHT_SCHEME_QUERY = '(prefers-color-scheme: light)';

/**
 * Coerce any JS value to a theme, matching Starlight's own parser.
 */
export const parseTheme = (theme: unknown): Theme =>
  theme === 'auto' || theme === 'dark' || theme === 'light' ? theme : 'auto';

/**
 * The color scheme the operating system asks for.
 */
export const getPreferredColorScheme = (): ColorScheme =>
  matchMedia(LIGHT_SCHEME_QUERY).matches ? 'light' : 'dark';

/**
 * Read the stored preference; anything unrecognized means `auto`.
 */
export const loadTheme = (): Theme =>
  parseTheme(
    typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem(STORAGE_KEY),
  );

/**
 * Persist the preference. Starlight writes an empty string for `auto`, which
 * its own `parseTheme` reads back as `auto` — keep that encoding so the two
 * implementations stay interchangeable.
 */
export function storeTheme(theme: Theme): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  localStorage.setItem(STORAGE_KEY, theme === 'auto' ? '' : theme);
}

/**
 * Collapse a preference into the scheme actually rendered.
 */
export const resolveTheme = (
  theme: Theme,
  preferred: ColorScheme,
): ColorScheme => (theme === 'auto' ? preferred : theme);

/**
 * The opposite of the given scheme.
 */
export const invertColorScheme = (scheme: ColorScheme): ColorScheme =>
  scheme === 'dark' ? 'light' : 'dark';

/**
 * The scheme on screen right now. `ThemeProvider` sets `data-theme` before
 * paint, so it is the source of truth; fall back to the stored preference for
 * the case where this runs before that script (tests, mainly).
 */
export function getColorScheme(): ColorScheme {
  const applied = document.documentElement.dataset.theme;
  return applied === 'dark' || applied === 'light'
    ? applied
    : resolveTheme(loadTheme(), getPreferredColorScheme());
}

/**
 * Reflect a scheme on the document, which is what Starlight's CSS keys off.
 */
export function applyColorScheme(scheme: ColorScheme): void {
  document.documentElement.dataset.theme = scheme;
}

/**
 * Flip the scheme and remember the choice. Toggling is always an explicit
 * pick, so this leaves `auto` behind for good — same as choosing dark or
 * light in the stock `<select>`.
 */
export function toggleColorScheme(): ColorScheme {
  const next = invertColorScheme(getColorScheme());
  applyColorScheme(next);
  storeTheme(next);
  return next;
}

class SilverThemeToggle extends HTMLElement {
  #connected = false;

  connectedCallback(): void {
    if (this.#connected) {
      return;
    }
    this.#connected = true;

    this.querySelector('button')?.addEventListener('click', () => {
      toggleColorScheme();
    });

    // The stock control tracked the system scheme while the preference was
    // `auto`; without this the page would freeze at whatever it rendered with.
    matchMedia(LIGHT_SCHEME_QUERY).addEventListener('change', () => {
      if (loadTheme() === 'auto') {
        applyColorScheme(getPreferredColorScheme());
      }
    });
  }
}

/**
 * Register the custom element, tolerating a double import.
 */
export function defineThemeToggle(): void {
  if (!customElements.get(ELEMENT_NAME)) {
    customElements.define(ELEMENT_NAME, SilverThemeToggle);
  }
}
