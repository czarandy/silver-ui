import {renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import useTypeahead, {
  TYPEAHEAD_TIMEOUT_MS,
  type TypeaheadKeyboardEvent,
  type UseTypeaheadOptions,
} from 'hooks/useTypeahead';

const ITEMS = ['Banana', 'Apple', 'Apricot', 'Cherry'];

function keyEvent(
  key: string,
  modifiers: Partial<TypeaheadKeyboardEvent> = {},
): TypeaheadKeyboardEvent {
  return {
    altKey: false,
    ctrlKey: false,
    key,
    metaKey: false,
    preventDefault: vi.fn(),
    ...modifiers,
  };
}

/**
 * Renders the hook over `ITEMS`, tracking the matched item as the active one so
 * that repeated keystrokes behave as they would against a real focused list.
 */
function setup(overrides: Partial<UseTypeaheadOptions<string>> = {}) {
  const onMatch = vi.fn();
  let activeIndex = -1;

  const {result} = renderHook(() =>
    useTypeahead<string>({
      getActiveIndex: () => activeIndex,
      getItems: () => ITEMS,
      getLabel: item => item,
      onMatch: (item, index) => {
        activeIndex = index;
        onMatch(item, index);
      },
      ...overrides,
    }),
  );

  return {
    onMatch,
    setActiveIndex: (index: number) => {
      activeIndex = index;
    },
    type: (key: string, modifiers?: Partial<TypeaheadKeyboardEvent>) => {
      const event = keyEvent(key, modifiers);
      const isHandled = result.current(event);
      return {event, isHandled};
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useTypeahead', () => {
  it('matches the first item starting with the typed character', () => {
    const {onMatch, type} = setup();

    const {event, isHandled} = type('a');

    expect(isHandled).toBe(true);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(onMatch).toHaveBeenCalledWith('Apple', 1);
  });

  it('searches from just after the active item and wraps around', () => {
    const {onMatch, setActiveIndex, type} = setup();
    setActiveIndex(3); // Cherry, the last item

    type('b');

    expect(onMatch).toHaveBeenCalledWith('Banana', 0);
  });

  it('cycles through items sharing a first character on repeated presses', () => {
    const {onMatch, type} = setup();

    type('a');
    expect(onMatch).toHaveBeenLastCalledWith('Apple', 1);

    type('a');
    expect(onMatch).toHaveBeenLastCalledWith('Apricot', 2);

    // Only two items start with "a", so the third press wraps back.
    type('a');
    expect(onMatch).toHaveBeenLastCalledWith('Apple', 1);
  });

  it('refines the match as more characters are typed', () => {
    const {onMatch, type} = setup();

    type('a');
    expect(onMatch).toHaveBeenLastCalledWith('Apple', 1);

    // "ap" still describes Apple, so the match must not skip ahead to Apricot.
    type('p');
    expect(onMatch).toHaveBeenLastCalledWith('Apple', 1);

    type('r');
    expect(onMatch).toHaveBeenLastCalledWith('Apricot', 2);
  });

  it('resets the search buffer after the timeout elapses', () => {
    const {onMatch, type} = setup();

    type('a');
    type('p');
    expect(onMatch).toHaveBeenLastCalledWith('Apple', 1);

    vi.advanceTimersByTime(TYPEAHEAD_TIMEOUT_MS);

    // "c" starts a fresh search; had it extended "ap" into "apc" nothing would
    // have matched.
    type('c');
    expect(onMatch).toHaveBeenLastCalledWith('Cherry', 3);
  });

  it('honors a custom timeout', () => {
    const {onMatch, type} = setup({
      getItems: () => ['Apple', 'Apricot', 'Peach'],
      timeout: 2000,
    });

    type('a');
    expect(onMatch).toHaveBeenLastCalledWith('Apple', 0);

    vi.advanceTimersByTime(TYPEAHEAD_TIMEOUT_MS);

    // The buffer is still "a", so this extends it to "ap" rather than starting
    // a new search — which would have landed on Peach.
    type('p');
    expect(onMatch).toHaveBeenLastCalledWith('Apple', 0);
  });

  it('matches case-insensitively', () => {
    const {onMatch, type} = setup();

    type('C');

    expect(onMatch).toHaveBeenCalledWith('Cherry', 3);
  });

  it.each(['altKey', 'ctrlKey', 'metaKey'] as const)(
    'ignores characters typed with %s held',
    modifier => {
      const {onMatch, type} = setup();

      const {event, isHandled} = type('a', {[modifier]: true});

      expect(isHandled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(onMatch).not.toHaveBeenCalled();
    },
  );

  it('ignores non-character keys', () => {
    const {onMatch, type} = setup();

    expect(type('ArrowDown').isHandled).toBe(false);
    expect(type('Enter').isHandled).toBe(false);
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('leaves a leading space for the caller to handle as activation', () => {
    const {onMatch, type} = setup({getItems: () => [' Leading', 'Apple']});

    const {event, isHandled} = type(' ');

    expect(isHandled).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('treats a space as part of an in-progress search', () => {
    const {onMatch, type} = setup({getItems: () => ['New Jersey', 'New York']});

    type('n');
    type('e');
    type('w');
    type(' ');
    type('y');

    expect(onMatch).toHaveBeenLastCalledWith('New York', 1);
  });

  it('reports no match without consuming the key', () => {
    const {onMatch, type} = setup();

    const {event, isHandled} = type('z');

    expect(isHandled).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('handles an empty list', () => {
    const {onMatch, type} = setup({getItems: () => []});

    expect(type('a').isHandled).toBe(false);
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('clears its pending timer on unmount', () => {
    const clearTimeout = vi.spyOn(globalThis, 'clearTimeout');
    const {result, unmount} = renderHook(() =>
      useTypeahead<string>({
        getActiveIndex: () => -1,
        getItems: () => ITEMS,
        getLabel: item => item,
        onMatch: vi.fn(),
      }),
    );

    result.current(keyEvent('a'));
    unmount();

    expect(clearTimeout).toHaveBeenCalled();
    clearTimeout.mockRestore();
  });
});
