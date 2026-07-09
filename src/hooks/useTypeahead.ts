'use client';

import {useCallback, useEffect, useRef} from 'react';
import useLatest from 'internal/useLatest';

/**
 * How long a typed character stays in the search buffer before the next
 * keystroke starts a fresh search.
 */
export const TYPEAHEAD_TIMEOUT_MS = 500;

/**
 * The subset of `KeyboardEvent` that `useTypeahead` reads. Both React's
 * synthetic keyboard event and the native DOM one satisfy it.
 */
export interface TypeaheadKeyboardEvent {
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  metaKey: boolean;
  preventDefault: () => void;
}

export interface UseTypeaheadOptions<TItem> {
  /**
   * Index of the currently active item within `getItems()`, or `-1` when
   * nothing is active. Searching resumes from just after it so that pressing a
   * character repeatedly cycles through the items that start with it.
   */
  getActiveIndex: () => number;
  /**
   * The items to search, in the order they are presented to the user.
   */
  getItems: () => ReadonlyArray<TItem>;
  /**
   * The text a user would type to reach `item`.
   */
  getLabel: (item: TItem) => string;
  /**
   * Called with the first item whose label starts with the typed text.
   */
  onMatch: (item: TItem, index: number) => void;
  /**
   * Milliseconds of inactivity after which the search buffer resets.
   * @default 500
   */
  timeout?: number;
}

/**
 * Handles a keydown event. Returns `true` when the key was consumed as
 * typeahead (in which case `preventDefault` has been called), letting the
 * caller fall through to its other key handling otherwise.
 */
export type TypeaheadKeyDownHandler = (
  event: TypeaheadKeyboardEvent,
) => boolean;

function isTypeaheadKey(event: TypeaheadKeyboardEvent): boolean {
  return (
    event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey
  );
}

function isAllSameCharacter(text: string): boolean {
  for (let index = 1; index < text.length; index += 1) {
    if (text[index] !== text[0]) {
      return false;
    }
  }
  return true;
}

/**
 * Single- and multi-character typeahead for a list of items, following the
 * WAI-ARIA authoring practices: characters typed in quick succession build up a
 * search string, the search wraps around the end of the list, and pressing the
 * same character repeatedly cycles through every item starting with it.
 *
 * ```tsx
 * const handleTypeahead = useTypeahead({
 *   getActiveIndex: () => items.findIndex(item => item.id === focusedId),
 *   getItems: () => items,
 *   getLabel: item => item.label,
 *   onMatch: item => focusItem(item.id),
 * });
 *
 * const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
 *   if (handleTypeahead(event)) {
 *     return;
 *   }
 *   // ...other keys
 * };
 * ```
 */
const useTypeahead = <TItem>({
  getActiveIndex,
  getItems,
  getLabel,
  onMatch,
  timeout = TYPEAHEAD_TIMEOUT_MS,
}: UseTypeaheadOptions<TItem>): TypeaheadKeyDownHandler => {
  const optionsRef = useLatest({getActiveIndex, getItems, getLabel, onMatch});
  const timeoutRef = useLatest(timeout);
  const searchRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return useCallback(
    (event: TypeaheadKeyboardEvent) => {
      if (!isTypeaheadKey(event)) {
        return false;
      }
      // Space activates the active item; it only counts as typeahead when it
      // continues an in-progress search (e.g. typing "new york").
      if (event.key === ' ' && searchRef.current === '') {
        return false;
      }

      const search = searchRef.current + event.key;
      searchRef.current = search;
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        searchRef.current = '';
        timerRef.current = null;
      }, timeoutRef.current);

      const {getActiveIndex, getItems, getLabel, onMatch} = optionsRef.current;
      const items = getItems();
      if (items.length === 0) {
        return false;
      }

      // "aaa" means "cycle through items starting with a", not "find an item
      // labelled aaa".
      const isRepeatedCharacter =
        search.length > 1 && isAllSameCharacter(search);
      const query = (
        isRepeatedCharacter ? search[0] : search
      ).toLocaleLowerCase();
      const activeIndex = getActiveIndex();
      // A one-character search starts after the active item so repeat presses
      // advance. A longer search re-tests the active item, so typing more
      // characters refines the current match instead of skipping past it.
      const startIndex =
        activeIndex === -1 ? 0 : activeIndex + (query.length === 1 ? 1 : 0);

      for (let offset = 0; offset < items.length; offset += 1) {
        const index = (startIndex + offset) % items.length;
        const item = items[index];
        if (getLabel(item).toLocaleLowerCase().startsWith(query)) {
          event.preventDefault();
          onMatch(item, index);
          return true;
        }
      }
      return false;
    },
    [optionsRef, timeoutRef],
  );
};

export default useTypeahead;
