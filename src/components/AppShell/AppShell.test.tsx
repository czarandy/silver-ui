import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Home} from 'lucide-react';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {AppShell} from 'components/AppShell/AppShell';
import {appShellRecipe} from 'components/AppShell/AppShell.recipe';
import {layoutRegionRecipe} from 'components/Layout/Layout.recipe';
import {SideNav, SideNavItem, SideNavSection} from 'components/SideNav';
import {TopNav, TopNavHeading, TopNavItem} from 'components/TopNav';

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

const sideNav = (
  <SideNav>
    <SideNavSection title="Main">
      <SideNavItem href="/home" icon={Home} label="Home" />
    </SideNavSection>
  </SideNav>
);

const topNav = (
  <TopNav heading={<TopNavHeading heading="Silver" />} label="Main navigation">
    <TopNavItem href="/docs" label="Docs" />
  </TopNav>
);

describe('AppShell', () => {
  it('renders children in a main landmark with a skip link', () => {
    render(
      <AppShell>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByRole('main')).toHaveTextContent('Content');
    const mainId = screen.getByRole('main').id;
    expect(mainId).not.toBe('');
    expect(screen.getByTestId('skip-to-content')).toHaveAttribute(
      'href',
      `#${mainId}`,
    );
  });

  it('renders top nav, side nav, and banner slots', () => {
    render(
      <AppShell banner={<div>Banner</div>} sideNav={sideNav} topNav={topNav}>
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

  it('renders banner before top nav in the DOM', () => {
    render(
      <AppShell banner={<div data-testid="banner">Banner</div>} topNav={topNav}>
        <div>Content</div>
      </AppShell>,
    );

    const banner = screen.getByTestId('banner');
    const nav = screen.getByRole('navigation', {name: 'Main navigation'});
    expect(
      banner.compareDocumentPosition(nav) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('shows mobile navigation affordances below the breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell sideNav={sideNav}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.getByRole('button', {name: 'Open navigation'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog', {hidden: true})).toBeInTheDocument();
  });

  it('applies the height variant class', () => {
    render(
      <AppShell data-testid="shell" height="auto">
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toHaveClass(
      appShellRecipe({height: 'auto'}),
    );
  });

  it('applies the variant class', () => {
    render(
      <AppShell data-testid="shell" variant="section">
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toHaveClass(
      appShellRecipe({variant: 'section'}),
    );
  });

  it('applies variant="section" with dividers', () => {
    render(
      <AppShell
        data-testid="shell"
        sideNav={sideNav}
        topNav={topNav}
        variant="section">
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByTestId('shell')).toHaveClass(
      appShellRecipe({variant: 'section'}),
    );
  });

  it('does not show mobile nav when isMobileNavDisabled is true', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell isMobileNavDisabled sideNav={sideNav}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole('button', {name: 'Open navigation'}),
    ).not.toBeInTheDocument();
  });

  it('applies className, style, and data-testid', () => {
    render(
      <AppShell
        className="custom-shell"
        data-testid="shell"
        style={{color: 'red'}}>
        <div>Content</div>
      </AppShell>,
    );

    const shell = screen.getByTestId('shell');
    expect(shell).toHaveClass('custom-shell');
    expect(shell).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('forwards ref to the root element', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <AppShell ref={ref}>
        <div>Content</div>
      </AppShell>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('hides inline side nav below the breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell sideNav={sideNav} topNav={topNav}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole('navigation', {name: 'Side navigation'}),
    ).not.toBeInTheDocument();
  });

  it('shows inline side nav above the breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(false));

    render(
      <AppShell sideNav={sideNav} topNav={topNav}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.getByRole('navigation', {name: 'Side navigation'}),
    ).toBeInTheDocument();
  });

  it('opens the drawer when the toggle is clicked', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell sideNav={sideNav}>
        <div>Content</div>
      </AppShell>,
    );

    await user.click(screen.getByRole('button', {name: 'Open navigation'}));

    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).toHaveAttribute('open');
  });

  it('closes the drawer when the close button is clicked', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell sideNav={sideNav}>
        <div>Content</div>
      </AppShell>,
    );

    await user.click(screen.getByRole('button', {name: 'Open navigation'}));
    const dialog = screen.getByRole('dialog', {hidden: true});
    expect(dialog).toHaveAttribute('open');

    await user.click(screen.getByRole('button', {name: 'Close navigation'}));
    expect(dialog).not.toHaveAttribute('open');
  });

  it('renders drawer content with both topNav and sideNav below the breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell sideNav={sideNav} topNav={topNav}>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByRole('dialog', {hidden: true})).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', {name: 'Main navigation'}),
    ).toBeInTheDocument();
  });

  it('does not generate mobile nav when mobileBreakpoint is none', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockImplementation((query: string) => ({
        matches: query !== '(max-width: 0px)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );

    render(
      <AppShell mobileBreakpoint="none" sideNav={sideNav}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole('button', {name: 'Open navigation'}),
    ).not.toBeInTheDocument();
  });

  it('still renders side nav inline when isMobileNavDisabled and below breakpoint', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <AppShell isMobileNavDisabled sideNav={sideNav} topNav={topNav}>
        <div>Content</div>
      </AppShell>,
    );

    expect(
      screen.queryByRole('button', {name: 'Open navigation'}),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Content');
  });

  it('applies contentPadding to the main content area', () => {
    render(
      <AppShell contentPadding={6}>
        <div>Content</div>
      </AppShell>,
    );

    expect(screen.getByRole('main')).toHaveClass(
      layoutRegionRecipe({padding: 6}),
    );
  });
});
