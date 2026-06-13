import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Search} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {
  AppShellMobileContext,
  type AppShellMobileContextValue,
} from 'components/AppShell/AppShellMobileContext';
import {TopNav} from 'components/TopNav/TopNav';
import {
  TopNavMobileContentContext,
  TopNavRenderContext,
} from 'components/TopNav/TopNavContext';
import {TopNavHeading} from 'components/TopNav/TopNavHeading';
import {TopNavItem} from 'components/TopNav/TopNavItem';

describe('TopNav', () => {
  it('renders heading, start content, and end content', () => {
    render(
      <TopNav
        endContent={<button type="button">Settings</button>}
        heading={<TopNavHeading heading="Silver" />}
        label="Main navigation">
        <TopNavItem href="/home" label="Home" />
      </TopNav>,
    );

    expect(
      screen.getByRole('navigation', {name: 'Main navigation'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Silver')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'href',
      '/home',
    );
    expect(screen.getByRole('button', {name: 'Settings'})).toBeInTheDocument();
  });

  it('renders centerContent in a grid layout', () => {
    render(
      <TopNav
        centerContent={<TopNavItem href="/center" label="Center" />}
        heading={<TopNavHeading heading="App" />}
        label="Nav"
      />,
    );

    expect(screen.getByRole('link', {name: 'Center'})).toBeInTheDocument();
  });

  it('uses startContent over children when both are provided', () => {
    // The precedence warning is asserted in the dedicated test below; silence
    // it here so it does not pollute the test output.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <TopNav
        label="Nav"
        startContent={<TopNavItem href="/start" label="Start" />}>
        <TopNavItem href="/child" label="Child" />
      </TopNav>,
    );

    expect(screen.getByRole('link', {name: 'Start'})).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: 'Child'})).not.toBeInTheDocument();

    warn.mockRestore();
  });

  it('warns when both startContent and children are provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <TopNav
        label="Nav"
        startContent={<TopNavItem href="/start" label="Start" />}>
        <TopNavItem href="/child" label="Child" />
      </TopNav>,
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('`startContent` takes precedence'),
    );

    warn.mockRestore();
  });

  it('does not warn when only children are provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <TopNav label="Nav">
        <TopNavItem href="/child" label="Child" />
      </TopNav>,
    );

    expect(warn).not.toHaveBeenCalled();

    warn.mockRestore();
  });

  it('renders without a heading', () => {
    render(
      <TopNav data-testid="nav" label="Nav">
        <TopNavItem href="/home" label="Home" />
      </TopNav>,
    );

    expect(screen.getByTestId('nav')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toBeInTheDocument();
  });

  it('applies className, style, and data-testid to the nav element', () => {
    render(
      <TopNav
        className="custom-nav"
        data-testid="nav"
        label="Nav"
        style={{color: 'red'}}>
        <TopNavItem href="/home" label="Home" />
      </TopNav>,
    );

    const nav = screen.getByTestId('nav');
    expect(nav).toHaveClass('custom-nav');
    expect(nav).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('forwards ref to the nav element', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();
    render(
      <TopNav data-testid="nav" label="Nav" ref={ref}>
        <TopNavItem href="/home" label="Home" />
      </TopNav>,
    );

    expect(ref).toHaveBeenCalledWith(screen.getByTestId('nav'));
  });

  it('renders heading and end content in mobile-bar mode', () => {
    render(
      <TopNavRenderContext value="mobile-bar">
        <TopNav
          data-testid="nav"
          endContent={<button type="button">Action</button>}
          heading={<TopNavHeading heading="App" />}
          label="Nav">
          <TopNavItem href="/home" label="Home" />
        </TopNav>
      </TopNavRenderContext>,
    );

    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: 'Home'})).not.toBeInTheDocument();
  });
});

