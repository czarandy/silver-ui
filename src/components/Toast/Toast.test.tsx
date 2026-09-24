import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useEffect, useRef, useState} from 'react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button';
import {Dialog} from 'components/Dialog/Dialog';
import {Toast} from 'components/Toast/Toast';
import {ToastViewport} from 'components/Toast/ToastViewport';
import type {ToastDismissFn, ToastOptions} from 'components/Toast/types';
import {useToast} from 'components/Toast/useToast';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value: vi.fn(),
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});

afterEach(() => {
  vi.useRealTimers();
});

function ShowToastFixture({
  body = 'Toast message',
  ...options
}: {body?: string} & Record<string, unknown>): React.JSX.Element {
  const toast = useToast();
  return <Button label="Show" onClick={() => toast({body, ...options})} />;
}

function OverwriteFixture(): React.JSX.Element {
  const toast = useToast();
  return (
    <>
      <Button
        label="First"
        onClick={() => toast({body: 'First message', uniqueID: 'save'})}
      />
      <Button
        label="Second"
        onClick={() => toast({body: 'Second message', uniqueID: 'save'})}
      />
    </>
  );
}

function IgnoreFixture(): React.JSX.Element {
  const toast = useToast();
  return (
    <>
      <Button
        label="Add first"
        onClick={() => toast({body: 'First toast', uniqueID: 'dup'})}
      />
      <Button
        label="Add second"
        onClick={() =>
          toast({
            body: 'Second toast',
            collisionBehavior: 'ignore',
            uniqueID: 'dup',
          })
        }
      />
    </>
  );
}

function DismissFnFixture({
  onHide,
}: Pick<ToastOptions, 'onHide'>): React.JSX.Element {
  const toast = useToast();
  const dismissRef = useRef<ToastDismissFn | null>(null);
  return (
    <>
      <Button
        label="Show"
        onClick={() => {
          dismissRef.current = toast({
            body: 'Programmatic',
            isAutoHide: false,
            onHide,
          });
        }}
      />
      <Button label="Dismiss" onClick={() => dismissRef.current?.()} />
    </>
  );
}

