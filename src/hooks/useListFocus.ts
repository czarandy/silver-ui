'use client';

import {useCallback, useMemo} from 'react';
import useLatest from 'internal/useLatest';

/**
 * Which arrow keys move focus. `both` is for controls that are laid out in one
 * line but accept either axis, such as a segmented control.
 */
export type ListFocusOrientation = 'both' | 'horizontal' | 'vertical';

/**
 * The subset of `KeyboardEvent` that `useListFocus` reads. Both React's
 * synthetic keyboard event and the native DOM one satisfy it.
 */
export interface ListFocusKeyboardEvent {
  key: string;
  preventDefault: () => void;
}

export interface UseListFocusOptions {
  /**
   * The focusable items, in the order they are presented to the user. Items
   * that cannot be focused (disabled ones, typically) must be excluded.
   */
  getItems: () => ReadonlyArray<HTMLElement>;
  /**
   * Whether moving past either end wraps around to the other end.
   * @default true
   */
  isLooping?: boolean;
  /**
   * Whether the list is laid out right-to-left, which swaps the meaning of
   * `ArrowLeft` and `ArrowRight`.
   * @default false
   */
  isRtl?: boolean;
  /**
   * Called after an item receives focus. Use it to implement
   * selection-follows-focus.
   */
  onFocusItem?: (item: HTMLElement, index: number) => void;
  /**
   * @default 'vertical'
   */
  orientation?: ListFocusOrientation;
}

export interface UseListFocusResult {
  /**
   * Focuses the item at `index`, returning it, or `null` when the index is out
   * of range.
   */
  focusItemAt: (index: number) => HTMLElement | null;
  /**
   * Index of the focused item within `getItems()`, or `-1` when focus is
   * elsewhere.
   */
  getActiveIndex: () => number;
  /**
   * The items passed to the hook, re-read on every call.
   */
  getItems: () => ReadonlyArray<HTMLElement>;
  /**
   * Handles `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`/`Home`/`End`.
   * Returns `true` when the key was consumed (in which case `preventDefault`
   * has been called), letting the caller fall through to its other key handling
   * otherwise.
   */
  handleKeyDown: (event: ListFocusKeyboardEvent) => boolean;
}

type Move = 'first' | 'last' | 'next' | 'previous';

function getMove(
  key: string,
  orientation: ListFocusOrientation,
  isRtl: boolean,
): Move | null {
  switch (key) {
    case 'ArrowDown':
      return orientation === 'horizontal' ? null : 'next';
    case 'ArrowLeft':
      return orientation === 'vertical' ? null : isRtl ? 'next' : 'previous';
    case 'ArrowRight':
      return orientation === 'vertical' ? null : isRtl ? 'previous' : 'next';
    case 'ArrowUp':
      return orientation === 'horizontal' ? null : 'previous';
    case 'End':
      return 'last';
    case 'Home':
      return 'first';
    default:
      return null;
  }
}

function getNextIndex(
  move: Move,
  activeIndex: number,
  count: number,
  isLooping: boolean,
): number {
  switch (move) {
    case 'first':
      return 0;
    case 'last':
      return count - 1;
    case 'next': {
      // With nothing focused, the first item is "next".
      const next = activeIndex === -1 ? 0 : activeIndex + 1;
      return isLooping ? next % count : Math.min(next, count - 1);
    }
    case 'previous': {
      const previous = activeIndex === -1 ? count - 1 : activeIndex - 1;
      return isLooping ? (previous + count) % count : Math.max(previous, 0);
    }
  }
}

/**
 * Roving-tabindex keyboard navigation over a list of DOM elements: arrow keys
 * move focus along the list, `Home`/`End` jump to either end, and focus wraps
 * around by default.
 *
 * The hook moves DOM focus; the caller still decides which item is the tab stop
 * (`tabIndex={isActive ? 0 : -1}`), since that is usually the selected item
 * rather than the focused one.
 *
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const {handleKeyDown} = useListFocus({
 *   getItems: () =>
 *     Array.from(
 *       containerRef.current?.querySelectorAll<HTMLElement>(
 *         '[role="tab"]:not([aria-disabled="true"])',
 *       ) ?? [],
 *     ),
 *   orientation: 'horizontal',
 * });
 *
 * <div onKeyDown={handleKeyDown} ref={containerRef} role="tablist" />
 * ```
 */
const useListFocus = ({
  getItems,
  isLooping = true,
  isRtl = false,
  onFocusItem,
  orientation = 'vertical',
}: UseListFocusOptions): UseListFocusResult => {
  const optionsRef = useLatest({
    getItems,
    isLooping,
    isRtl,
    onFocusItem,
    orientation,
  });

  const getCurrentItems = useCallback(
    () => optionsRef.current.getItems(),
    [optionsRef],
  );

  const getActiveIndex = useCallback(
    () =>
      optionsRef.current
        .getItems()
        .findIndex(item => item === document.activeElement),
    [optionsRef],
  );

  const focusItemAt = useCallback(
    (index: number) => {
      const {getItems, onFocusItem} = optionsRef.current;
      const item = getItems()[index] as HTMLElement | undefined;
      if (item == null) {
        return null;
      }
      item.focus();
      onFocusItem?.(item, index);
      return item;
    },
    [optionsRef],
  );

  const handleKeyDown = useCallback(
    (event: ListFocusKeyboardEvent) => {
      const {getItems, isLooping, isRtl, onFocusItem, orientation} =
        optionsRef.current;
      const move = getMove(event.key, orientation, isRtl);
      if (move == null) {
        return false;
      }

      // One getItems() snapshot serves the whole keypress; getItems is often
      // a live DOM query, and the DOM cannot change mid-event.
      const items = getItems();
      if (items.length === 0) {
        return false;
      }

      event.preventDefault();
      const activeIndex = items.findIndex(
        item => item === document.activeElement,
      );
      const index = getNextIndex(move, activeIndex, items.length, isLooping);
      const item = items[index] as HTMLElement | undefined;
      if (item != null) {
        item.focus();
        onFocusItem?.(item, index);
      }
      return true;
    },
    [optionsRef],
  );

  return useMemo(
    () => ({
      focusItemAt,
      getActiveIndex,
      getItems: getCurrentItems,
      handleKeyDown,
    }),
    [focusItemAt, getActiveIndex, getCurrentItems, handleKeyDown],
  );
};

export default useListFocus;