describe('TopNavItem', () => {
  it('sets aria-current="page" when isSelected is true', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem href="/home" isSelected label="Home" />
      </TopNav>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByText('Home')).toHaveClass('silver-fs_md');
  });

  it('marks disabled items with aria-disabled and tabIndex -1', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem href="/admin" isDisabled label="Admin" />
      </TopNav>,
    );

    const link = screen.getByRole('link', {name: 'Admin'});
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabindex', '-1');
  });

  it('prevents navigation when disabled', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem href="/admin" isDisabled label="Admin" />
      </TopNav>,
    );

    const link = screen.getByRole('link', {name: 'Admin'});
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const spy = vi.spyOn(clickEvent, 'preventDefault');
    link.dispatchEvent(clickEvent);
    expect(spy).toHaveBeenCalled();
  });

  it('renders a button when href is omitted', () => {
    const onClick = vi.fn();
    render(
      <TopNav label="Nav">
        <TopNavItem label="Action" onClick={onClick} />
      </TopNav>,
    );

    const button = screen.getByRole('button', {name: 'Action'});
    expect(button).toHaveAttribute('type', 'button');
    expect(
      screen.queryByRole('link', {name: 'Action'}),
    ).not.toBeInTheDocument();
  });

  it('calls onClick when the button item is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <TopNav label="Nav">
        <TopNavItem label="Action" onClick={onClick} />
      </TopNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Action'}));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the button and skips onClick when isDisabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <TopNav label="Nav">
        <TopNavItem isDisabled label="Action" onClick={onClick} />
      </TopNav>,
    );

    const button = screen.getByRole('button', {name: 'Action'});
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders icon-only items with aria-label and hidden text', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem
          data-testid="item"
          href="/search"
          icon={Search}
          isIconOnly
          label="Search"
        />
      </TopNav>,
    );

    const item = screen.getByTestId('item');
    expect(item).toHaveAttribute('aria-label', 'Search');
    // eslint-disable-next-line testing-library/no-node-access -- verifying decorative svg presence
    expect(item.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByText('Search')).not.toBeInTheDocument();
  });

  it('renders items with both icon and label', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem
          data-testid="item"
          href="/home"
          icon={Search}
          label="Home"
        />
      </TopNav>,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying decorative svg presence
    expect(screen.getByTestId('item').querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('passes rel and target through to the anchor', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem href="/docs" label="Docs" rel="author" target="_self" />
      </TopNav>,
    );

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link).toHaveAttribute('target', '_self');
    expect(link).toHaveAttribute('rel', 'author');
  });

  it('adds noopener noreferrer for target="_blank"', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem href="/docs" label="Docs" target="_blank" />
      </TopNav>,
    );

    const link = screen.getByRole('link', {name: /Docs/});
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('merges an explicit rel with the noopener noreferrer for _blank', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem href="/docs" label="Docs" rel="author" target="_blank" />
      </TopNav>,
    );

    const rel = screen.getByRole('link', {name: /Docs/}).getAttribute('rel');
    expect(rel?.split(' ').sort()).toEqual([
      'author',
      'noopener',
      'noreferrer',
    ]);
  });

  it('announces new-tab links with visually hidden text', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem href="/docs" label="Docs" target="_blank" />
      </TopNav>,
    );

    expect(
      screen.getByRole('link', {name: 'Docs (opens in new tab)'}),
    ).toBeInTheDocument();
  });

  it('folds the new-tab hint into aria-label for icon-only items', () => {
    render(
      <TopNav label="Nav">
        <TopNavItem
          href="/docs"
          icon={Search}
          isIconOnly
          label="Docs"
          target="_blank"
        />
      </TopNav>,
    );

    expect(
      screen.getByRole('link', {name: 'Docs (opens in new tab)'}),
    ).toHaveAttribute('aria-label', 'Docs (opens in new tab)');
  });

  it('forwards ref to the button when no href is provided', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();
    render(
      <TopNav label="Nav">
        <TopNavItem label="Action" onClick={() => {}} ref={ref} />
      </TopNav>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLButtonElement));
  });
});

