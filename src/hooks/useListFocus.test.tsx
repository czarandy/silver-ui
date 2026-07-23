/* eslint-disable testing-library/no-node-access -- the harness components below query their own subtree exactly as a real caller of useListFocus would */
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useCallback, useRef, type KeyboardEvent} from 'react';
import {describe, expect, it, vi} from 'vitest';
import useListFocus, {type UseListFocusOptions} from 'hooks/useListFocus';

const ITEMS = ['One', 'Two', 'Three'];

interface ListProps extends Omit<UseListFocusOptions, 'getItems'> {
  items?: ReadonlyArray<string>;
  /**
   * Called with `true` when `handleKeyDown` consumed the key. Stands in for the
   * caller's fallback key handling.
   */
  onKeyHandled?: (isHandled: boolean) => void;
}

function List({
  items = ITEMS,
  onKeyHandled,
  ...options
}: ListProps): React.JSX.Element {
  const listRef = useRef<HTMLDivElement>(null);
  const getItems = useCallback(
    () =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLElement>(
          'button:not([aria-disabled="true"])',
        ) ?? [],
      ),
    [],
  );
  const {handleKeyDown} = useListFocus({getItems, ...options});

  return (
    <div
      aria-label="List"
      onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
        const isHandled = handleKeyDown(event);
        onKeyHandled?.(isHandled);
      }}
      ref={listRef}
      role="toolbar"
      tabIndex={-1}>
      {items.map(item => (
        <button aria-disabled={item === 'Skip'} key={item} type="button">
          {item}
        </button>
      ))}
    </div>
  );
}

function focusedName(): string | null {
  return document.activeElement?.textContent ?? null;
}

