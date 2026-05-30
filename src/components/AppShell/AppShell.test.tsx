import {render, screen} from '@testing-library/react';
import {Home} from 'lucide-react';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {SideNav, SideNavItem, SideNavSection} from '../SideNav';
import {TopNav, TopNavHeading, TopNavItem} from '../TopNav';
import {AppShell} from './AppShell';

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

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});

beforeEach(() => {
  vi.stubGlobal('matchMedia', createMatchMedia(false));
});

describe('AppShell', () => {
  it('renders children in a main landmark with a skip link', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByRole('main')).toHaveTextContent('Content');
    expect(screen.getByTestId('skip-to-content')).toHaveAttribute(
      'href',
      '#silver-app-shell-main',
    );
  });

  it('renders top nav, side nav, and banner slots', () => {
    render(
      <AppShell
        banner={<div>Banner</div>}
        sideNav={
          <SideNav>
            <SideNavSection title="Main">
              <SideNavItem href="/home" icon={<Home />} label="Home" />
            </SideNavSection>
          </SideNav>
        }
        topNav={
          <TopNav
            heading={<TopNavHeading heading="Silver" />}
            label="Main navigation">
            <TopNavItem href="/docs" label="Docs" />
          </TopNav>
        }>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByText('Banner')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {name: 'Main navigation'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {name: 'Side navigation'}),
    ).toBeInTheDocument();
  });

  it('shows mobile navigation affordances below the breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell
        sideNav={
          <SideNav>
            <SideNavItem href="/home" icon={<Home />} label="Home" />
          </SideNav>
        }>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.getByRole('button', {name: 'Open navigation'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog', {hidden: true})).toBeInTheDocument();
  });
});
