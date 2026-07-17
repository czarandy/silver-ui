import {fireEvent, render, renderHook, screen} from '@testing-library/react';
import {useRef} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import useHotkey, {
  type HotkeyHandler,
  type UseHotkeyOptions,
} from 'hooks/useHotkey';

function dispatchKey(
  target: EventTarget,
  key: string,
  init: KeyboardEventInit = {},
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

function Hotkey({
  handler,
  keys = 'k',
  options,
}: {
  handler: HotkeyHandler;
  keys?: string;
  options?: UseHotkeyOptions;
}): null {
  useHotkey(keys, handler, options);
  return null;
}

describe('useHotkey', () => {
  const originalPlatform = navigator.platform;

  afterEach(() => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: originalPlatform,
    });
    vi.restoreAllMocks();
  });

  it('listens on document by default and normalizes case and whitespace', () => {
    const handler = vi.fn();
    renderHook(() => useHotkey('  SHIFT + K ', handler));

    fireEvent.keyDown(document, {key: 'K', shiftKey: true});

    expect(handler).toHaveBeenCalledOnce();
  });

  it('requires bare keys and modifiers to match exactly', () => {
    const bareHandler = vi.fn();
    const modifiedHandler = vi.fn();
    render(
      <>
        <Hotkey handler={bareHandler} />
        <Hotkey handler={modifiedHandler} keys="ctrl+alt+shift+k" />
      </>,
    );

    fireEvent.keyDown(document, {ctrlKey: true, key: 'k'});
    fireEvent.keyDown(document, {
      altKey: true,
      ctrlKey: true,
      key: 'k',
      shiftKey: true,
    });

    expect(bareHandler).not.toHaveBeenCalled();
    expect(modifiedHandler).toHaveBeenCalledOnce();
  });

  it('resolves mod to Command on Apple platforms', () => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'MacIntel',
    });
    const handler = vi.fn();
    renderHook(() => useHotkey('mod+k', handler));

    fireEvent.keyDown(document, {ctrlKey: true, key: 'k'});
    fireEvent.keyDown(document, {key: 'k', metaKey: true});

    expect(handler).toHaveBeenCalledOnce();
  });

  it('resolves mod to Control on non-Apple platforms', () => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'Win32',
    });
    const handler = vi.fn();
    renderHook(() => useHotkey('mod+k', handler));

    fireEvent.keyDown(document, {key: 'k', metaKey: true});
    fireEvent.keyDown(document, {ctrlKey: true, key: 'k'});

    expect(handler).toHaveBeenCalledOnce();
  });

  it.each([
    ['enter', 'Enter'],
    ['backspace', 'Backspace'],
    ['escape', 'Escape'],
    ['tab', 'Tab'],
    ['up', 'ArrowUp'],
    ['down', 'ArrowDown'],
    ['left', 'ArrowLeft'],
    ['right', 'ArrowRight'],
    ['plus', '+'],
  ])('matches the %s special-key alias', (keys, key) => {
    const handler = vi.fn();
    const {unmount} = renderHook(() => useHotkey(keys, handler));

    fireEvent.keyDown(document, {key});

    expect(handler).toHaveBeenCalledOnce();
    unmount();
  });

  it('only prevents default for accepted matches when requested', () => {
    const handler = vi.fn();
    renderHook(() =>
      useHotkey('k', handler, {
        preventDefault: true,
      }),
    );

    const wrongEvent = dispatchKey(document, 'j');
    const match = dispatchKey(document, 'k');

    expect(wrongEvent.defaultPrevented).toBe(false);
    expect(match.defaultPrevented).toBe(true);
    expect(handler).toHaveBeenCalledWith(match);
  });

  it('leaves matched events unsuppressed by default', () => {
    const handler = vi.fn();
    renderHook(() => useHotkey('k', handler));

    const event = dispatchKey(document, 'k');

    expect(event.defaultPrevented).toBe(false);
    expect(handler).toHaveBeenCalledOnce();
  });

  it('leaves repeat and default-prevented policy to the handler', () => {
    const handler = vi.fn();
    renderHook(() => useHotkey('k', handler));

    const preventedEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'k',
    });
    preventedEvent.preventDefault();
    document.dispatchEvent(preventedEvent);
    const repeatEvent = dispatchKey(document, 'k', {repeat: true});

    expect(handler.mock.calls).toEqual([[preventedEvent], [repeatEvent]]);
  });

  it('always ignores native composition and Safari keyCode 229 events', () => {
    const handler = vi.fn();
    renderHook(() => useHotkey('k', handler, {preventDefault: true}));

    const composingEvent = dispatchKey(document, 'k', {isComposing: true});
    const safariEvent = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'k',
    });
    Object.defineProperty(safariEvent, 'keyCode', {value: 229});
    document.dispatchEvent(safariEvent);

    expect(handler).not.toHaveBeenCalled();
    expect(composingEvent.defaultPrevented).toBe(false);
    expect(safariEvent.defaultPrevented).toBe(false);
  });

  it('ignores form controls, editable content, and textbox roles by default', () => {
    const handler = vi.fn();
    render(
      <>
        <Hotkey handler={handler} />
        <input aria-label="input" />
        <select aria-label="select" />
        <textarea aria-label="textarea" />
        <div contentEditable suppressContentEditableWarning>
          <span data-testid="editable-child">Editable</span>
        </div>
        <div role="textbox">
          <span data-testid="textbox-child">Textbox</span>
        </div>
      </>,
    );

    for (const target of [
      screen.getByRole('textbox', {name: 'input'}),
      screen.getByRole('combobox', {name: 'select'}),
      screen.getByRole('textbox', {name: 'textarea'}),
      screen.getByTestId('editable-child'),
      screen.getByTestId('textbox-child'),
    ]) {
      fireEvent.keyDown(target, {key: 'k'});
    }

    expect(handler).not.toHaveBeenCalled();
  });

  it('can be enabled on form elements', () => {
    const handler = vi.fn();
    render(
      <>
        <Hotkey handler={handler} options={{enableOnFormElements: true}} />
        <input aria-label="input" />
      </>,
    );

    fireEvent.keyDown(screen.getByRole('textbox', {name: 'input'}), {key: 'k'});

    expect(handler).toHaveBeenCalledOnce();
  });

  it('supports window and ref targets', () => {
    const windowHandler = vi.fn();
    const refHandler = vi.fn();

    const targetRef = {current: null as HTMLDivElement | null};
    function StableFixture(): React.JSX.Element {
      useHotkey('r', refHandler, {target: targetRef});
      return <div data-testid="target" ref={targetRef} />;
    }

    render(
      <>
        <Hotkey handler={windowHandler} keys="w" options={{target: 'window'}} />
        <StableFixture />
      </>,
    );

    fireEvent.keyDown(window, {key: 'w'});
    fireEvent.keyDown(screen.getByTestId('target'), {key: 'r'});

    expect(windowHandler).toHaveBeenCalledOnce();
    expect(refHandler).toHaveBeenCalledOnce();
  });

  it('re-resolves ref targets that mount conditionally or change', () => {
    const handler = vi.fn();
    function Fixture({
      target,
    }: {
      target: 'first' | 'second';
    }): React.JSX.Element {
      const firstRef = useRef<HTMLDivElement>(null);
      const secondRef = useRef<HTMLDivElement>(null);
      useHotkey('k', handler, {
        target: target === 'second' ? secondRef : firstRef,
      });
      return (
        <>
          <div data-testid="first" ref={firstRef} />
          {target === 'second' ? (
            <div data-testid="second" ref={secondRef} />
          ) : null}
        </>
      );
    }

    const {rerender} = render(<Fixture target="first" />);
    const first = screen.getByTestId('first');
    fireEvent.keyDown(first, {key: 'k'});
    rerender(<Fixture target="second" />);
    fireEvent.keyDown(first, {key: 'k'});
    fireEvent.keyDown(screen.getByTestId('second'), {key: 'k'});

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('uses the latest handler and options after rerender', () => {
    const firstHandler = vi.fn();
    const nextHandler = vi.fn();
    const {rerender} = render(
      <Hotkey handler={firstHandler} options={{preventDefault: false}} />,
    );

    fireEvent.keyDown(document, {key: 'k'});
    rerender(<Hotkey handler={nextHandler} options={{preventDefault: true}} />);
    const event = dispatchKey(document, 'k');

    expect(firstHandler).toHaveBeenCalledOnce();
    expect(nextHandler).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  it('cleans up on disable and unmount', () => {
    const handler = vi.fn();
    const {rerender, unmount} = render(
      <Hotkey handler={handler} options={{isEnabled: true}} />,
    );

    fireEvent.keyDown(document, {key: 'k'});
    rerender(<Hotkey handler={handler} options={{isEnabled: false}} />);
    fireEvent.keyDown(document, {key: 'k'});
    rerender(<Hotkey handler={handler} options={{isEnabled: true}} />);
    fireEvent.keyDown(document, {key: 'k'});
    unmount();
    fireEvent.keyDown(document, {key: 'k'});

    expect(handler).toHaveBeenCalledTimes(2);
  });

  it.each(['', 'mod+shift'])(
    'rejects descriptors without a primary key',
    keys => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => renderHook(() => useHotkey(keys, vi.fn()))).toThrow(
        'must include exactly one non-modifier key',
      );

      errorSpy.mockRestore();
    },
  );

  it('rejects descriptors with multiple primary keys', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useHotkey('g+i', vi.fn()))).toThrow(
      'key sequences are not supported',
    );

    errorSpy.mockRestore();
  });
});
