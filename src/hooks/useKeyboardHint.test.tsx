/* eslint-disable testing-library/no-container, testing-library/no-node-access -- the hint is aria-hidden by design, so it is unreachable through role or text queries and has to be found in the DOM */
import {fireEvent, render, screen} from '@testing-library/react';
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import useKeyboardHint, {
  type UseKeyboardHintOptions,
} from 'hooks/useKeyboardHint';
import {assertNonNull, createPopoverFocusShim} from 'internal/testHelpers';

const shim = createPopoverFocusShim();

beforeAll(shim.install);
afterAll(shim.uninstall);
beforeEach(shim.reset);

function Harness(options: UseKeyboardHintOptions = {}): React.JSX.Element {
  const hint = useKeyboardHint(options);
  return (
    <div>
      <div
        data-testid="group"
        onBlur={hint.onBlur}
        onFocus={hint.onFocus}
        onKeyDown={hint.onKeyDown}
        role="tablist">
        <button role="tab" type="button">
          One
        </button>
        <button role="tab" type="button">
          Two
        </button>
        {hint.hintElement}
      </div>
      <button type="button">Outside</button>
    </div>
  );
}

function renderHarness(options: UseKeyboardHintOptions = {}) {
  const view = render(<Harness {...options} />);
  const getHint = () =>
    assertNonNull(
      view.container.querySelector<HTMLElement>('[popover="manual"]'),
      'hint layer should always be rendered',
    );
  return {...view, getHint};
}

/**
 * Reads the arrow glyphs the hint is currently drawing, in order.
 */
function getArrowGlyphs(container: HTMLElement): string[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('kbd[aria-label]'),
  ).map(key => key.textContent);
}

/**
 * `useLayer` anchors by stamping `anchorName` onto the element the hint points
 * at, which is the only trace of re-anchoring visible in jsdom.
 */
function getAnchorName(element: HTMLElement): string {
  const style = element.style as unknown as Record<string, string | undefined>;
  return style.anchorName ?? '';
}

describe('useKeyboardHint', () => {
  it('shows the hint when keyboard focus enters the container', () => {
    renderHarness();

    fireEvent.focus(screen.getByRole('tab', {name: 'One'}));

    expect(shim.showPopover).toHaveBeenCalledTimes(1);
  });

  it('does not show the hint for pointer focus', () => {
    shim.setFocusVisible(false);
    renderHarness();

    fireEvent.focus(screen.getByRole('tab', {name: 'One'}));

    expect(shim.showPopover).not.toHaveBeenCalled();
  });

  it('does not show the hint when disabled', () => {
    renderHarness({isEnabled: false});

    fireEvent.focus(screen.getByRole('tab', {name: 'One'}));

    expect(shim.showPopover).not.toHaveBeenCalled();
  });

  it('follows focus to the item it points at, without dismissing', () => {
    renderHarness();
    const first = screen.getByRole('tab', {name: 'One'});
    const second = screen.getByRole('tab', {name: 'Two'});

    fireEvent.focus(first);
    expect(getAnchorName(first)).not.toBe('');

    fireEvent.blur(first, {relatedTarget: second});
    fireEvent.focus(second, {relatedTarget: first});

    expect(getAnchorName(second)).not.toBe('');
    expect(getAnchorName(first)).toBe('');
    expect(shim.showPopover).toHaveBeenCalledTimes(1);
    expect(shim.hidePopover).not.toHaveBeenCalled();
  });

  it.each(['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp'])(
    'dismisses the hint on %s',
    key => {
      renderHarness();
      fireEvent.focus(screen.getByRole('tab', {name: 'One'}));

      fireEvent.keyDown(screen.getByTestId('group'), {key});

      expect(shim.hidePopover).toHaveBeenCalledTimes(1);
    },
  );

  it('leaves the hint up for non-arrow keys', () => {
    renderHarness();
    fireEvent.focus(screen.getByRole('tab', {name: 'One'}));

    fireEvent.keyDown(screen.getByTestId('group'), {key: 'Enter'});

    expect(shim.hidePopover).not.toHaveBeenCalled();
  });

  it('dismisses the hint when focus leaves the container', () => {
    renderHarness();
    const first = screen.getByRole('tab', {name: 'One'});
    fireEvent.focus(first);

    fireEvent.blur(first, {relatedTarget: screen.getByText('Outside')});

    expect(shim.hidePopover).toHaveBeenCalledTimes(1);
  });

  it('does not re-show once dismissed', () => {
    renderHarness();
    const first = screen.getByRole('tab', {name: 'One'});

    fireEvent.focus(first);
    fireEvent.keyDown(screen.getByTestId('group'), {key: 'ArrowRight'});
    fireEvent.blur(first, {relatedTarget: screen.getByText('Outside')});
    fireEvent.focus(first);

    expect(shim.showPopover).toHaveBeenCalledTimes(1);
  });

  it('marks the hint aria-hidden so it stays out of the accessibility tree', () => {
    const {getHint} = renderHarness();

    expect(getHint()).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['horizontal' as const, ['←', '→']],
    ['vertical' as const, ['↑', '↓']],
    ['both' as const, ['←', '→', '↑', '↓']],
  ])('draws the %s arrows', (orientation, expected) => {
    const {container} = renderHarness({orientation});

    expect(getArrowGlyphs(container)).toEqual(expected);
  });

  describe('with fake timers', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('dismisses the hint after the timeout elapses', () => {
      renderHarness({dismissAfterMs: 3000});
      fireEvent.focus(screen.getByRole('tab', {name: 'One'}));

      vi.advanceTimersByTime(2999);
      expect(shim.hidePopover).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(shim.hidePopover).toHaveBeenCalledTimes(1);
    });

    it('does not restart the countdown when focus moves within the container', () => {
      renderHarness({dismissAfterMs: 3000});
      const first = screen.getByRole('tab', {name: 'One'});
      const second = screen.getByRole('tab', {name: 'Two'});
      fireEvent.focus(first);

      vi.advanceTimersByTime(2000);
      fireEvent.blur(first, {relatedTarget: second});
      fireEvent.focus(second, {relatedTarget: first});

      // The hint is ephemeral from the moment it appeared, not from the last
      // time focus moved, so the original deadline still stands.
      vi.advanceTimersByTime(1000);
      expect(shim.hidePopover).toHaveBeenCalledTimes(1);
    });

    it('clears the pending timeout on unmount', () => {
      const {unmount} = renderHarness({dismissAfterMs: 3000});
      fireEvent.focus(screen.getByRole('tab', {name: 'One'}));
      // Asserting on hidePopover would prove nothing here: the layer drops its
      // element ref on unmount, so hide() is a no-op either way. The leak we
      // care about is the timer itself.
      expect(vi.getTimerCount()).toBe(1);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