describe('TopNavHeading', () => {
  it('renders as a div when no href is provided', () => {
    render(<TopNavHeading data-testid="heading" heading="App" />);

    const heading = screen.getByTestId('heading');
    expect(heading.tagName).toBe('DIV');
  });

  it('renders as a link when headingHref is provided', () => {
    render(<TopNavHeading heading="App" headingHref="/" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/');
  });

  it('renders as a link when href is provided', () => {
    render(<TopNavHeading heading="App" href="/home" />);

    expect(screen.getByRole('link')).toHaveAttribute('href', '/home');
  });

  it('prefers headingHref over href', () => {
    render(
      <TopNavHeading heading="App" headingHref="/preferred" href="/fallback" />,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/preferred');
  });

  it('renders logo, superheading, heading, and subheading', () => {
    render(
      <TopNavHeading
        data-testid="heading"
        heading="Silver UI"
        logo={<span data-testid="logo">Logo</span>}
        subheading="v2.0"
        superheading="Acme Corp"
      />,
    );

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Silver UI')).toBeInTheDocument();
    expect(screen.getByText('v2.0')).toBeInTheDocument();
  });

  it('renders headerEndContent', () => {
    render(
      <TopNavHeading
        headerEndContent={<span data-testid="end">Beta</span>}
        heading="App"
      />,
    );

    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('applies aria-label to the heading element', () => {
    render(
      <TopNavHeading
        aria-label="Home"
        data-testid="heading"
        headingHref="/"
        logo={<span>Logo</span>}
      />,
    );

    expect(screen.getByTestId('heading')).toHaveAttribute('aria-label', 'Home');
  });

  it('forwards ref to the div when no href is provided', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();
    render(<TopNavHeading heading="App" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards ref to the anchor when href is provided', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();
    render(<TopNavHeading heading="App" href="/home" ref={ref} />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });
});

describe('TopNav drawer mode', () => {
  it('renders start and center content in the drawer', () => {
    render(
      <TopNavRenderContext value="drawer">
        <TopNav
          centerContent={<TopNavItem href="/center" label="Center" />}
          label="Nav">
          <TopNavItem href="/start" label="Start" />
        </TopNav>
      </TopNavRenderContext>,
    );

    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
  });

  it('renders mobile content from context', () => {
    render(
      <TopNavRenderContext value="drawer">
        <TopNavMobileContentContext
          value={<div data-testid="mobile">Mobile</div>}>
          <TopNav label="Nav">
            <TopNavItem href="/home" label="Home" />
          </TopNav>
        </TopNavMobileContentContext>
      </TopNavRenderContext>,
    );

    expect(screen.getByTestId('mobile')).toBeInTheDocument();
  });

  it('returns null in drawer mode when there is no collapsible or mobile content', () => {
    const {container} = render(
      <TopNavRenderContext value="drawer">
        <TopNav
          endContent={<button type="button">Action</button>}
          label="Nav"
        />
      </TopNavRenderContext>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders a divider between collapsible content and mobile content', () => {
    render(
      <TopNavRenderContext value="drawer">
        <TopNavMobileContentContext value={<div>Mobile</div>}>
          <TopNav data-testid="nav" label="Nav">
            <TopNavItem href="/home" label="Home" />
          </TopNav>
        </TopNavMobileContentContext>
      </TopNavRenderContext>,
    );

    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
  });

  it('does not render a divider when there is only mobile content', () => {
    render(
      <TopNavRenderContext value="drawer">
        <TopNavMobileContentContext value={<div>Mobile</div>}>
          <TopNav label="Nav" />
        </TopNavMobileContentContext>
      </TopNavRenderContext>,
    );

    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });
});

describe('TopNavItem onClick', () => {
  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <TopNav label="Nav">
        <TopNavItem href="/home" label="Home" onClick={onClick} />
      </TopNav>,
    );

    await user.click(screen.getByRole('link', {name: 'Home'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('calls closeMobileNav and onClick in drawer mode', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const closeMobileNav = vi.fn();
    const mobileContext: AppShellMobileContextValue = {
      closeMobileNav,
      hasAutoToggle: true,
      isMobile: true,
      isMobileNavEnabled: true,
      isMobileNavOpen: false,
      openMobileNav: vi.fn(),
      toggleMobileNav: vi.fn(),
    };

    render(
      <AppShellMobileContext value={mobileContext}>
        <TopNavRenderContext value="drawer">
          <TopNav label="Nav">
            <TopNavItem href="/home" label="Home" onClick={onClick} />
          </TopNav>
        </TopNavRenderContext>
      </AppShellMobileContext>,
    );

    await user.click(screen.getByRole('link', {name: 'Home', hidden: true}));
    expect(onClick).toHaveBeenCalledOnce();
    expect(closeMobileNav).toHaveBeenCalledOnce();
  });

  it('does not call onClick or closeMobileNav when disabled', () => {
    const onClick = vi.fn();
    const closeMobileNav = vi.fn();
    const mobileContext: AppShellMobileContextValue = {
      closeMobileNav,
      hasAutoToggle: true,
      isMobile: true,
      isMobileNavEnabled: true,
      isMobileNavOpen: false,
      openMobileNav: vi.fn(),
      toggleMobileNav: vi.fn(),
    };

    render(
      <AppShellMobileContext value={mobileContext}>
        <TopNavRenderContext value="drawer">
          <TopNav label="Nav">
            <TopNavItem
              href="/admin"
              isDisabled
              label="Admin"
              onClick={onClick}
            />
          </TopNav>
        </TopNavRenderContext>
      </AppShellMobileContext>,
    );

    const link = screen.getByRole('link', {name: 'Admin', hidden: true});
    link.click();
    expect(onClick).not.toHaveBeenCalled();
    expect(closeMobileNav).not.toHaveBeenCalled();
  });
});
