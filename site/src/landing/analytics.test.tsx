import '@testing-library/jest-dom/vitest';

import {render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

// Replace the Vercel components (no-ops off of Vercel) with markers so we can
// assert they are wired into the tree.
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => <div data-testid="vercel-analytics" />,
}));
vi.mock('@vercel/speed-insights/react', () => ({
  SpeedInsights: () => <div data-testid="vercel-speed-insights" />,
}));

import {App} from './App';

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

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

describe('analytics', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', createMatchMedia(false));
    vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mounts Vercel Web Analytics and Speed Insights', () => {
    render(<App />);
    expect(screen.getByTestId('vercel-analytics')).toBeInTheDocument();
    expect(screen.getByTestId('vercel-speed-insights')).toBeInTheDocument();
  });
});
