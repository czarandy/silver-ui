import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {ComponentPropsWithRef, MouseEvent as ReactMouseEvent} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {ClickableContainer} from 'components/Clickable/ClickableContainer';
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

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ClickableContainer', () => {
  it('keeps the visible root semantic-free and uses a sibling real control', () => {
    render(
      <ClickableContainer
        data-testid="surface"
        label="Open item"
        onClick={() => {}}>
        <span>Item content</span>
      </ClickableContainer>,
    );

    const root = screen.getByTestId('surface');
    const control = screen.getByRole('button', {name: 'Open item'});
    expect(root.tagName).toBe('DIV');
    expect(root).not.toHaveAttribute('role');
    expect(root).not.toHaveAttribute('tabindex');
    expect(root).not.toHaveAttribute('aria-label');
    expect(control).toHaveAttribute('type', 'button');
    expect(control).toHaveAttribute('data-clickable-control');
    // eslint-disable-next-line testing-library/no-node-access -- validates the sibling DOM contract
    expect(control.parentElement).toBe(root);
    expect(control).toHaveClass('silver-pos_absolute', 'silver-ov_hidden');
  });

  it('forwards a surface click to the hidden button exactly once', async () => {
    const user = userEvent.setup();
    let clickedControl: EventTarget | null = null;
    const onClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => {
      clickedControl = event.currentTarget;
    });
    render(
      <ClickableContainer label="Open item" onClick={onClick}>
        <span>Item content</span>
      </ClickableContainer>,
    );

    await user.click(screen.getByText('Item content'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(clickedControl).toBe(
      screen.getByRole('button', {name: 'Open item'}),
    );
  });

  it('supports native Enter and Space activation on the hidden button', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ClickableContainer label="Open item" onClick={onClick}>
        Item content
      </ClickableContainer>,
    );

    const button = screen.getByRole('button', {name: 'Open item'});
    button.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it('renders links through LinkProvider with target and safe rel', () => {
    render(
      <LinkProvider component={RouterLink}>
        <ClickableContainer
          href="/items/42"
          label="Open item"
          rel="author"
          target="_blank">
          Item content
        </ClickableContainer>
      </LinkProvider>,
    );

    const link = screen.getByRole('link', {name: 'Open item'});
    expect(link).toHaveAttribute('data-router-link');
    expect(link).toHaveAttribute('data-to', '/items/42');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'author noopener noreferrer');
  });

  it('preserves modifier keys while forwarding a link click', () => {
    const onClick = vi.fn((event: ReactMouseEvent<HTMLElement>) => {
      event.preventDefault();
    });
    render(
      <ClickableContainer href="/items/42" label="Open item" onClick={onClick}>
        <span>Item content</span>
      </ClickableContainer>,
    );

    fireEvent.click(screen.getByText('Item content'), {
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
    });

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick.mock.calls[0][0]).toMatchObject({
      ctrlKey: true,
      metaKey: true,
      shiftKey: true,
    });
  });

  it('forwards middle-click as auxclick only for links', () => {
    const {rerender} = render(
      <ClickableContainer href="/items/42" label="Open item">
        <span>Item content</span>
      </ClickableContainer>,
    );
    const link = screen.getByRole('link', {name: 'Open item'});
    const linkDispatch = vi.spyOn(link, 'dispatchEvent');

    fireEvent(
      screen.getByText('Item content'),
      new MouseEvent('auxclick', {bubbles: true, button: 1}),
    );
    expect(linkDispatch).toHaveBeenCalledWith(
      expect.objectContaining({button: 1, type: 'auxclick'}),
    );

    rerender(
      <ClickableContainer label="Open item" onClick={() => {}}>
        <span>Button content</span>
      </ClickableContainer>,
    );
    const button = screen.getByRole('button', {name: 'Open item'});
    const buttonDispatch = vi.spyOn(button, 'dispatchEvent');
    fireEvent(
      screen.getByText('Button content'),
      new MouseEvent('auxclick', {bubbles: true, button: 1}),
    );
    expect(buttonDispatch).not.toHaveBeenCalled();
  });

  it('bubbles one forwarded event rather than the original and forwarded events', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOuterClick = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- observes bubbling from the delegated control
      <div onClick={onOuterClick}>
        <ClickableContainer label="Open item" onClick={onClick}>
          <span>Item content</span>
        </ClickableContainer>
      </div>,
    );

    await user.click(screen.getByText('Item content'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onOuterClick).toHaveBeenCalledOnce();
  });

  it('does not activate the surface from nested native controls', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onNestedClick = vi.fn();
    render(
      <ClickableContainer label="Open item" onClick={onClick}>
        <button onClick={onNestedClick} type="button">
          Delete
        </button>
        <a href="#settings" onClick={event => event.preventDefault()}>
          Settings
        </a>
      </ClickableContainer>,
    );

    await user.click(screen.getByRole('button', {name: 'Delete'}));
    await user.click(screen.getByRole('link', {name: 'Settings'}));
    expect(onNestedClick).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not activate from a nested control label', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ClickableContainer label="Open item" onClick={onClick}>
        <label htmlFor="nested-checkbox">Include archived items</label>
        <input id="nested-checkbox" type="checkbox" />
      </ClickableContainer>,
    );

    await user.click(screen.getByText('Include archived items'));
    expect(
      screen.getByRole('checkbox', {name: 'Include archived items'}),
    ).toBeChecked();
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each([
    {props: {role: 'button'}, label: 'ARIA button'},
    {props: {contentEditable: true}, label: 'Editable content'},
    {props: {tabIndex: 0}, label: 'Tab stop'},
  ])('does not activate from nested $label', async ({props, label}) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ClickableContainer label="Open item" onClick={onClick}>
        <span {...props}>{label}</span>
      </ClickableContainer>,
    );

    await user.click(screen.getByText(label));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not activate while text inside the surface is selected', () => {
    const onClick = vi.fn();
    render(
      <ClickableContainer label="Open item" onClick={onClick}>
        <span data-testid="selected-text">Selectable text</span>
      </ClickableContainer>,
    );
    const selectedText = screen.getByTestId('selected-text');
    vi.spyOn(window, 'getSelection').mockReturnValue({
      anchorNode: selectedText,
      focusNode: selectedText,
      isCollapsed: false,
      toString: () => 'Selectable text',
    } as unknown as Selection);

    fireEvent.click(selectedText);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects defaultPrevented surface events', () => {
    const onClick = vi.fn();
    render(
      <ClickableContainer label="Open item" onClick={onClick}>
        {/* eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-static-element-interactions -- deliberately tests a consumer cancelling a bubbled click */}
        <span onClick={event => event.preventDefault()}>Prevented content</span>
      </ClickableContainer>,
    );

    fireEvent.click(screen.getByText('Prevented content'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('keeps disabled controls focusable and suppresses activation', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ClickableContainer
        href="/items/42"
        isDisabled
        label="Open item"
        onClick={onClick}>
        <span>Item content</span>
      </ClickableContainer>,
    );

    const button = screen.getByRole('button', {name: 'Open item'});
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('href');

    await user.click(screen.getByText('Item content'));
    button.focus();
    await user.keyboard('{Enter}');
    expect(onClick).not.toHaveBeenCalled();
  });

  it('lets nested controls operate when the container action is disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onNestedClick = vi.fn();
    render(
      <ClickableContainer isDisabled label="Open item" onClick={onClick}>
        <button onClick={onNestedClick} type="button">
          Retry
        </button>
      </ClickableContainer>,
    );

    await user.click(screen.getByRole('button', {name: 'Retry'}));
    expect(onNestedClick).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  it('surfaces disabledReason from the visible root to the hidden control', () => {
    render(
      <ClickableContainer
        disabledReason="Requires administrator access"
        isDisabled
        label="Delete item"
        onClick={() => {}}>
        Item content
      </ClickableContainer>,
    );

    const button = screen.getByRole('button', {name: 'Delete item'});
    const tooltip = screen.getByRole('tooltip', {hidden: true});
    expect(button).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveTextContent('Requires administrator access');
  });

  it('renders read-only and actionless content without a control or overlay', () => {
    const {rerender} = render(
      <ClickableContainer
        data-testid="surface"
        href="/items/42"
        isDisabled
        isReadOnly
        label="Open item">
        Item content
      </ClickableContainer>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByTestId('surface')).not.toHaveAttribute(
      'data-clickable-disabled',
    );

    rerender(
      <ClickableContainer data-testid="surface" label="Static item">
        Static content
      </ClickableContainer>,
    );
    expect(screen.getByText('Static content')).toBeInTheDocument();
  });

  it('forwards root styling, test ID, and ref', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();
    render(
      <ClickableContainer
        className="custom-surface"
        data-testid="surface"
        label="Open item"
        onClick={() => {}}
        ref={ref}
        style={{borderRadius: 12}}>
        Item content
      </ClickableContainer>,
    );

    const root = screen.getByTestId('surface');
    expect(root).toHaveClass('custom-surface', 'silver-bdr_inherit');
    expect(root).toHaveStyle({borderRadius: '12px'});
    expect(ref).toHaveBeenCalledWith(root);
    // eslint-disable-next-line jest-dom-ya/prefer-to-have-class -- selector-bearing Panda class is asserted as a stable substring
    expect(root.className).toContain(
      '[&:has([data-clickable-control]:focus-visible)]',
    );
  });
});
