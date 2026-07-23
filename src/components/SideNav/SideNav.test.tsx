import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Home} from 'lucide-react';
import type {ComponentPropsWithRef, ReactNode, Ref} from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {LinkProvider} from 'components/Link';
import {SideNav} from 'components/SideNav/SideNav';
import {SideNavRenderContext} from 'components/SideNav/SideNavContext';
import {SideNavHeading} from 'components/SideNav/SideNavHeading';
import {SideNavItem} from 'components/SideNav/SideNavItem';
import {SideNavSection} from 'components/SideNav/SideNavSection';
import {assertNonNull} from 'internal/testHelpers';

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

beforeEach(() => {
  vi.stubGlobal('matchMedia', createMatchMedia(false));
});

function CustomLink({
  children,
  ref,
  ...props
}: ComponentPropsWithRef<'a'>): React.JSX.Element {
  return (
    <a data-custom-link ref={ref} {...props}>
      {children}
    </a>
  );
}

function ToBasedRouterLink({
  to,
  children,
  ref,
  ...props
}: {
  to?: string;
  href?: string;
  children?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}): React.JSX.Element {
  return (
    <a data-router-link data-to={to} href={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

// The sticky bottom wrapper carries no role or testid, so reach it through the
// footer element it wraps.
function countStickyBottomChildren(footer: HTMLElement): number {
  return assertNonNull(footer.parentElement).childElementCount;
}

describe('SideNav', () => {
  it('renders a navigation landmark with sections and items', () => {
    render(
      <SideNav header={<SideNavHeading heading="Silver" />}>
        <SideNavSection title="Main">
          <SideNavItem href="/home" icon={Home} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    expect(
      screen.getByRole('navigation', {name: 'Side navigation'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'href',
      '/home',
    );
  });

  it('marks selected items with aria-current', () => {
    render(
      <SideNav>
        <SideNavItem href="/home" icon={Home} isSelected label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('renders footer and footerIcons', () => {
    render(
      <SideNav
        footer={<span data-testid="footer-content">Footer</span>}
        footerIcons={<span data-testid="footer-icons">Icons</span>}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
  });

  it('omits the footer row when there is nothing to put in it', () => {
    render(
      <SideNav footer={<span data-testid="footer-content">Footer</span>}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    // An empty footer row would still be a flex item of the sticky bottom, so
    // its gap would reserve dead space below the footer and push it off-center.
    expect(
      countStickyBottomChildren(screen.getByTestId('footer-content')),
    ).toBe(1);
  });

  it('keeps the collapse control out of the footer', () => {
    render(
      <SideNav
        footer={<span data-testid="footer-content">Footer</span>}
        isCollapsible>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(
      countStickyBottomChildren(screen.getByTestId('footer-content')),
    ).toBe(1);
    expect(
      screen.getByRole('button', {name: 'Collapse sidebar'}),
    ).toBeInTheDocument();
  });

  it('moves the expand control above the footer when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <SideNav
        footer={<span data-testid="footer-content">Footer</span>}
        isCollapsible>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    const footer = screen.getByTestId('footer-content');
    const expandButton = screen.getByRole('button', {name: 'Expand sidebar'});
    // eslint-disable-next-line testing-library/no-node-access -- verifying the collapsed control's placement relative to the internal footer wrapper
    expect(footer.parentElement?.previousElementSibling).toContainElement(
      expandButton,
    );
  });

  it('renders the footer row alongside the footer when footerIcons are given', () => {
    render(
      <SideNav
        footer={<span data-testid="footer-content">Footer</span>}
        footerIcons={<span data-testid="footer-icons">Icons</span>}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(
      countStickyBottomChildren(screen.getByTestId('footer-content')),
    ).toBe(2);
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
  });

  it('renders topContent below the header', () => {
    render(
      <SideNav
        header={<SideNavHeading heading="Silver" />}
        topContent={<span data-testid="top-content">Search</span>}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByTestId('top-content')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();
    render(
      <SideNav
        className="custom-nav"
        data-testid="side-nav"
        ref={ref}
        style={{width: 300}}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    const nav = screen.getByTestId('side-nav');
    expect(nav).toHaveClass('custom-nav');
    expect(nav).toHaveStyle({width: '300px'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

describe('SideNav render modes', () => {
  it('renders a non-landmark topbar in topbar render mode', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();
    render(
      <SideNavRenderContext value="topbar">
        <SideNav
          data-testid="side-nav"
          footerIcons={<span data-testid="footer-icons">Icons</span>}
          header={<span data-testid="topbar-header">Brand</span>}
          ref={ref}>
          <SideNavItem href="/home" icon={Home} label="Home" />
        </SideNav>
      </SideNavRenderContext>,
    );

    // Topbar renders a plain div with only the header and footer icons; it is
    // not a navigation landmark and omits the scrollable item list.
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByTestId('side-nav').tagName).toBe('DIV');
    expect(screen.getByTestId('topbar-header')).toBeInTheDocument();
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
    expect(screen.queryByRole('link', {name: 'Home'})).not.toBeInTheDocument();
    expect(ref).toHaveBeenCalledWith(screen.getByTestId('side-nav'));
  });

  it('renders content inside a drawer in drawer render mode', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();
    render(
      <SideNavRenderContext value="drawer">
        <SideNav
          data-testid="side-nav"
          footer={<span data-testid="footer-content">Footer</span>}
          footerIcons={<span data-testid="footer-icons">Icons</span>}
          header={<span data-testid="drawer-header">Brand</span>}
          ref={ref}
          topContent={<span data-testid="top-content">Search</span>}>
          <SideNavItem
            data-testid="home-item"
            href="/home"
            icon={Home}
            label="Home"
          />
        </SideNav>
      </SideNavRenderContext>,
    );

    // Drawer mode wraps the nav content in MobileNav's dialog rather than a
    // nav landmark, forwarding header, topContent, children, and footers.
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByTestId('side-nav').tagName).toBe('DIALOG');
    expect(screen.getByTestId('drawer-header')).toBeInTheDocument();
    expect(screen.getByTestId('top-content')).toBeInTheDocument();
    expect(screen.getByTestId('home-item')).toBeInTheDocument();
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
    // ref is forwarded to the underlying drawer dialog.
    expect(ref).toHaveBeenCalledWith(screen.getByTestId('side-nav'));
  });

  it('renders bare content in drawer-content render mode', () => {
    render(
      <SideNavRenderContext value="drawer-content">
        <SideNav
          footer={<span data-testid="footer-content">Footer</span>}
          footerIcons={<span data-testid="footer-icons">Icons</span>}
          topContent={<span data-testid="top-content">Search</span>}>
          <SideNavItem
            data-testid="home-item"
            href="/home"
            icon={Home}
            label="Home"
          />
        </SideNav>
      </SideNavRenderContext>,
    );

    // drawer-content renders a bare fragment: no nav landmark and no drawer
    // dialog, just the forwarded content.
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('top-content')).toBeInTheDocument();
    expect(screen.getByTestId('home-item')).toBeInTheDocument();
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
    expect(screen.getByTestId('footer-icons')).toBeInTheDocument();
  });
});

describe('SideNavItem', () => {
  it('renders as a button when no href is provided', () => {
    render(
      <SideNav>
        <SideNavItem icon={Home} label="Action" onClick={() => {}} />
      </SideNav>,
    );

    expect(screen.getByRole('button', {name: 'Action'}).tagName).toBe('BUTTON');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('calls onClick when clicked as a button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <SideNav>
        <SideNavItem icon={Home} label="Action" onClick={onClick} />
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Action'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('disables button with disabled attribute when isDisabled', () => {
    render(
      <SideNav>
        <SideNavItem
          icon={Home}
          isDisabled
          label="Disabled"
          onClick={() => {}}
        />
      </SideNav>,
    );

    expect(screen.getByRole('button', {name: 'Disabled'})).toBeDisabled();
  });

  it('falls back to button when link item is disabled', () => {
    render(
      <SideNav>
        <SideNavItem
          href="/home"
          icon={Home}
          isDisabled
          label="Disabled Link"
        />
      </SideNav>,
    );

    expect(screen.getByRole('button', {name: 'Disabled Link'})).toBeDisabled();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <SideNav>
        <SideNavItem
          endContent={<span data-testid="badge">3</span>}
          href="/inbox"
          icon={Home}
          label="Inbox"
        />
      </SideNav>,
    );

    expect(screen.getByTestId('badge')).toBeInTheDocument();
  });

  it('renders nested children below the item', () => {
    render(
      <SideNav>
        <SideNavItem icon={Home} label="Settings">
          <SideNavItem href="/general" label="General" />
          <SideNavItem href="/security" label="Security" />
        </SideNavItem>
      </SideNav>,
    );

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();
    render(
      <SideNav>
        <SideNavItem
          className="custom-item"
          data-testid="nav-item"
          icon={Home}
          label="Home"
          ref={ref}
          style={{color: 'red'}}
        />
      </SideNav>,
    );

    const item = screen.getByTestId('nav-item');
    expect(item).toHaveClass('custom-item');
    expect(item).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards ref as div when href is provided', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();
    render(
      <SideNav>
        <SideNavItem href="/home" icon={Home} label="Home" ref={ref} />
      </SideNav>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('uses custom link component via as prop', () => {
    render(
      <SideNav>
        <SideNavItem as={CustomLink} href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('passes href and to to router link components', () => {
    render(
      <SideNav>
        <SideNavItem
          as={ToBasedRouterLink}
          href="/home"
          icon={Home}
          label="Home"
        />
      </SideNav>,
    );

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('href', '/home');
    expect(link).toHaveAttribute('data-to', '/home');
  });

  it('uses LinkProvider component for link items', () => {
    render(
      <LinkProvider component={CustomLink}>
        <SideNav>
          <SideNavItem href="/home" icon={Home} label="Home" />
        </SideNav>
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('as prop overrides LinkProvider', () => {
    function ProviderLink({
      children,
      ref,
      ...props
    }: ComponentPropsWithRef<'a'>): React.JSX.Element {
      return (
        <a data-provider-link ref={ref} {...props}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={ProviderLink}>
        <SideNav>
          <SideNavItem as={CustomLink} href="/home" icon={Home} label="Home" />
        </SideNav>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-provider-link');
  });
});

describe('SideNavSection', () => {
  it('renders with role="group" and aria-labelledby', () => {
    render(
      <SideNav>
        <SideNavSection title="Main">
          <SideNavItem icon={Home} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    const group = screen.getByRole('group', {name: 'Main'});
    expect(group).toBeInTheDocument();
  });

  it('visually hides header when isHeaderHidden is true', () => {
    render(
      <SideNav>
        <SideNavSection isHeaderHidden title="Hidden Section">
          <SideNavItem icon={Home} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    const group = screen.getByRole('group', {name: 'Hidden Section'});
    expect(group).toBeInTheDocument();
    expect(screen.getByText('Hidden Section')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(
      <SideNav>
        <SideNavSection subtitle="Personal files" title="Documents">
          <SideNavItem icon={Home} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    expect(screen.getByText('Personal files')).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <SideNav>
        <SideNavSection
          endContent={
            <button data-testid="add-btn" type="button">
              Add
            </button>
          }
          title="Projects">
          <SideNavItem icon={Home} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    expect(screen.getByTestId('add-btn')).toBeInTheDocument();
  });

  it('applies className, style, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();
    render(
      <SideNav>
        <SideNavSection
          className="custom-section"
          data-testid="section"
          ref={ref}
          style={{padding: 8}}
          title="Main">
          <SideNavItem icon={Home} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    const section = screen.getByTestId('section');
    expect(section).toHaveClass('custom-section');
    expect(section).toHaveStyle({padding: '8px'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('SideNavHeading', () => {
  it('renders heading text', () => {
    render(
      <SideNav header={<SideNavHeading heading="Silver" />}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByText('Silver')).toBeInTheDocument();
  });

  it('renders subheading', () => {
    render(
      <SideNav
        header={<SideNavHeading heading="Silver" subheading="Workspace" />}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByText('Workspace')).toBeInTheDocument();
  });

  it('renders superheading', () => {
    render(
      <SideNav
        header={<SideNavHeading heading="Silver" superheading="Acme Corp" />}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('renders logo', () => {
    render(
      <SideNav
        header={
          <SideNavHeading
            heading="Silver"
            logo={<span data-testid="logo">S</span>}
          />
        }>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders as a link when headingHref is provided', () => {
    render(
      <SideNav
        header={<SideNavHeading heading="Silver" headingHref="/dashboard" />}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: /Silver/})).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('renders as a link when href is provided', () => {
    render(
      <SideNav header={<SideNavHeading heading="Silver" href="/dashboard" />}>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: /Silver/})).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('headingHref takes priority over href', () => {
    render(
      <SideNav
        header={
          <SideNavHeading
            heading="Silver"
            headingHref="/primary"
            href="/fallback"
          />
        }>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: /Silver/})).toHaveAttribute(
      'href',
      '/primary',
    );
  });

  it('renders headerEndContent', () => {
    render(
      <SideNav
        header={
          <SideNavHeading
            headerEndContent={<span data-testid="end">End</span>}
            heading="Silver"
          />
        }>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('uses custom link component via as prop', () => {
    render(
      <SideNav
        header={
          <SideNavHeading
            as={CustomLink}
            heading="Silver"
            headingHref="/home"
          />
        }>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: /Silver/})).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('uses LinkProvider component', () => {
    render(
      <LinkProvider component={CustomLink}>
        <SideNav
          header={<SideNavHeading heading="Silver" headingHref="/home" />}>
          <SideNavItem icon={Home} label="Home" />
        </SideNav>
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: /Silver/})).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('applies className, style, data-testid, and ref', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();
    render(
      <SideNav
        header={
          <SideNavHeading
            className="custom-heading"
            data-testid="heading"
            heading="Silver"
            ref={ref}
            style={{gap: 12}}
          />
        }>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    const heading = screen.getByTestId('heading');
    expect(heading).toHaveClass('custom-heading');
    expect(heading).toHaveStyle({gap: '12px'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('SideNav collapsed state', () => {
  it('starts collapsed at the default lg breakpoint', () => {
    const matchMedia = createMatchMedia(true);
    vi.stubGlobal('matchMedia', matchMedia);

    render(
      <SideNav isCollapsible>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    expect(matchMedia).toHaveBeenCalledExactlyOnceWith('(max-width: 1024px)');
    expect(screen.getByRole('link', {name: 'Home'})).not.toHaveTextContent(
      'Home',
    );
    expect(
      screen.getByRole('button', {name: 'Expand sidebar'}),
    ).toBeInTheDocument();
  });

  it.each([
    ['sm', 640],
    ['md', 768],
  ] as const)(
    'supports the %s initial collapse breakpoint',
    (collapseBreakpoint, width) => {
      const matchMedia = createMatchMedia(true);
      vi.stubGlobal('matchMedia', matchMedia);

      render(
        <SideNav collapseBreakpoint={collapseBreakpoint} isCollapsible>
          <SideNavItem icon={Home} label="Home" />
        </SideNav>,
      );

      expect(matchMedia).toHaveBeenCalledWith(`(max-width: ${width}px)`);
      expect(
        screen.getByRole('button', {name: 'Expand sidebar'}),
      ).toBeInTheDocument();
    },
  );

  it('starts expanded when responsive collapsing is disabled', () => {
    const matchMedia = createMatchMedia(true);
    vi.stubGlobal('matchMedia', matchMedia);

    render(
      <SideNav collapseBreakpoint="none" isCollapsible>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    expect(matchMedia).not.toHaveBeenCalled();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveTextContent('Home');
    expect(
      screen.getByRole('button', {name: 'Collapse sidebar'}),
    ).toBeInTheDocument();
  });

  it('does not apply responsive collapsing when isCollapsible is false', () => {
    const matchMedia = createMatchMedia(true);
    vi.stubGlobal('matchMedia', matchMedia);

    render(
      <SideNav>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    expect(matchMedia).not.toHaveBeenCalled();
    expect(screen.getByRole('link', {name: 'Home'})).toHaveTextContent('Home');
  });

  it('evaluates the responsive breakpoint only once', () => {
    const matchMedia = createMatchMedia(true);
    vi.stubGlobal('matchMedia', matchMedia);

    const {rerender} = render(
      <SideNav collapseBreakpoint="sm" isCollapsible>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    rerender(
      <SideNav collapseBreakpoint="md" isCollapsible>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    expect(matchMedia).toHaveBeenCalledExactlyOnceWith('(max-width: 640px)');
    expect(
      screen.getByRole('button', {name: 'Expand sidebar'}),
    ).toBeInTheDocument();
  });

  it('expands an initially collapsed responsive nav via the built-in toggle', async () => {
    const user = userEvent.setup();
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    render(
      <SideNav isCollapsible>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Expand sidebar'}));

    expect(screen.getByRole('link', {name: 'Home'})).toHaveTextContent('Home');
    expect(
      screen.getByRole('button', {name: 'Collapse sidebar'}),
    ).toBeInTheDocument();
  });

  it('resolves to expanded when isCollapsible is disabled', () => {
    vi.stubGlobal('matchMedia', createMatchMedia(true));

    const {rerender} = render(
      <SideNav isCollapsible>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    expect(
      screen.getByRole('button', {name: 'Expand sidebar'}),
    ).toBeInTheDocument();

    rerender(
      <SideNav>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveTextContent('Home');
    expect(
      screen.queryByRole('button', {name: /sidebar/}),
    ).not.toBeInTheDocument();
  });

  it('hides label text and shows aria-label when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <SideNav isCollapsible>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).toHaveAttribute('aria-label', 'Home');
    expect(link).not.toHaveTextContent('Home');
  });

  it('does not set aria-label when expanded', () => {
    render(
      <SideNav isCollapsible>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    const link = screen.getByRole('link', {name: 'Home'});
    expect(link).not.toHaveAttribute('aria-label');
    expect(link).toHaveTextContent('Home');
  });

  it('hides endContent when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <SideNav isCollapsible>
        <SideNavItem
          endContent={<span data-testid="badge">3</span>}
          href="/inbox"
          icon={Home}
          label="Inbox"
        />
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
  });

  it('visually hides section headers when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <SideNav isCollapsible>
        <SideNavSection title="Main">
          <SideNavItem icon={Home} label="Home" />
        </SideNavSection>
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    const group = screen.getByRole('group', {name: 'Main'});
    expect(group).toBeInTheDocument();
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('hides heading text and headerEndContent when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <SideNav
        header={
          <SideNavHeading
            headerEndContent={<span data-testid="end">End</span>}
            heading="Silver"
            logo={<span data-testid="logo">S</span>}
            subheading="Workspace"
          />
        }
        isCollapsible>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    expect(screen.getByTestId('logo')).toBeInTheDocument();
    expect(screen.queryByText('Silver')).not.toBeInTheDocument();
    expect(screen.queryByText('Workspace')).not.toBeInTheDocument();
    expect(screen.queryByTestId('end')).not.toBeInTheDocument();
  });

  it('adds aria-label to heading link when collapsed', async () => {
    const user = userEvent.setup();
    render(
      <SideNav
        header={
          <SideNavHeading
            heading="Silver"
            headingHref="/home"
            logo={<span data-testid="logo">S</span>}
          />
        }
        isCollapsible>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    const link = screen.getByRole('link', {name: /Silver/});
    expect(link).not.toHaveAttribute('aria-label');

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    expect(link).toHaveAttribute('aria-label', 'Silver');
  });

  it('renders built-in collapse button when isCollapsible', () => {
    render(
      <SideNav isCollapsible>
        <SideNavItem icon={Home} label="Home" />
      </SideNav>,
    );

    const collapseButton = screen.getByRole('button', {
      name: 'Collapse sidebar',
    });
    expect(collapseButton).toHaveClass(
      'silver-bg_transparent',
      'silver-bdr_component.sm',
    );
    expect(collapseButton).not.toHaveClass(
      'silver-bdr_full',
      'silver-bx-sh_sm',
    );
    // eslint-disable-next-line testing-library/no-node-access -- verifying the position class on the internal collapse-control wrapper
    const control = collapseButton.parentElement?.parentElement;
    expect(control).toHaveClass('silver-inset-e_2');
    expect(control).not.toHaveClass('silver-trf_translateX(50%)');
  });

  it('mirrors the built-in collapse and expand panel icons in RTL', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <SideNav isCollapsible>
          <SideNavItem href="/home" icon={Home} label="Home" />
        </SideNav>
      </div>,
    );

    const collapseButton = screen.getByRole('button', {
      name: 'Collapse sidebar',
    });
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    expect(collapseButton.querySelector('svg')).toHaveClass(
      'lucide-panel-left-close',
      'rtl:silver-trf_scaleX(-1)',
    );

    await user.click(collapseButton);

    const expandButton = screen.getByRole('button', {name: 'Expand sidebar'});
    // eslint-disable-next-line testing-library/no-node-access -- verifying the directional class on the rendered icon
    expect(expandButton.querySelector('svg')).toHaveClass(
      'lucide-panel-left-open',
      'rtl:silver-trf_scaleX(-1)',
    );
  });

  it('toggles via built-in collapse button', async () => {
    const user = userEvent.setup();
    render(
      <SideNav isCollapsible>
        <SideNavItem href="/home" icon={Home} label="Home" />
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveTextContent('Home');

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    const collapsedLink = screen.getByRole('link', {name: 'Home'});
    expect(collapsedLink).toHaveAttribute('aria-label', 'Home');
  });
});

describe('SideNavItem collapsible', () => {
  it('toggles children on click', async () => {
    const user = userEvent.setup();
    render(
      <SideNav>
        <SideNavItem icon={Home} isCollapsible label="Settings">
          <SideNavItem href="/general" label="General" />
        </SideNavItem>
      </SideNav>,
    );

    const toggle = screen.getByRole('button', {name: 'Settings'});
    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('starts collapsed when isDefaultExpanded is false', () => {
    render(
      <SideNav>
        <SideNavItem
          icon={Home}
          isCollapsible
          isDefaultExpanded={false}
          label="Settings">
          <SideNavItem href="/general" label="General" />
        </SideNavItem>
      </SideNav>,
    );

    expect(screen.getByRole('button', {name: 'Settings'})).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('renders split-action when collapsible with href', async () => {
    const user = userEvent.setup();
    render(
      <SideNav>
        <SideNavItem
          href="/settings"
          icon={Home}
          isCollapsible
          label="Settings">
          <SideNavItem href="/general" label="General" />
        </SideNavItem>
      </SideNav>,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'href',
      '/settings',
    );

    const chevron = screen.getByRole('button', {name: 'Collapse Settings'});
    expect(chevron).toHaveAttribute('aria-expanded', 'true');

    await user.click(chevron);

    expect(chevron).toHaveAttribute('aria-expanded', 'false');
  });

  it('hides children when sidebar is collapsed', async () => {
    const user = userEvent.setup();
    render(
      <SideNav isCollapsible>
        <SideNavItem icon={Home} isCollapsible label="Settings">
          <SideNavItem href="/general" label="General" />
        </SideNavItem>
      </SideNav>,
    );

    await user.click(screen.getByRole('button', {name: 'Collapse sidebar'}));

    expect(screen.queryByText('General')).not.toBeInTheDocument();
  });
});