describe('Toast', () => {
  it('renders available toast types with matching status styles', () => {
    const {rerender} = render(
      <Toast
        autoHideDuration={5000}
        body="Info"
        data-testid="toast"
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="info"
      />,
    );

    expect(screen.getByTestId('toast')).toHaveAttribute('role', 'status');
    expect(screen.getByTestId('toast')).toHaveAttribute('aria-live', 'polite');

    rerender(
      <Toast
        autoHideDuration={5000}
        body="Error"
        data-testid="toast"
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="error"
      />,
    );
    expect(screen.getByTestId('toast')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('toast')).toHaveAttribute(
      'aria-live',
      'assertive',
    );
  });

  // Left alone, a primary action would paint the global accent on a fill it was
  // never picked against — teal on teal for `info`.
  it('collapses a primary end action to the onSolid treatment', () => {
    render(
      <Toast
        autoHideDuration={5000}
        body="A new version is available"
        data-testid="toast"
        endContent={<Button label="Update" size="sm" variant="primary" />}
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="info"
      />,
    );

    const toast = screen.getByTestId('toast');
    expect(toast).toHaveClass('silver---silver-button-primary-bg_transparent');
    expect(toast).toHaveClass('silver---silver-button-primary-fg_currentColor');
  });

  // `currentColor` is what keeps this type-agnostic: the label follows the
  // toast's own text, so the light `warning` fill gets a dark label without a
  // per-type value. A filled action cannot do this — no single fill colour
  // clears 3:1 against both the light amber and the dark teal.
  it('collapses a primary end action on every type', () => {
    const {rerender} = render(
      <Toast
        autoHideDuration={5000}
        body="Storage almost full"
        data-testid="toast"
        endContent={<Button label="Upgrade" size="sm" variant="primary" />}
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="warning"
      />,
    );

    expect(screen.getByTestId('toast')).toHaveClass(
      'silver---silver-button-primary-fg_currentColor',
    );

    rerender(
      <Toast
        autoHideDuration={5000}
        body="Unable to save"
        data-testid="toast"
        endContent={<Button label="Retry" size="sm" variant="primary" />}
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="error"
      />,
    );

    expect(screen.getByTestId('toast')).toHaveClass(
      'silver---silver-button-primary-fg_currentColor',
    );
  });

  it('renders a dismissable toast', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Toast
        autoHideDuration={5000}
        body="Saved"
        isAutoHide={false}
        onDismiss={onDismiss}
        type="info"
      />,
    );

    expect(screen.getByText('Saved')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {name: 'Dismiss notification'}),
    );
    expect(onDismiss).toHaveBeenCalledWith('manual');
  });

  it('shows a toast from the hook', async () => {
    const user = userEvent.setup();

    render(
      <ToastViewport>
        <ShowToastFixture body="Saved successfully" />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('moves focus to active notifications with F6 and pauses auto-dismiss', async () => {
    vi.useFakeTimers();

    render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture
          body="Item deleted"
          endContent={<Button label="Undo" size="sm" variant="onSolid" />}
        />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));

    const viewport = screen.getByRole('region', {name: 'Notifications'});
    expect(viewport).toHaveAttribute('aria-keyshortcuts', 'F6');
    expect(screen.getByRole('button', {name: 'Undo'})).toBeInTheDocument();

    fireEvent.keyDown(document, {key: 'F6'});
    expect(viewport).toHaveFocus();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    expect(screen.getByText('Item deleted')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Undo'})).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('guards and suppresses the F6 shortcut only while notifications exist', () => {
    render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture body="Item saved" />
        <input aria-label="Title" />
      </ToastViewport>,
    );

    const beforeToast = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'F6',
    });
    document.dispatchEvent(beforeToast);
    expect(beforeToast.defaultPrevented).toBe(false);

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    const input = screen.getByRole('textbox', {name: 'Title'});
    const viewport = screen.getByRole('region', {name: 'Notifications'});
    input.focus();

    fireEvent.keyDown(input, {ctrlKey: true, key: 'F6'});
    fireEvent.keyDown(input, {key: 'F6', shiftKey: true});
    fireEvent.keyDown(input, {isComposing: true, key: 'F6'});
    expect(input).toHaveFocus();

    const accepted = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'F6',
    });
    input.dispatchEvent(accepted);

    expect(accepted.defaultPrevented).toBe(true);
    expect(viewport).toHaveFocus();
  });

  it('deduplicates by uniqueID using overwrite behavior', async () => {
    const user = userEvent.setup();

    render(
      <ToastViewport>
        <OverwriteFixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'First'}));
    await user.click(screen.getByRole('button', {name: 'Second'}));

    expect(screen.queryByText('First message')).not.toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('ignores duplicate uniqueID with collisionBehavior ignore', async () => {
    const user = userEvent.setup();

    render(
      <ToastViewport>
        <IgnoreFixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Add first'}));
    await user.click(screen.getByRole('button', {name: 'Add second'}));

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.queryByText('Second toast')).not.toBeInTheDocument();
  });

  it('auto-dismisses info toasts by default', async () => {
    vi.useFakeTimers();

    render(
      <ToastViewport>
        <ShowToastFixture body="Auto hide" />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Auto hide')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5200);
    });
    expect(screen.queryByText('Auto hide')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('does not auto-dismiss error toasts by default', async () => {
    vi.useFakeTimers();

    render(
      <ToastViewport>
        <ShowToastFixture body="Error toast" type="error" />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Error toast')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(10000);
    expect(screen.getByText('Error toast')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('pauses auto-dismiss on mouse hover', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <Toast
        autoHideDuration={5000}
        body="Hover me"
        data-testid="toast"
        isAutoHide
        onDismiss={onDismiss}
        type="info"
      />,
    );

    await vi.advanceTimersByTimeAsync(2000);
    fireEvent.mouseEnter(screen.getByTestId('toast'));

    await vi.advanceTimersByTimeAsync(10000);
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.mouseLeave(screen.getByTestId('toast'));
    await vi.advanceTimersByTimeAsync(5000);
    expect(onDismiss).toHaveBeenCalledWith('auto');

    vi.useRealTimers();
  });

  it('pauses auto-dismiss on focus', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <Toast
        autoHideDuration={5000}
        body="Focus me"
        data-testid="toast"
        isAutoHide
        onDismiss={onDismiss}
        type="info"
      />,
    );

    await vi.advanceTimersByTimeAsync(2000);
    fireEvent.focusIn(screen.getByTestId('toast'));

    await vi.advanceTimersByTimeAsync(10000);
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.focusOut(screen.getByTestId('toast'));
    await vi.advanceTimersByTimeAsync(5000);
    expect(onDismiss).toHaveBeenCalledWith('auto');

    vi.useRealTimers();
  });

  it('calls onHide once when a toast is dismissed repeatedly', async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();

    render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture body="With callback" onHide={onHide} />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Show'}));
    await user.dblClick(
      screen.getByRole('button', {name: 'Dismiss notification'}),
    );

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledWith('manual');
  });

  it('dismisses programmatically via returned function', async () => {
    vi.useFakeTimers();
    const onHide = vi.fn();

    render(
      <ToastViewport isTopLayer={false}>
        <DismissFnFixture onHide={onHide} />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Programmatic')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledWith('manual');

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.queryByText('Programmatic')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('keeps the first dismissal reason when manual and auto dismissals race', async () => {
    vi.useFakeTimers();
    const onHide = vi.fn();

    render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture
          autoHideDuration={100}
          body="Racing dismissals"
          onHide={onHide}
        />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss notification'}));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(onHide).toHaveBeenCalledWith('manual');
  });

  it('clears pending exit timers when the viewport unmounts', () => {
    vi.useFakeTimers();

    const {unmount} = render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture body="Unmounting" isAutoHide={false} />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss notification'}));
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it('limits visible toasts to maxVisible', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const toast = useToast();
      let counter = 0;
      return (
        <Button
          label="Add"
          onClick={() => toast({body: `Toast ${++counter}`, isAutoHide: false})}
        />
      );
    }

    render(
      <ToastViewport isTopLayer={false} maxVisible={2}>
        <Fixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Add'}));
    await user.click(screen.getByRole('button', {name: 'Add'}));
    await user.click(screen.getByRole('button', {name: 'Add'}));

    const dismissButtons = screen.getAllByRole('button', {
      name: 'Dismiss notification',
    });
    expect(dismissButtons).toHaveLength(2);
  });

  it('applies inset styles to the viewport', () => {
    render(
      <ToastViewport
        data-testid="viewport"
        inset={{top: 64, end: 16}}
        isTopLayer={false}
      />,
    );

    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveStyle({top: '64px', insetInlineEnd: '16px'});
  });
});

describe('ToastViewport top layer ordering', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  function spyOnPopover() {
    const events: string[] = [];
    const show = vi
      .spyOn(HTMLElement.prototype, 'showPopover')
      .mockImplementation(() => {
        events.push('show');
      });
    const hide = vi
      .spyOn(HTMLElement.prototype, 'hidePopover')
      .mockImplementation(() => {
        events.push('hide');
      });
    return {events, hide, show};
  }

  // The top layer stacks in insertion order, so re-entering it is the only way
  // to get above a modal dialog that opened after the viewport mounted.
  it('re-enters the top layer when a new toast is shown', async () => {
    const user = userEvent.setup();
    const {events} = spyOnPopover();

    render(
      <ToastViewport>
        <ShowToastFixture body="Saved" isAutoHide={false} />
      </ToastViewport>,
    );
    expect(events.at(-1)).toBe('show');
    events.length = 0;

    await user.click(screen.getByRole('button', {name: 'Show'}));
    expect(events).toEqual(['hide', 'show']);

    await user.click(screen.getByRole('button', {name: 'Show'}));
    expect(events).toEqual(['hide', 'show', 'hide', 'show']);
  });

  it('keeps its place when a toast is dismissed', async () => {
    const user = userEvent.setup();
    const {events} = spyOnPopover();

    render(
      <ToastViewport>
        <ShowToastFixture body="Saved" isAutoHide={false} />
      </ToastViewport>,
    );
    await user.click(screen.getByRole('button', {name: 'Show'}));
    events.length = 0;

    // jsdom never marks the mocked popover open, so its UA stylesheet hides
    // the viewport from role queries.
    await user.click(
      screen.getByRole('button', {hidden: true, name: 'Dismiss notification'}),
    );
    await act(async () => {
      await new Promise(resolve => globalThis.setTimeout(resolve, 250));
    });

    expect(screen.queryByText('Saved')).not.toBeInTheDocument();
    expect(events).toEqual([]);
  });

  it('keeps its place when a colliding toast is ignored', async () => {
    const user = userEvent.setup();
    const {events} = spyOnPopover();

    render(
      <ToastViewport>
        <IgnoreFixture />
      </ToastViewport>,
    );
    await user.click(screen.getByRole('button', {name: 'Add first'}));
    events.length = 0;

    await user.click(screen.getByRole('button', {name: 'Add second'}));
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(events).toEqual([]);
  });

  it('re-enters the top layer when a toast is overwritten', async () => {
    const user = userEvent.setup();
    const {events} = spyOnPopover();

    render(
      <ToastViewport>
        <OverwriteFixture />
      </ToastViewport>,
    );
    await user.click(screen.getByRole('button', {name: 'First'}));
    events.length = 0;

    await user.click(screen.getByRole('button', {name: 'Second'}));
    expect(screen.getByText('Second message')).toBeInTheDocument();
    expect(events).toEqual(['hide', 'show']);
  });

  it('does not touch the top layer when isTopLayer is false', async () => {
    const user = userEvent.setup();
    const {events} = spyOnPopover();

    render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture body="Saved" />
      </ToastViewport>,
    );
    await user.click(screen.getByRole('button', {name: 'Show'}));

    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(events).toEqual([]);
  });

  it('restores focus inside the viewport after re-entering the top layer', async () => {
    const user = userEvent.setup();
    // Hiding a popover blurs whatever was focused inside it.
    vi.spyOn(HTMLElement.prototype, 'hidePopover').mockImplementation(function (
      this: HTMLElement,
    ) {
      // eslint-disable-next-line testing-library/no-node-access -- the mock stands in for the browser's own blur on hide
      const active = document.activeElement;
      if (active instanceof HTMLElement && this.contains(active)) {
        active.blur();
      }
    });

    function Fixture(): React.JSX.Element {
      const toast = useToast();
      return (
        <Button
          label="Show"
          onClick={() =>
            toast({
              body: 'Item deleted',
              endContent: (
                <Button
                  label="Undo"
                  onClick={() =>
                    toast({body: 'Item restored', isAutoHide: false})
                  }
                  size="sm"
                  variant="onSolid"
                />
              ),
              isAutoHide: false,
            })
          }
        />
      );
    }

    render(
      <ToastViewport>
        <Fixture />
      </ToastViewport>,
    );
    await user.click(screen.getByRole('button', {name: 'Show'}));
    const undo = screen.getByRole('button', {hidden: true, name: 'Undo'});
    await user.click(undo);

    expect(screen.getByText('Item restored')).toBeInTheDocument();
    expect(undo).toHaveFocus();
  });
});

describe('ToastViewport modal hosting', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * An app with a toast trigger and two dialogs, the second opened from inside
   * the first. Every control stays reachable from the test even though a real
   * modal would make the page behind it inert.
   */
  function ModalApp({
    toastOptions,
  }: {
    toastOptions?: Partial<ToastOptions>;
  }): React.JSX.Element {
    const toast = useToast();
    const [isOuterOpen, setIsOuterOpen] = useState(false);
    const [isInnerOpen, setIsInnerOpen] = useState(false);
    const showToast = (body: string): void => {
      toast({body, isAutoHide: false, ...toastOptions});
    };
    return (
      <>
        <Button label="Show before" onClick={() => showToast('Before')} />
        <Button label="Open outer" onClick={() => setIsOuterOpen(true)} />
        <Button label="Close outer" onClick={() => setIsOuterOpen(false)} />
        <Button label="Open inner" onClick={() => setIsInnerOpen(true)} />
        <Button label="Close inner" onClick={() => setIsInnerOpen(false)} />
        <Dialog
          data-testid="outer"
          isOpen={isOuterOpen}
          label="Outer"
          onOpenChange={setIsOuterOpen}>
          <Button label="Show inside" onClick={() => showToast('Inside')} />
          <Dialog
            data-testid="inner"
            isOpen={isInnerOpen}
            label="Inner"
            onOpenChange={setIsInnerOpen}>
            Inner content
          </Dialog>
        </Dialog>
      </>
    );
  }

  function click(name: string): void {
    fireEvent.click(screen.getByRole('button', {hidden: true, name}));
  }

  function getViewport(): HTMLElement {
    return screen.getByTestId('viewport');
  }

  function spyOnPopoverEvents(): {events: string[]} {
    const events: string[] = [];
    vi.spyOn(HTMLElement.prototype, 'hidePopover').mockImplementation(() => {
      events.push('hide');
    });
    vi.spyOn(HTMLElement.prototype, 'showPopover').mockImplementation(() => {
      events.push('show');
    });
    return {events};
  }

  async function openAndWaitForHost(name: string, hostTestId: string) {
    click(name);
    await waitFor(() =>
      expect(screen.getByTestId(hostTestId)).toContainElement(getViewport()),
    );
  }

  // jsdom has no inertness, so containment in the active modal is the
  // observable part of staying operable above it.
  it('moves into the active modal and back out as dialogs open and close', async () => {
    render(
      <ToastViewport data-testid="viewport">
        <ModalApp />
      </ToastViewport>,
    );
    expect(screen.getByTestId('outer')).not.toContainElement(getViewport());

    await openAndWaitForHost('Open outer', 'outer');
    await openAndWaitForHost('Open inner', 'inner');

    click('Close inner');
    await waitFor(() =>
      expect(screen.getByTestId('inner')).not.toContainElement(getViewport()),
    );
    expect(screen.getByTestId('outer')).toContainElement(getViewport());

    click('Close outer');
    await waitFor(() =>
      expect(screen.getByTestId('outer')).not.toContainElement(getViewport()),
    );
  });

  it('keeps its element and toasts, and re-shows the popover, when it moves', async () => {
    const show = vi.spyOn(HTMLElement.prototype, 'showPopover');
    render(
      <ToastViewport data-testid="viewport">
        <ModalApp />
      </ToastViewport>,
    );
    click('Show before');
    const viewport = getViewport();
    show.mockClear();

    await openAndWaitForHost('Open outer', 'outer');

    expect(getViewport()).toBe(viewport);
    expect(viewport).toHaveTextContent('Before');
    expect(show.mock.contexts).toContain(viewport);
  });

  it('does not remount toast content when it moves', async () => {
    const onMount = vi.fn();
    function MountProbe(): React.JSX.Element {
      useEffect(() => {
        onMount();
      }, []);
      return <span>probe</span>;
    }
    render(
      <ToastViewport data-testid="viewport">
        <ModalApp toastOptions={{endContent: <MountProbe />}} />
      </ToastViewport>,
    );
    click('Show before');
    expect(onMount).toHaveBeenCalledTimes(1);

    await openAndWaitForHost('Open outer', 'outer');
    click('Close outer');
    await waitFor(() =>
      expect(screen.getByTestId('outer')).not.toContainElement(getViewport()),
    );

    expect(onMount).toHaveBeenCalledTimes(1);
  });

  it('keeps counting down a toast through a move', async () => {
    vi.useFakeTimers();
    render(
      <ToastViewport data-testid="viewport">
        <ModalApp toastOptions={{autoHideDuration: 5000, isAutoHide: true}} />
      </ToastViewport>,
    );

    click('Show before');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    click('Open outer');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(screen.getByTestId('outer')).toContainElement(getViewport());
    expect(getViewport()).toHaveTextContent('Before');

    // A restarted timer would keep the toast for another 5000ms.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2500);
    });
    expect(getViewport()).not.toHaveTextContent('Before');
  });

  // Hiding the popover to re-raise it blurs whatever was focused inside it.
  it('keeps focus on a toast action inside a dialog that shows another toast', async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLElement.prototype, 'hidePopover').mockImplementation(function (
      this: HTMLElement,
    ) {
      // eslint-disable-next-line testing-library/no-node-access -- the mock stands in for the browser's own blur on hide
      const active = document.activeElement;
      if (active instanceof HTMLElement && this.contains(active)) {
        active.blur();
      }
    });
    function App(): React.JSX.Element {
      const toast = useToast();
      return (
        <Dialog isOpen label="Edit" onOpenChange={() => {}}>
          <Button
            label="Delete"
            onClick={() =>
              toast({
                body: 'Item deleted',
                endContent: (
                  <Button
                    label="Undo"
                    onClick={() =>
                      toast({body: 'Item restored', isAutoHide: false})
                    }
                    size="sm"
                    variant="onSolid"
                  />
                ),
                isAutoHide: false,
              })
            }
          />
        </Dialog>
      );
    }
    render(
      <ToastViewport data-testid="viewport">
        <App />
      </ToastViewport>,
    );
    await waitFor(() =>
      expect(screen.getByRole('dialog', {hidden: true})).toContainElement(
        getViewport(),
      ),
    );

    await user.click(
      screen.getByRole('button', {hidden: true, name: 'Delete'}),
    );
    const undo = screen.getByRole('button', {hidden: true, name: 'Undo'});
    await user.click(undo);

    expect(screen.getByText('Item restored')).toBeInTheDocument();
    expect(undo).toHaveFocus();
  });

  // A moved node restarts from @starting-style. The Toast recipe skips its
  // entry under [data-toast-skip-entry], which must be present while the
  // browser resolves the moved toasts' styles and gone afterwards.
  it('skips the entry transition for toasts it moves', async () => {
    render(
      <ToastViewport data-testid="viewport">
        <ModalApp />
      </ToastViewport>,
    );
    click('Show before');
    const viewport = getViewport();
    const skipEntryDuringLayout: boolean[] = [];
    vi.spyOn(viewport, 'getBoundingClientRect').mockImplementation(() => {
      skipEntryDuringLayout.push(
        // eslint-disable-next-line testing-library/no-node-access -- the attribute sits on the viewport's untracked container
        viewport.closest('[data-toast-skip-entry]') != null,
      );
      return new DOMRect();
    });

    await openAndWaitForHost('Open outer', 'outer');

    expect(skipEntryDuringLayout).toEqual([true]);
    // ...and the Toast recipe carries the rule that the attribute switches on.
    expect(
      screen
        .getAllByRole('status', {hidden: true})
        .find(element => element.textContent.includes('Before'))?.className,
    ).toContain('[[data-toast-skip-entry]_&]:[@starting-style]:silver-op_1');
    // eslint-disable-next-line testing-library/no-node-access -- the attribute sits on the viewport's untracked container
    expect(viewport.closest('[data-toast-skip-entry]')).toBeNull();
  });

  it('stays put, and below, when a dialog opened from inside a toast becomes active', async () => {
    function ShowFromDetails(): React.JSX.Element {
      const toast = useToast();
      return (
        <Button
          label="Show from details"
          onClick={() => toast({body: 'From details', isAutoHide: false})}
        />
      );
    }
    function DetailsAction(): React.JSX.Element {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button label="Details" onClick={() => setIsOpen(true)} size="sm" />
          <Dialog
            data-testid="details"
            isOpen={isOpen}
            label="Details"
            onOpenChange={setIsOpen}>
            <ShowFromDetails />
          </Dialog>
        </>
      );
    }
    render(
      <ToastViewport data-testid="viewport">
        <ModalApp toastOptions={{endContent: <DetailsAction />}} />
      </ToastViewport>,
    );
    await openAndWaitForHost('Open outer', 'outer');
    click('Show inside');

    const {events} = spyOnPopoverEvents();

    // The viewport cannot move into its own descendant; it stays in the outer
    // dialog, where the details dialog it contains is not inert.
    click('Details');
    await waitFor(() =>
      expect(screen.getByTestId('details')).toHaveAttribute('open'),
    );
    expect(screen.getByTestId('outer')).toContainElement(getViewport());
    expect(getViewport()).toContainElement(screen.getByTestId('details'));

    // Nor does it re-raise above the details dialog, which the user is using,
    // when the stack changes or a new toast is shown.
    click('Show from details');
    expect(getViewport()).toHaveTextContent('From details');
    expect(events).toEqual([]);
  });

  // Dialog answers a platform close it did not initiate by reopening, which
  // puts the dialog back above everything, including the viewport inside it.
  it('re-enters the top layer when its host dialog reopens', async () => {
    render(
      <ToastViewport data-testid="viewport">
        <ModalApp />
      </ToastViewport>,
    );
    await openAndWaitForHost('Open outer', 'outer');
    const outer = screen.getByTestId<HTMLDialogElement>('outer');
    const {events} = spyOnPopoverEvents();

    outer.close();
    fireEvent(outer, new Event('close'));

    await waitFor(() => expect(events).toEqual(['hide', 'show']));
    expect(outer).toContainElement(getViewport());
  });

  it('does not dismiss the dialog when a toast inside it is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function App(): React.JSX.Element {
      const toast = useToast();
      return (
        <Dialog isOpen label="Edit" onOpenChange={onOpenChange}>
          <Button
            label="Show inside"
            onClick={() => toast({body: 'Inside', isAutoHide: false})}
          />
        </Dialog>
      );
    }
    render(
      <ToastViewport data-testid="viewport">
        <App />
      </ToastViewport>,
    );
    await waitFor(() =>
      expect(screen.getByRole('dialog', {hidden: true})).toContainElement(
        getViewport(),
      ),
    );

    await user.click(
      screen.getByRole('button', {hidden: true, name: 'Show inside'}),
    );
    await user.click(
      screen.getByRole('button', {hidden: true, name: 'Dismiss notification'}),
    );

    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('stays in place when isTopLayer is false', async () => {
    render(
      <ToastViewport data-testid="viewport" isTopLayer={false}>
        <ModalApp />
      </ToastViewport>,
    );

    click('Open outer');
    await waitFor(() =>
      expect(screen.getByTestId('outer')).toHaveAttribute('open'),
    );
    expect(screen.getByTestId('outer')).not.toContainElement(getViewport());
  });
});
