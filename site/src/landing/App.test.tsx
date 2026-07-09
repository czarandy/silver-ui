import {act} from '@testing-library/react';
import {StrictMode} from 'react';
import {hydrateRoot, type Root} from 'react-dom/client';
import {renderToString} from 'react-dom/server';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {App} from './App';

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

function buildStaticHtml(): string {
  // Mirrors how Astro statically renders the <App client:load /> island at
  // build time before the client hydrates it.
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
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
    // eslint-disable-next-line testing-library/render-result-naming-convention -- renderToString returns an HTML string, not a render result
    const html = buildStaticHtml();

    // Headings and hero copy must be present in the served HTML so crawlers
    // and link unfurlers see real content, not an empty island.
    expect(html).toContain('component library');
    expect(html).toContain('70+ fast and accessible');
    expect(html).toContain('Themeable');
    expect(html).toContain('Tree-shakeable');
    // Real anchors to the primary destinations are crawlable.
    expect(html).toContain('href="/components/"');
    expect(html).toContain('href="/getting-started/"');
    expect(html).toContain('github.com/czarandy/silver-ui');
  });

  it('gives the wordmark image intrinsic dimensions to avoid layout shift', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention -- renderToString returns an HTML string, not a render result
    const html = buildStaticHtml();
    const img = html.match(/<img[^>]*\/wordmark\.svg[^>]*>/)?.[0];
    if (img == null) {
      throw new Error('wordmark <img> not found in rendered HTML');
    }
    expect(img).toMatch(/width="1700"/);
    expect(img).toMatch(/height="417"/);
  });

  it('hydrates the prerendered markup without a mismatch', () => {
    const container = document.createElement('div');
    container.innerHTML = buildStaticHtml();
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
