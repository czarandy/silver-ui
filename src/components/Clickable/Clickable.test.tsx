import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef, MouseEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Clickable} from 'components/Clickable/Clickable';
import {LinkProvider} from 'components/Link';

function RouterLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-router-link data-to={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

function ProviderLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-provider-link data-to={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

describe('Clickable', () => {
  it('renders an onClick action as a labeled button', () => {
    render(
      <Clickable label="Increment" onClick={() => {}}>
        <span>Count</span>
      </Clickable>,
    );

    const button = screen.getByRole('button', {name: 'Increment'});
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveTextContent('Count');
  });

  it('preserves the child appearance without a hover background overlay', () => {
    render(
      <Clickable label="Select team" onClick={() => {}}>
        <span data-testid="content">Engineering</span>
      </Clickable>,
    );

    const button = screen.getByRole('button', {name: 'Select team'});
    // eslint-disable-next-line testing-library/no-node-access -- the removed decorative overlay has no accessible query
    expect(button.querySelector('[data-clickable-overlay]')).toBeNull();
    expect(screen.getByTestId('content')).toHaveTextContent('Engineering');
  });

  it('activates a button once by pointer, Enter, and Space', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Clickable label="Increment" onClick={onClick}>
        Count
      </Clickable>,
    );

    const button = screen.getByRole('button', {name: 'Increment'});
    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('renders href as a link and gives it priority over onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
    });
    render(
      <Clickable href="/profile" label="View profile" onClick={onClick}>
        Profile
      </Clickable>,
    );

    const link = screen.getByRole('link', {name: 'View profile'});
    expect(link).toHaveAttribute('href', '/profile');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    await user.click(link);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('adds safe rel values for blank targets', () => {
    render(
      <Clickable href="/docs" label="Docs" rel="author" target="_blank">
        Docs
      </Clickable>,
    );

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute(
      'rel',
      'author noopener noreferrer',
    );
  });

  it('uses LinkProvider and allows as to override it', () => {
    const {rerender} = render(
      <LinkProvider component={ProviderLink}>
        <Clickable href="/settings" label="Settings">
          Settings
        </Clickable>
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'data-provider-link',
    );

    rerender(
      <LinkProvider component={ProviderLink}>
        <Clickable as={RouterLink} href="/settings" label="Settings">
          Settings
        </Clickable>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/settings');
    expect(link).not.toHaveAttribute('data-provider-link');
  });

  it('keeps disabled actions focusable with aria-disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Clickable isDisabled label="Unavailable" onClick={onClick}>
        Unavailable
      </Clickable>,
    );

    const button = screen.getByRole('button', {name: 'Unavailable'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('tabindex', '-1');

    await user.click(button);
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('falls back from a disabled link to a focusable button', () => {
    render(
      <Clickable href="/settings" isDisabled label="Settings">
        Settings
      </Clickable>,
    );

    const button = screen.getByRole('button', {name: 'Settings'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('href');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('surfaces a disabled reason as a tooltip and accessible description', () => {
    render(
      <Clickable
        disabledReason="Requires administrator access"
        isDisabled
        label="Delete"
        onClick={() => {}}>
        Delete
      </Clickable>,
    );

    const button = screen.getByRole('button', {name: 'Delete'});
    const tooltip = screen.getByRole('tooltip', {hidden: true});
    expect(tooltip).toHaveTextContent('Requires administrator access');
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('ignores disabledReason while enabled', () => {
    render(
      <Clickable
        disabledReason="Not currently relevant"
        label="Open"
        onClick={() => {}}>
        Open
      </Clickable>,
    );

    expect(screen.getByRole('button', {name: 'Open'})).not.toHaveAttribute(
      'aria-describedby',
    );
    expect(
      screen.queryByRole('tooltip', {hidden: true}),
    ).not.toBeInTheDocument();
  });

  it('renders a static span when read-only or no action is supplied', () => {
    const {rerender} = render(
      <Clickable
        data-testid="read-only"
        href="/profile"
        isDisabled
        isReadOnly
        label="Profile">
        Profile
      </Clickable>,
    );

    const readOnly = screen.getByTestId('read-only');
    expect(readOnly.tagName).toBe('SPAN');
    expect(readOnly).not.toHaveAttribute('role');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<Clickable label="Static">Static content</Clickable>);
    expect(screen.getByText('Static content')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('forwards root styling, test ID, and ref', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();
    render(
      <Clickable
        className="custom-clickable"
        data-testid="clickable"
        label="Styled"
        onClick={() => {}}
        ref={ref}
        style={{borderRadius: 12}}>
        Styled
      </Clickable>,
    );

    const button = screen.getByTestId('clickable');
    expect(button).toHaveClass('custom-clickable', 'silver-bdr_inherit');
    expect(button).toHaveStyle({borderRadius: '12px'});
    expect(ref).toHaveBeenCalledWith(button);
  });
});
