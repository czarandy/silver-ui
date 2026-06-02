import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Home} from 'lucide-react';
import type {ComponentPropsWithRef, ReactNode, Ref} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {LinkProvider} from '../Link';
import {SideNav} from './SideNav';
import {SideNavHeading} from './SideNavHeading';
import {SideNavItem} from './SideNavItem';
import {SideNavSection} from './SideNavSection';

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

describe('SideNavItem', () => {
  it('renders as a button when no href is provided', () => {
    render(
      <SideNav>
        <SideNavItem icon={Home} label="Action" onClick={() => {}} />
      </SideNav>,
    );

    expect(screen.getByRole('button', {name: 'Action'})).toBeInTheDocument();
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

    expect(
      screen.getByRole('button', {name: 'Collapse sidebar'}),
    ).toBeInTheDocument();
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