describe('useListFocus', () => {
  it('moves focus with the vertical arrow keys by default', async () => {
    const user = userEvent.setup();
    render(<List />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{ArrowDown}');
    expect(focusedName()).toBe('Two');

    await user.keyboard('{ArrowUp}');
    expect(focusedName()).toBe('One');
  });

  it('wraps around both ends by default', async () => {
    const user = userEvent.setup();
    render(<List />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{ArrowUp}');
    expect(focusedName()).toBe('Three');

    await user.keyboard('{ArrowDown}');
    expect(focusedName()).toBe('One');
  });

  it('clamps at both ends when looping is disabled', async () => {
    const user = userEvent.setup();
    render(<List isLooping={false} />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{ArrowUp}');
    expect(focusedName()).toBe('One');

    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(focusedName()).toBe('Three');
  });

  it('jumps to either end with Home and End', async () => {
    const user = userEvent.setup();
    render(<List />);

    screen.getByRole('button', {name: 'Two'}).focus();

    await user.keyboard('{End}');
    expect(focusedName()).toBe('Three');

    await user.keyboard('{Home}');
    expect(focusedName()).toBe('One');
  });

  it('ignores the cross-axis arrows for a vertical list', async () => {
    const user = userEvent.setup();
    const onKeyHandled = vi.fn();
    render(<List onKeyHandled={onKeyHandled} />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{ArrowRight}{ArrowLeft}');

    expect(focusedName()).toBe('One');
    expect(onKeyHandled).toHaveBeenCalledTimes(2);
    expect(onKeyHandled).toHaveBeenNthCalledWith(1, false);
    expect(onKeyHandled).toHaveBeenNthCalledWith(2, false);
  });

  it('ignores the cross-axis arrows for a horizontal list', async () => {
    const user = userEvent.setup();
    render(<List orientation="horizontal" />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{ArrowDown}');
    expect(focusedName()).toBe('One');

    await user.keyboard('{ArrowRight}');
    expect(focusedName()).toBe('Two');
  });

  it('navigates on either axis when the orientation is both', async () => {
    const user = userEvent.setup();
    render(<List orientation="both" />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{ArrowRight}');
    expect(focusedName()).toBe('Two');

    await user.keyboard('{ArrowDown}');
    expect(focusedName()).toBe('Three');

    await user.keyboard('{ArrowLeft}');
    expect(focusedName()).toBe('Two');

    await user.keyboard('{ArrowUp}');
    expect(focusedName()).toBe('One');
  });

  it('swaps the horizontal arrows in a right-to-left list', async () => {
    const user = userEvent.setup();
    render(<List isRtl orientation="horizontal" />);

    screen.getByRole('button', {name: 'Two'}).focus();

    await user.keyboard('{ArrowLeft}');
    expect(focusedName()).toBe('Three');

    await user.keyboard('{ArrowRight}');
    expect(focusedName()).toBe('Two');
  });

  it('detects an inherited right-to-left direction from the event target', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <List orientation="horizontal" />
      </div>,
    );

    screen.getByRole('button', {name: 'Two'}).focus();

    await user.keyboard('{ArrowLeft}');
    expect(focusedName()).toBe('Three');

    await user.keyboard('{ArrowRight}');
    expect(focusedName()).toBe('Two');
  });

  it('honors an explicit direction override', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <List isRtl={false} orientation="horizontal" />
      </div>,
    );

    screen.getByRole('button', {name: 'Two'}).focus();

    await user.keyboard('{ArrowRight}');
    expect(focusedName()).toBe('Three');
  });

  it('skips items that getItems excludes', async () => {
    const user = userEvent.setup();
    render(<List items={['One', 'Skip', 'Three']} />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{ArrowDown}');
    expect(focusedName()).toBe('Three');
  });

  it('enters the list from the near end when no item is focused', async () => {
    const user = userEvent.setup();
    const {unmount} = render(<List />);

    screen.getByRole('toolbar').focus();
    await user.keyboard('{ArrowDown}');
    expect(focusedName()).toBe('One');

    unmount();
    render(<List />);

    screen.getByRole('toolbar').focus();
    await user.keyboard('{ArrowUp}');
    expect(focusedName()).toBe('Three');
  });

  it('reports keys it does not handle', async () => {
    const user = userEvent.setup();
    const onKeyHandled = vi.fn();
    render(<List onKeyHandled={onKeyHandled} />);

    screen.getByRole('button', {name: 'One'}).focus();

    await user.keyboard('{Escape}');
    expect(onKeyHandled).toHaveBeenCalledWith(false);

    onKeyHandled.mockClear();
    await user.keyboard('{ArrowDown}');
    expect(onKeyHandled).toHaveBeenCalledWith(true);
  });

  it('does not consume keys when the list is empty', async () => {
    const user = userEvent.setup();
    const onKeyHandled = vi.fn();
    render(<List items={[]} onKeyHandled={onKeyHandled} />);

    screen.getByRole('toolbar').focus();
    await user.keyboard('{ArrowDown}');

    expect(onKeyHandled).toHaveBeenCalledWith(false);
  });

  it('calls onFocusItem with the newly focused item', async () => {
    const user = userEvent.setup();
    const onFocusItem = vi.fn();
    render(<List onFocusItem={onFocusItem} />);

    screen.getByRole('button', {name: 'One'}).focus();
    await user.keyboard('{ArrowDown}');

    expect(onFocusItem).toHaveBeenCalledTimes(1);
    expect(onFocusItem).toHaveBeenCalledWith(
      screen.getByRole('button', {name: 'Two'}),
      1,
    );
  });

  it('exposes the active index and imperative focus', async () => {
    const user = userEvent.setup();
    let activeIndex = -1;

    function Probe(): React.JSX.Element {
      const listRef = useRef<HTMLDivElement>(null);
      const getItems = useCallback(
        () => Array.from(listRef.current?.querySelectorAll('button') ?? []),
        [],
      );
      const {focusItemAt, getActiveIndex} = useListFocus({getItems});

      return (
        <div ref={listRef}>
          {ITEMS.map(item => (
            <button key={item} type="button">
              {item}
            </button>
          ))}
          <button
            onClick={() => {
              focusItemAt(2);
              activeIndex = getActiveIndex();
            }}
            type="button">
            Focus last
          </button>
        </div>
      );
    }

    render(<Probe />);
    await user.click(screen.getByRole('button', {name: 'Focus last'}));

    expect(focusedName()).toBe('Three');
    expect(activeIndex).toBe(2);
  });

  it('returns null when focusing an out-of-range index', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();

    function Probe(): React.JSX.Element {
      const {focusItemAt} = useListFocus({getItems: () => []});
      return (
        <button
          onClick={() => {
            onResult(focusItemAt(0));
          }}
          type="button">
          Focus
        </button>
      );
    }

    render(<Probe />);
    await user.click(screen.getByRole('button', {name: 'Focus'}));

    expect(onResult).toHaveBeenCalledWith(null);
  });
});
