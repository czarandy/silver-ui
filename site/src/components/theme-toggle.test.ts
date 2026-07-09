import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {
  applyColorScheme,
  defineThemeToggle,
  getColorScheme,
  getPreferredColorScheme,
  invertColorScheme,
  loadTheme,
  parseTheme,
  resolveTheme,
  STORAGE_KEY,
  storeTheme,
  toggleColorScheme,
} from './theme-toggle';

/**
 * Stub `matchMedia` for the `(prefers-color-scheme: light)` query, keeping the
 * registered `change` listeners so a system scheme flip can be simulated.
 */
function stubMatchMedia(prefersLight: boolean) {
  const listeners = new Set<() => void>();
  const query = {
    matches: prefersLight,
    media: '(prefers-color-scheme: light)',
    onchange: null,
    addEventListener: (_: string, listener: () => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_: string, listener: () => void) => {
      listeners.delete(listener);
    },
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => query),
  );

  return {
    /**
     * Flip the system preference and notify listeners, as the browser would.
     */
    setPrefersLight(next: boolean): void {
      query.matches = next;
      for (const listener of listeners) {
        listener();
      }
    },
  };
}

/**
 * Mount the markup `ThemeSelect.astro` renders and upgrade the element.
 */
function mountToggle(): HTMLButtonElement {
  document.body.innerHTML = `
    <silver-theme-toggle>
      <button aria-label="Toggle dark mode" class="theme-toggle" type="button">
        <svg class="theme-toggle__icon theme-toggle__icon--moon"></svg>
        <svg class="theme-toggle__icon theme-toggle__icon--sun"></svg>
      </button>
    </silver-theme-toggle>
  `;
  defineThemeToggle();
  const button = document.querySelector('button');
  if (button == null) {
    throw new Error('toggle button did not render');
  }
  return button;
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
  stubMatchMedia(true);
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('parseTheme', () => {
  it.each(['auto', 'dark', 'light'] as const)('passes through %s', theme => {
    expect(parseTheme(theme)).toBe(theme);
  });

  it.each([null, undefined, '', 'DARK', 0, {}])('coerces %o to auto', value => {
    expect(parseTheme(value)).toBe('auto');
  });
});

describe('resolveTheme', () => {
  it('keeps an explicit preference', () => {
    expect(resolveTheme('dark', 'light')).toBe('dark');
    expect(resolveTheme('light', 'dark')).toBe('light');
  });

  it('falls back to the system scheme when auto', () => {
    expect(resolveTheme('auto', 'dark')).toBe('dark');
    expect(resolveTheme('auto', 'light')).toBe('light');
  });
});

describe('invertColorScheme', () => {
  it('flips the scheme', () => {
    expect(invertColorScheme('dark')).toBe('light');
    expect(invertColorScheme('light')).toBe('dark');
  });
});

describe('getPreferredColorScheme', () => {
  it('reads the system preference', () => {
    stubMatchMedia(true);
    expect(getPreferredColorScheme()).toBe('light');

    stubMatchMedia(false);
    expect(getPreferredColorScheme()).toBe('dark');
  });
});

describe('storage', () => {
  it('round-trips an explicit preference', () => {
    storeTheme('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');
    expect(loadTheme()).toBe('dark');
  });

  it('encodes auto the way Starlight does, as an empty string', () => {
    storeTheme('auto');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('');
    expect(loadTheme()).toBe('auto');
  });

  it('treats a missing value as auto', () => {
    expect(loadTheme()).toBe('auto');
  });
});

describe('getColorScheme', () => {
  it('prefers the scheme already applied to the document', () => {
    applyColorScheme('dark');
    localStorage.setItem(STORAGE_KEY, 'light');
    expect(getColorScheme()).toBe('dark');
  });

  it('falls back to the stored preference', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');
    expect(getColorScheme()).toBe('dark');
  });

  it('falls back to the system scheme when nothing is stored', () => {
    stubMatchMedia(false);
    expect(getColorScheme()).toBe('dark');
  });
});

describe('toggleColorScheme', () => {
  it('flips the document and persists the choice', () => {
    applyColorScheme('light');

    expect(toggleColorScheme()).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

    expect(toggleColorScheme()).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('leaves auto behind once the reader picks', () => {
    stubMatchMedia(true);

    toggleColorScheme();

    expect(loadTheme()).toBe('dark');
  });
});

describe('<silver-theme-toggle>', () => {
  it('toggles the document theme when the button is clicked', () => {
    applyColorScheme('light');
    const button = mountToggle();

    button.click();
    expect(document.documentElement.dataset.theme).toBe('dark');

    button.click();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('follows the system scheme while the preference is auto', () => {
    const media = stubMatchMedia(true);
    applyColorScheme('light');
    mountToggle();

    media.setPrefersLight(false);

    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('ignores system changes once the reader has picked', () => {
    const media = stubMatchMedia(true);
    applyColorScheme('light');
    const button = mountToggle();

    button.click();
    expect(document.documentElement.dataset.theme).toBe('dark');

    media.setPrefersLight(true);

    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('only binds its listeners once across reconnections', () => {
    applyColorScheme('light');
    const button = mountToggle();
    const host = document.querySelector('silver-theme-toggle');

    // Re-entering the document must not double-bind the click handler, which
    // would toggle twice per press and appear to do nothing.
    host?.remove();
    document.body.append(host as Node);

    button.click();

    expect(document.documentElement.dataset.theme).toBe('dark');
  });
});
