import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {Divider} from '../Divider';
import {ContextMenu, ContextMenuItem} from './ContextMenu';

const showPopover = vi.fn(function (this: HTMLElement) {
  this.setAttribute('popover-open', '');
});
const hidePopover = vi.fn(function (this: HTMLElement) {
  this.removeAttribute('popover-open');
});

beforeEach(() => {
  showPopover.mockClear();
  hidePopover.mockClear();
  HTMLElement.prototype.showPopover = showPopover;
  HTMLElement.prototype.hidePopover = hidePopover;
});

describe('ContextMenu', () => {
  it('renders trigger children', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(screen.getByText('Right-click me')).toBeInTheDocument();
  });

  it('opens at the cursor position on right-click', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'), {
      clientX: 24,
      clientY: 48,
    });

    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('menu', {hidden: true})).toHaveStyle({
      left: '24px',
      top: '48px',
    });
  });

  it('does not prevent the native context menu when disabled', () => {
    render(
      <ContextMenu isDisabled items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const event = new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    });
    const preventDefault = vi.spyOn(event, 'preventDefault');
    screen.getByText('Right-click me').dispatchEvent(event);

    expect(preventDefault).not.toHaveBeenCalled();
    expect(showPopover).not.toHaveBeenCalled();
  });

  it('renders data-driven items, sections, and dividers', () => {
    render(
      <ContextMenu
        items={[
          {
            items: [{label: 'Cut'}, {label: 'Copy'}],
            title: 'Edit',
            type: 'section',
          },
          {type: 'divider'},
          {label: 'Paste'},
        ]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(
      screen.getByRole('group', {hidden: true, name: 'Edit'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Cut'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Paste'}),
    ).toBeInTheDocument();
  });

  it('calls item onClick and closes the menu', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ContextMenu items={[{label: 'Copy', onClick: handleClick}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    await user.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it('renders compound menu content', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <ContextMenu
        menuContent={
          <>
            <ContextMenuItem label="Copy" onClick={handleClick} />
            <Divider />
            <ContextMenuItem label="Paste" />
          </>
        }>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    await user.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('separator', {hidden: true})).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Paste'}),
    ).toBeInTheDocument();
  });

  it('opens from the keyboard context menu shortcut', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.keyDown(screen.getByTestId('context-trigger'), {
      key: 'ContextMenu',
    });

    expect(showPopover).toHaveBeenCalledTimes(1);
  });

  it('opens from Shift+F10 shortcut', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.keyDown(screen.getByTestId('context-trigger'), {
      key: 'F10',
      shiftKey: true,
    });

    expect(showPopover).toHaveBeenCalledTimes(1);
  });

  it('closes the menu on Escape', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(showPopover).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {
      key: 'Escape',
    });

    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it('calls onOpenChange when opening and closing', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ContextMenu items={[{label: 'Copy'}]} onOpenChange={onOpenChange}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(onOpenChange).toHaveBeenCalledWith(true);

    await user.click(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange(false) when closing via outside click', () => {
    const onOpenChange = vi.fn();

    render(
      <>
        <ContextMenu items={[{label: 'Copy'}]} onOpenChange={onOpenChange}>
          <div>Right-click me</div>
        </ContextMenu>
        <div>Outside</div>
      </>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);

    fireEvent.mouseDown(screen.getByText('Outside'));

    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(hidePopover).toHaveBeenCalledTimes(1);
  });

  it('activates a menu item with Enter key', () => {
    const handleClick = vi.fn();

    render(
      <ContextMenu items={[{label: 'Copy', onClick: handleClick}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));

    const menuItem = screen.getByRole('menuitem', {hidden: true, name: 'Copy'});
    menuItem.focus();
    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {key: 'Enter'});

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('auto-focuses the first menu item on open by default', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}, {label: 'Paste'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const originalRAF = window.requestAnimationFrame;
    const pendingCallbacks: FrameRequestCallback[] = [];
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      pendingCallbacks.push(cb);
      return pendingCallbacks.length;
    };

    fireEvent.contextMenu(screen.getByText('Right-click me'));

    window.requestAnimationFrame = originalRAF;

    act(() => {
      for (const cb of pendingCallbacks) {
        cb(0);
      }
    });

    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    ).toHaveFocus();
  });

  it('does not auto-focus the first menu item when hasAutoFocus is false', () => {
    render(
      <ContextMenu
        hasAutoFocus={false}
        items={[{label: 'Copy'}, {label: 'Paste'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const originalRAF = window.requestAnimationFrame;
    const pendingCallbacks: FrameRequestCallback[] = [];
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      pendingCallbacks.push(cb);
      return pendingCallbacks.length;
    };

    fireEvent.contextMenu(screen.getByText('Right-click me'));

    window.requestAnimationFrame = originalRAF;

    act(() => {
      for (const cb of pendingCallbacks) {
        cb(0);
      }
    });

    expect(
      screen.getByRole('menuitem', {hidden: true, name: 'Copy'}),
    ).not.toHaveFocus();
  });

  it('clamps menu position to stay within the viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 800,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 600,
    });

    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const menu = screen.getByRole('menu', {hidden: true});
    vi.spyOn(menu, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      height: 200,
      left: 0,
      right: 0,
      toJSON: () => {},
      top: 0,
      width: 160,
      x: 0,
      y: 0,
    });

    const originalRAF = window.requestAnimationFrame;
    const pendingCallbacks: FrameRequestCallback[] = [];
    window.requestAnimationFrame = (cb: FrameRequestCallback) => {
      pendingCallbacks.push(cb);
      return pendingCallbacks.length;
    };

    fireEvent.contextMenu(screen.getByText('Right-click me'), {
      clientX: 750,
      clientY: 500,
    });

    window.requestAnimationFrame = originalRAF;

    act(() => {
      for (const cb of pendingCallbacks) {
        cb(0);
      }
    });

    expect(menu).toHaveStyle({
      left: `${800 - 160 - 4}px`,
      top: `${600 - 200 - 4}px`,
    });
  });

  it('applies the default menu width', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(screen.getByRole('menu', {hidden: true})).toHaveStyle({
      width: '160px',
    });
  });

  it('applies a numeric menuWidth as pixels', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]} menuWidth={240}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(screen.getByRole('menu', {hidden: true})).toHaveStyle({
      width: '240px',
    });
  });

  it('applies a string menuWidth verbatim', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]} menuWidth="20rem">
        <div>Right-click me</div>
      </ContextMenu>,
    );

    expect(screen.getByRole('menu', {hidden: true})).toHaveStyle({
      width: '20rem',
    });
  });
});
