import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {ClickableCard} from 'components/Card/ClickableCard';
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

describe('ClickableCard', () => {
  it('combines Card appearance with ClickableContainer semantics', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <ClickableCard
        className="custom-card"
        color="blue"
        data-testid="card"
        label="Open settings"
        onClick={onClick}
        padding={4}
        ref={ref}
        style={{width: 320}}>
        <span>Settings</span>
      </ClickableCard>,
    );

    const root = screen.getByTestId('card');
    expect(root.tagName).toBe('DIV');
    expect(root).toHaveClass(
      'custom-card',
      'silver-bg_surface.blue',
      'silver-p_4',
    );
    expect(root).not.toHaveClass('silver-bdr_inherit');
    expect(root).toHaveStyle({width: '320px'});
    expect(ref).toHaveBeenCalledWith(root);
    expect(screen.getByRole('button', {name: 'Open settings'})).toHaveAttribute(
      'type',
      'button',
    );

    await user.click(screen.getByText('Settings'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('renders navigation through LinkProvider', () => {
    render(
      <LinkProvider component={RouterLink}>
        <ClickableCard href="/reports/42" label="Open report" padding={3}>
          Report
        </ClickableCard>
      </LinkProvider>,
    );

    expect(screen.getByRole('link', {name: 'Open report'})).toHaveAttribute(
      'data-to',
      '/reports/42',
    );
  });

  it('keeps nested controls independent from the card action', async () => {
    const user = userEvent.setup();
    const onCardClick = vi.fn();
    const onNestedClick = vi.fn();

    render(
      <ClickableCard label="Open report" onClick={onCardClick} padding={4}>
        <button onClick={onNestedClick} type="button">
          Archive
        </button>
      </ClickableCard>,
    );

    await user.click(screen.getByRole('button', {name: 'Archive'}));
    expect(onNestedClick).toHaveBeenCalledOnce();
    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('delegates disabled and read-only behavior to ClickableContainer', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const {rerender} = render(
      <ClickableCard isDisabled label="Open report" onClick={onClick}>
        Disabled report
      </ClickableCard>,
    );

    await user.click(screen.getByText('Disabled report'));
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Open report'})).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    rerender(
      <ClickableCard isReadOnly label="Open report" onClick={onClick}>
        Read-only report
      </ClickableCard>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
