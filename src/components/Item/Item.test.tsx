import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {LinkProvider} from '../Link';
import {Item} from './Item';

function RouterLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-to={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

describe('Item', () => {
  it('renders label and description', () => {
    render(<Item description="Supporting text" label="Settings" />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Supporting text')).toBeInTheDocument();
  });

  it('renders startContent, endContent, leadingContent, trailingContent', () => {
    render(
      <Item
        data-testid="item"
        endContent={<span data-testid="end">T</span>}
        label="Project"
        leadingContent={<span data-testid="leading">1.</span>}
        startContent={<span data-testid="start">M</span>}
        trailingContent={<span data-testid="trailing">X</span>}
      />,
    );

    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('leading')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
    expect(screen.getByTestId('trailing')).toBeInTheDocument();
  });

  it('fires onClick from the invisible button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Item label="Clickable" onClick={onClick} />);

    await user.click(screen.getByRole('button', {name: 'Clickable'}));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disables the invisible button when disabled', () => {
    render(<Item isDisabled label="Disabled" onClick={() => {}} />);

    expect(screen.getByRole('button', {name: 'Disabled'})).toBeDisabled();
  });

  it('renders a link and adds safe rel for blank targets', () => {
    render(<Item href="/docs" label="Docs" target="_blank" />);

    expect(screen.getByRole('link', {name: 'Docs'})).toHaveAttribute(
      'rel',
      'noopener noreferrer',
    );
  });

  it('passes href as to for custom link components', () => {
    render(
      <LinkProvider component={RouterLink}>
        <Item href="/settings" label="Settings" />
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'data-to',
      '/settings',
    );
  });

  it('sets selected and disabled state attributes on the root', () => {
    render(<Item data-testid="item" isDisabled isSelected label="Selected" />);

    expect(screen.getByTestId('item')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('item')).toHaveAttribute('aria-selected', 'true');
  });

  it('forwards aria-current to the link element', () => {
    render(<Item aria-current="page" href="/home" label="Home" />);

    expect(screen.getByRole('link', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('forwards aria-current to the button element', () => {
    render(<Item aria-current="page" label="Home" onClick={() => {}} />);

    expect(screen.getByRole('button', {name: 'Home'})).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('fires onClick on link clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Item href="/home" label="Home" onClick={onClick} />);

    await user.click(screen.getByRole('link', {name: 'Home'}));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('uses linkComponent for link rendering', () => {
    render(
      <Item href="/settings" label="Settings" linkComponent={RouterLink} />,
    );

    expect(screen.getByRole('link', {name: 'Settings'})).toHaveAttribute(
      'data-to',
      '/settings',
    );
  });

  it('linkComponent overrides LinkProvider', () => {
    function ProviderLink({
      children,
      ref,
      ...props
    }: ComponentPropsWithRef<'a'>): React.JSX.Element {
      return (
        <a data-provider ref={ref} {...props}>
          {children}
        </a>
      );
    }

    render(
      <LinkProvider component={ProviderLink}>
        <Item href="/settings" label="Settings" linkComponent={RouterLink} />
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Settings'});
    expect(link).toHaveAttribute('data-to');
    expect(link).not.toHaveAttribute('data-provider');
  });
});
