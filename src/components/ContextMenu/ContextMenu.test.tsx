import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ContextMenu, ContextMenuItem} from 'components/ContextMenu/ContextMenu';
import {Divider} from 'components/Divider';
import {assertNonNull} from 'internal/testHelpers';

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

function getStyleProperty(element: HTMLElement, property: string): string {
  const style = element.style as unknown as Record<string, string | undefined>;
  return style[property] ?? '';
}

function getAnchorName(element: HTMLElement): string {
  return getStyleProperty(element, 'anchorName');
}

function getAnchorElement(): HTMLElement {
  return assertNonNull(
    Array.from(
      document.querySelectorAll<HTMLElement>('[aria-hidden="true"]'),
    ).find(element => getAnchorName(element) !== ''),
    'context menu anchor should be rendered',
  );
}

function getLayerElement(): HTMLElement {
  return assertNonNull(
    screen.getByRole('menu', {hidden: true}).parentElement,
    'context menu layer should be rendered',
  );
}

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
    expect(getAnchorElement()).toHaveStyle({
      left: '24px',
      top: '48px',
    });
  });

  it('anchors the layer below/start with viewport flip fallbacks', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'), {
      clientX: 24,
      clientY: 48,
    });

    const anchor = getAnchorElement();
    const layer = getLayerElement();
    expect(layer).toHaveAttribute('popover', 'manual');
    expect(getStyleProperty(layer, 'positionAnchor')).toBe(
      getAnchorName(anchor),
    );
    expect(getStyleProperty(layer, 'positionArea')).toBe(
      'bottom span-inline-end',
    );
    expect(getStyleProperty(layer, 'positionTryFallbacks')).toBe(
      'flip-block, flip-inline, flip-block flip-inline',
    );
    expect(screen.getByTestId('context-trigger')).toHaveAttribute(
      'aria-controls',
      layer.id,
    );
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

    const trigger = screen.getByTestId('context-trigger');
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      bottom: 72,
      height: 48,
      left: 16,
      right: 116,
      toJSON: () => {},
      top: 24,
      width: 100,
      x: 16,
      y: 24,
    });

    fireEvent.keyDown(trigger, {
      key: 'ContextMenu',
    });

    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(getAnchorElement()).toHaveStyle({left: '16px', top: '72px'});
  });

  it('opens from Shift+F10 shortcut', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('context-trigger');
    vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
      bottom: 96,
      height: 48,
      left: 32,
      right: 132,
      toJSON: () => {},
      top: 48,
      width: 100,
      x: 32,
      y: 48,
    });

    fireEvent.keyDown(trigger, {
      key: 'F10',
      shiftKey: true,
    });

    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(getAnchorElement()).toHaveStyle({left: '32px', top: '96px'});
  });

  it('opens on a touch long-press near the press point', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu items={[{label: 'Copy'}]}>
          <div>Right-click me</div>
        </ContextMenu>,
      );

      const trigger = screen.getByText('Right-click me');
      fireEvent.pointerDown(trigger, {
        clientX: 30,
        clientY: 60,
        pointerType: 'touch',
      });

      expect(showPopover).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(showPopover).toHaveBeenCalledTimes(1);
      expect(getAnchorElement()).toHaveStyle({
        left: '30px',
        top: '60px',
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not open on a short tap', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu items={[{label: 'Copy'}]}>
          <div>Right-click me</div>
        </ContextMenu>,
      );

      const trigger = screen.getByText('Right-click me');
      fireEvent.pointerDown(trigger, {
        clientX: 30,
        clientY: 60,
        pointerType: 'touch',
      });
      act(() => {
        vi.advanceTimersByTime(200);
      });
      fireEvent.pointerUp(trigger, {pointerType: 'touch'});

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(showPopover).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not open when the touch moves beyond the threshold (scroll)', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu items={[{label: 'Copy'}]}>
          <div>Right-click me</div>
        </ContextMenu>,
      );

      const trigger = screen.getByText('Right-click me');
      fireEvent.pointerDown(trigger, {
        clientX: 30,
        clientY: 60,
        pointerType: 'touch',
      });
      fireEvent.pointerMove(trigger, {
        clientX: 30,
        clientY: 100,
        pointerType: 'touch',
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(showPopover).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('ignores non-touch pointers (mouse press does not long-press)', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu items={[{label: 'Copy'}]}>
          <div>Right-click me</div>
        </ContextMenu>,
      );

      const trigger = screen.getByText('Right-click me');
      fireEvent.pointerDown(trigger, {
        clientX: 30,
        clientY: 60,
        pointerType: 'mouse',
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(showPopover).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not long-press open when disabled', () => {
    vi.useFakeTimers();
    try {
      render(
        <ContextMenu isDisabled items={[{label: 'Copy'}]}>
          <div>Right-click me</div>
        </ContextMenu>,
      );

      const trigger = screen.getByText('Right-click me');
      fireEvent.pointerDown(trigger, {
        clientX: 30,
        clientY: 60,
        pointerType: 'touch',
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(showPopover).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });

  it('closes the menu on Escape and restores focus to the trigger', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    expect(showPopover).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(screen.getByRole('menu', {hidden: true}), {
      key: 'Escape',
    });

    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('context-trigger')).toHaveFocus();
  });

  it('closes the menu and focuses the trigger on Tab', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const trigger = screen.getByTestId('context-trigger');
    fireEvent.contextMenu(screen.getByText('Right-click me'));

    const menuItem = screen.getByRole('menuitem', {hidden: true, name: 'Copy'});
    menuItem.focus();
    fireEvent.keyDown(menuItem, {key: 'Tab'});

    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
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

  it('dismisses when a nested scroll container scrolls', () => {
    const onOpenChange = vi.fn();
    render(
      <div data-testid="scroll-region">
        <ContextMenu
          data-testid="context-trigger"
          items={[{label: 'Copy'}]}
          onOpenChange={onOpenChange}>
          <div>Right-click me</div>
        </ContextMenu>
      </div>,
    );

    const trigger = screen.getByTestId('context-trigger');
    fireEvent.contextMenu(screen.getByText('Right-click me'));
    fireEvent.scroll(screen.getByTestId('scroll-region'));

    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it('dismisses when the window scrolls', () => {
    render(
      <ContextMenu data-testid="context-trigger" items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    fireEvent.scroll(window);

    expect(hidePopover).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('context-trigger')).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('does not dismiss when the menu itself scrolls', () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu
        data-testid="context-trigger"
        items={[{label: 'Copy'}]}
        onOpenChange={onOpenChange}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText('Right-click me'));
    fireEvent.scroll(screen.getByRole('menu', {hidden: true}));

    expect(hidePopover).not.toHaveBeenCalled();
    expect(screen.getByTestId('context-trigger')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(onOpenChange.mock.calls).toEqual([[true]]);
  });

  it('moves an open menu anchor without reopening the layer', () => {
    const onOpenChange = vi.fn();
    render(
      <ContextMenu items={[{label: 'Copy'}]} onOpenChange={onOpenChange}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const triggerContent = screen.getByText('Right-click me');
    fireEvent.contextMenu(triggerContent, {clientX: 12, clientY: 24});
    fireEvent.contextMenu(triggerContent, {clientX: 36, clientY: 48});

    expect(getAnchorElement()).toHaveStyle({left: '36px', top: '48px'});
    expect(showPopover).toHaveBeenCalledTimes(1);
    expect(hidePopover).not.toHaveBeenCalled();
    expect(onOpenChange.mock.calls).toEqual([[true]]);
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

  it('does not measure the menu when opening', () => {
    render(
      <ContextMenu items={[{label: 'Copy'}]}>
        <div>Right-click me</div>
      </ContextMenu>,
    );

    const menu = screen.getByRole('menu', {hidden: true});
    const getBoundingClientRect = vi.spyOn(menu, 'getBoundingClientRect');

    fireEvent.contextMenu(screen.getByText('Right-click me'), {
      clientX: 750,
      clientY: 500,
    });

    expect(getBoundingClientRect).not.toHaveBeenCalled();
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
