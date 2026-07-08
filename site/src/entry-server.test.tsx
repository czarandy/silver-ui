import {act} from '@testing-library/react';
import {StrictMode} from 'react';
import {hydrateRoot, type Root} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {App} from './App';
import {render as buildStaticHtml} from './entry-server';

function createMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe('prerendered marketing page', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', createMatchMedia(false));
    // jsdom does not implement ResizeObserver, which AppShell wires up in a
    // mount effect after hydration.
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('emits the SEO-critical content into the static HTML', () => {
    const html = buildStaticHtml();

    // Headings and hero copy must be present in the served HTML so crawlers
    // and link unfurlers see real content, not an empty #root.
    expect(html).toContain('component library');
    expect(html).toContain('70+ fast and accessible');
    expect(html).toContain('Themeable');
    expect(html).toContain('Tree-shakeable');
    // Real anchors to the primary destinations are crawlable.
    expect(html).toContain('storybook.silver-ui.com');
    expect(html).toContain('github.com/czarandy/silver-ui');
  });

  it('hydrates the prerendered markup without a mismatch', () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    document.body.appendChild(container);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: Root | undefined;
    act(() => {
      root = hydrateRoot(
        container,
        <StrictMode>
          <App />
        </StrictMode>,
      );
    });

    const hydrationErrors = errorSpy.mock.calls.filter(([message]) => {
      return (
        typeof message === 'string' &&
        /hydrat|did not match|server rendered/i.test(message)
      );
    });
    expect(hydrationErrors).toEqual([]);

    act(() => {
      root?.unmount();
    });
    errorSpy.mockRestore();
    document.body.removeChild(container);
  });
});
