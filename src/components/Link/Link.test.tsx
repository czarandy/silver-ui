import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef, MouseEvent, ReactNode, Ref} from 'react';
import {createElement} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Link} from './Link';
import {LinkProvider} from './LinkProvider';
import type {LinkComponent, LinkComponentProps} from './types';
import {useLinkComponent} from './useLinkComponent';

function CustomLink({
  children,
  ref,
  ...props
}: ComponentPropsWithRef<'a'>): React.JSX.Element {
  return (
    <a ref={ref} data-custom-link {...props}>
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
    <a ref={ref} data-another-link {...props}>
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
    <a ref={ref} href={to} data-router-link data-to={to} {...props}>
      {children}
    </a>
  );
}

function TestConsumer({as}: {as?: LinkComponent}): React.JSX.Element {
  const LinkComponent = useLinkComponent(as);
  const props: LinkComponentProps & {'data-testid': string} = {
    href: '/test',
    'data-testid': 'resolved-link',
  };

  return createElement(LinkComponent, props, 'Link');
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

  it('uses label as an accessible override', () => {
    render(
      <Link label="Home" href="/home">
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
      <Link href="/test" color="active" hasUnderline>
        Active
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Active'})).toBeInTheDocument();

    rerender(
      <Link href="/test" color="secondary">
        Secondary
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Secondary'})).toBeInTheDocument();

    rerender(
      <Link href="/test" color="inherit">
        Inherit
      </Link>,
    );
    expect(screen.getByRole('link', {name: 'Inherit'})).toBeInTheDocument();
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

  it('renders external link attributes and icon text', () => {
    render(
      <Link href="https://example.com" isExternalLink rel="sponsored">
        External Link
      </Link>,
    );

    const link = screen.getByRole('link', {name: 'External Link'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'sponsored noopener noreferrer');
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

  it('passes tooltip through as title until tooltip primitive exists', () => {
    render(
      <Link href="/settings" tooltip="Configure settings">
        Settings
      </Link>,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'title',
      'Configure settings',
    );
  });

  it('renders custom component when as is provided', () => {
    render(
      <Link href="/custom" as={CustomLink}>
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
        <Link href="/override" as={CustomLink}>
          Override Link
        </Link>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Override Link'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});

describe('useLinkComponent', () => {
  it('returns native anchor by default', () => {
    render(<TestConsumer />);

    expect(screen.getByTestId('resolved-link')).toHaveAttribute(
      'href',
      '/test',
    );
    expect(screen.getByTestId('resolved-link')).not.toHaveAttribute('to');
  });

  it('passes to equal to href for custom components', () => {
    render(
      <LinkProvider component={ToBasedRouterLink}>
        <TestConsumer />
      </LinkProvider>,
    );

    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/test');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('nested providers use the nearest component', () => {
    render(
      <LinkProvider component={AnotherLink}>
        <LinkProvider component={CustomLink}>
          <TestConsumer />
        </LinkProvider>
      </LinkProvider>,
    );

    const link = screen.getByTestId('resolved-link');
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).not.toHaveAttribute('data-another-link');
  });
});
