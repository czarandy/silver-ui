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

  it('renders startContent, endContent, and start adornment', () => {
    render(
      <Item
        data-testid="item"
        endContent={<span data-testid="end">T</span>}
        label="Project"
        startAdornment={<span data-testid="marker">1.</span>}
        startContent={<span data-testid="start">M</span>}
      />,
    );

    expect(screen.getByTestId('item')).toBeInTheDocument();
    expect(screen.getByTestId('marker')).toBeInTheDocument();
    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
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
});
