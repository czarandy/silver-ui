import {renderHook} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import useShallowEqualMemo from './useShallowEqualMemo';

describe('useShallowEqualMemo', () => {
  it('returns the value on first render', () => {
    const value = [1, 2, 3];
    const {result} = renderHook(() => useShallowEqualMemo(value));
    expect(result.current).toBe(value);
  });

  it('preserves identity when a new shallow-equal value is passed', () => {
    const {result, rerender} = renderHook(
      ({value}) => useShallowEqualMemo(value),
      {initialProps: {value: [1, 2, 3]}},
    );
    const first = result.current;

    rerender({value: [1, 2, 3]});
    expect(result.current).toBe(first);
  });

  it('returns a new reference when the shallow contents change', () => {
    const {result, rerender} = renderHook(
      ({value}) => useShallowEqualMemo(value),
      {initialProps: {value: [1, 2, 3]}},
    );
    const first = result.current;

    const next = [1, 2, 4];
    rerender({value: next});
    expect(result.current).not.toBe(first);
    expect(result.current).toBe(next);
  });

  it('keeps element identity for stable rows across renders', () => {
    const a = {id: 'a'};
    const b = {id: 'b'};
    const {result, rerender} = renderHook(
      ({value}) => useShallowEqualMemo(value),
      {initialProps: {value: [a, b]}},
    );
    const first = result.current;

    // New array, same element references → stable.
    rerender({value: [a, b]});
    expect(result.current).toBe(first);

    // One element swapped → new reference.
    const c = {id: 'c'};
    rerender({value: [a, c]});
    expect(result.current).not.toBe(first);
    expect(result.current).toEqual([a, c]);
  });
});
