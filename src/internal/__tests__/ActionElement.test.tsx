import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {ActionElement} from 'internal/ActionElement';

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

describe('ActionElement', () => {
  it('renders a button when href is omitted', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<ActionElement onClick={onClick}>Action</ActionElement>);

    const button = screen.getByRole('button', {name: 'Action'});
    expect(button).toHaveAttribute('type', 'button');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();

    await user.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders a link when href is provided', () => {
    render(<ActionElement href="/docs">Docs</ActionElement>);

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link).toHaveAttribute('href', '/docs');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('uses custom link components for links', () => {
    render(
      <ActionElement as={CustomLink} href="/docs">
        Docs
      </ActionElement>,
    );

    const link = screen.getByRole('link', {name: 'Docs'});
    expect(link).toHaveAttribute('data-custom-link');
    expect(link).toHaveAttribute('href', '/docs');
  });

  it('defaults href-less forced links to role link', () => {
    render(<ActionElement renderAsLink>Disabled Link</ActionElement>);

    const link = screen.getByRole('link', {name: 'Disabled Link'});
    expect(link).not.toHaveAttribute('href');
  });

  it('uses an explicit role when provided', () => {
    render(
      <ActionElement renderAsLink role="menuitem">
        Menu Item
      </ActionElement>,
    );

    expect(
      screen.getByRole('menuitem', {name: 'Menu Item'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
