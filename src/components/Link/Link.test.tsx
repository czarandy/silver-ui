import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef, MouseEvent, ReactNode, Ref} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Link} from 'components/Link/Link';
import {LinkProvider} from 'components/Link/LinkProvider';

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

function AnotherLink({
  children,
  ref,
  ...props
}: ComponentPropsWithRef<'a'>): React.JSX.Element {
  return (
    <a data-another-link ref={ref} {...props}>
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

describe('Link', () => {
  it('renders children as link text', () => {
    render(<Link href="/test">Click me</Link>);
    expect(screen.getByRole('link', {name: 'Click me'})).toBeInTheDocument();
  });

  it('renders with href attribute', () => {
    render(<Link href="/destination">Link</Link>);
    expect(screen.getByRole('link')).toHaveAttribute('href', '/destination');
  });

  it('uses a fallback href when href is omitted', () => {
    render(<Link>Action Link</Link>);

    expect(screen.getByRole('link', {name: 'Action Link'})).toHaveAttribute(
      'href',
      '#',
    );
  });

  it('prevents fallback hash navigation while still handling clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => {
      expect(event.defaultPrevented).toBe(true);
    });

    render(<Link onClick={onClick}>Action Link</Link>);

    await user.click(screen.getByRole('link', {name: 'Action Link'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards data-testid to the root element', () => {
    render(
      <Link data-testid="docs-link" href="/docs">
        Docs
      </Link>,
    );
    expect(screen.getByTestId('docs-link')).toHaveAttribute('href', '/docs');
  });

  it('uses label as an accessible override', () => {
    render(
      <Link href="/home" label="Home">
        <span aria-hidden="true">Icon</span>
      </Link>,
    );

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'aria-label',
      'Home',
    );
  });

  it('renders color variants and underline styles', () => {
    const {rerender} = render(
      <Link color="active" hasUnderline href="/test">
        Active
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Active'})).toBeInTheDocument();

    rerender(
      <Link color="secondary" href="/test">
        Secondary
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Secondary'})).toBeInTheDocument();

    rerender(
      <Link color="inherit" href="/test">
        Inherit
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Inherit'})).toBeInTheDocument();
  });

  it('renders weight variants', () => {
    const {rerender} = render(
      <Link href="/test" weight="bold">
        Bold
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Bold'})).toBeInTheDocument();

    rerender(
      <Link href="/test" weight="semibold">
        Semibold
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Semibold'})).toBeInTheDocument();

    rerender(
      <Link href="/test" weight="medium">
        Medium
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Medium'})).toBeInTheDocument();

    rerender(
      <Link href="/test" weight="normal">
        Normal
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Normal'})).toBeInTheDocument();

    rerender(
      <Link href="/test" weight="inherit">
        Inherit Weight
      </Link>,
    );
    expect(
      screen.getByRole('link', {name: 'Inherit Weight'}),
    ).toBeInTheDocument();
  });

  it('renders size variants', () => {
    const {rerender} = render(
      <Link href="/test" size="sm">
        Small
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Small'})).toBeInTheDocument();

    rerender(
      <Link href="/test" size="lg">
        Large
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Large'})).toBeInTheDocument();

    rerender(
      <Link href="/test" size="xl">
        Extra Large
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Extra Large'})).toBeInTheDocument();

    rerender(
      <Link href="/test" size="inherit">
        Inherit Size
      </Link>,
    );
    expect(
      screen.getByRole('link', {name: 'Inherit Size'}),
    ).toBeInTheDocument();
  });

  it('supports disabled links', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Link href="/test" isDisabled onClick={onClick}>
        Disabled Link
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Disabled Link'});
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('tabIndex', '-1');

    await user.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders external link attributes and keeps visible text in the accessible name', () => {
    render(
      <Link href="https://example.com" isExternalLink rel="sponsored">
        External Link
      </Link>,
    );

    const link = screen.getByRole('link', {
      name: 'External Link (opens in new tab)',
    });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
  });

  it('allows target to override the external link default target', () => {
    render(
      <Link href="https://example.com" isExternalLink target="_self">
        External Link
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'External Link'});
    expect(link).toHaveAttribute('target', '_self');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('adds noopener noreferrer when target="_blank" without isExternalLink', () => {
    render(
      <Link href="https://example.com" target="_blank">
        Blank Target
      </Link>,
    );

    const link = screen.getByRole('link', {
      name: 'Blank Target (opens in new tab)',
    });
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('passes through rel without external link or target blank behavior', () => {
    render(
      <Link href="https://example.com" rel="author">
        Author Link
      </Link>,
    );

    expect(screen.getByRole('link', {name: 'Author Link'})).toHaveAttribute(
      'rel',
      'author',
    );
  });

  it('handles click events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent) => {
      event.preventDefault();
    });

    render(
      <Link href="/test" onClick={onClick}>
        Click me
      </Link>,
    );

    await user.click(screen.getByRole('link', {name: 'Click me'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('forwards ref', () => {
    const ref = vi.fn<(element: HTMLAnchorElement | null) => void>();

    render(
      <Link href="/test" ref={ref}>
        Test
      </Link>,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLAnchorElement));
  });

  it('renders tooltip content', () => {
    render(
      <Link href="/settings" tooltip="Configure settings">
        Settings
      </Link>,
    );

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Configure settings',
    );
  });

  it('renders tooltip content for disabled links', () => {
    render(
      <Link href="/settings" isDisabled tooltip="Reason disabled">
        Settings
      </Link>,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Reason disabled',
    );
  });

  it('renders custom component when as is provided', () => {
    render(
      <Link as={CustomLink} href="/custom">
        Custom Link
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Custom Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/custom');
  });

  it('renders custom component from LinkProvider', () => {
    render(
      <LinkProvider component={CustomLink}>
        <Link href="/provider">Provider Link</Link>
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Provider Link'})).toHaveAttribute(
      'data-custom-link',
    );
  });

  it('as prop overrides LinkProvider', () => {
    render(
      <LinkProvider component={AnotherLink}>
        <Link as={CustomLink} href="/override">
          Override Link
        </Link>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Override Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });

  it('passes through ARIA attributes to the rendered element', () => {
    render(
      <Link
        aria-controls="menu-1"
        aria-current="page"
        aria-describedby="desc-1"
        aria-expanded={true}
        aria-haspopup="menu"
        href="/nav">
        Nav
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Nav'});
    expect(link).toHaveAttribute('aria-controls', 'menu-1');
    expect(link).toHaveAttribute('aria-current', 'page');
    expect(link).toHaveAttribute('aria-describedby', 'desc-1');
    expect(link).toHaveAttribute('aria-expanded', 'true');
    expect(link).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('applies custom className', () => {
    render(
      <Link className="custom-class" href="/test">
        Test
      </Link>,
    );

    expect(screen.getByRole('link')).toHaveClass('custom-class');
  });

  it('applies custom style', () => {
    render(
      <Link href="/test" style={{color: 'red'}}>
        Test
      </Link>,
    );

    expect(screen.getByRole('link')).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });

  it('does not navigate on Enter when disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Link href="/test" isDisabled onClick={onClick}>
        Disabled
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Disabled'});
    link.focus();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps color disabled links interactive', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Link color="disabled" href="/test" onClick={onClick}>
        Disabled Color
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Disabled Color'});
    expect(link).not.toHaveAttribute('aria-disabled');
    expect(link).not.toHaveAttribute('tabIndex');

    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders external link icon', () => {
    render(
      <Link href="https://example.com" isExternalLink>
        Docs
      </Link>,
    );

    const link = screen.getByRole('link');
    // eslint-disable-next-line testing-library/no-node-access -- no testing-library query for SVG icons
    expect(link.querySelector('svg')).toBeInTheDocument();
  });

  it('sets aria-label with opens in new tab for external links', () => {
    render(
      <Link href="https://example.com" isExternalLink label="Docs">
        Docs
      </Link>,
    );

    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Docs (opens in new tab)',
    );
  });

  it('uses hidden suffix text instead of aria-label without label for external links', () => {
    render(
      <Link href="https://example.com" isExternalLink>
        Docs
      </Link>,
    );

    const link = screen.getByRole('link', {
      name: 'Docs (opens in new tab)',
    });
    expect(link).not.toHaveAttribute('aria-label');
  });

  it('passes href and to to custom link components for router compatibility', () => {
    render(
      <Link as={ToBasedRouterLink} href="/custom">
        Router Link
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'Router Link'});
    expect(link).toHaveAttribute('href', '/custom');
    expect(link).toHaveAttribute('data-to', '/custom');
  });

  it('passes fallback href and to to custom link components', () => {
    render(<Link as={ToBasedRouterLink}>Router Action</Link>);

    const link = screen.getByRole('link', {name: 'Router Action'});
    expect(link).toHaveAttribute('href', '#');
    expect(link).toHaveAttribute('data-to', '#');
  });
});

describe('useLinkComponent', () => {
  it('returns native anchor by default', () => {
    render(<Link href="/test">Default</Link>);

    const link = screen.getByRole('link', {name: 'Default'});
    expect(link).toHaveAttribute('href', '/test');
    expect(link).not.toHaveAttribute('to');
  });

  it('passes href and to equal to href for provider custom components', () => {
    render(
      <LinkProvider component={ToBasedRouterLink}>
        <Link href="/test">Router Link</Link>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Router Link'});
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/test');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('nested providers use the nearest component', () => {
    render(
      <LinkProvider component={AnotherLink}>
        <LinkProvider component={CustomLink}>
          <Link href="/test">Nested</Link>
        </LinkProvider>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Nested'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});
