import {describe, expect, it} from 'vitest';
import {shallowEqual} from 'internal/shallowEqual';

describe('shallowEqual', () => {
  it('returns true for the same reference', () => {
    const obj = {a: 1};
    expect(shallowEqual(obj, obj)).toBe(true);
    const arr = [1, 2, 3];
    expect(shallowEqual(arr, arr)).toBe(true);
  });

  it('compares primitives by value', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual('a', 'a')).toBe(true);
    expect(shallowEqual(1, 2)).toBe(false);
    expect(shallowEqual('a', 'b')).toBe(false);
  });

  it('treats null and non-objects without throwing', () => {
    expect(shallowEqual(null, null)).toBe(true);
    expect(shallowEqual(null, {})).toBe(false);
    expect(shallowEqual({}, null)).toBe(false);
    expect(shallowEqual(undefined, undefined)).toBe(true);
    expect(shallowEqual(null, undefined)).toBe(false);
  });

  it('compares arrays element-wise', () => {
    expect(shallowEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(shallowEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    expect(shallowEqual([1, 2], [1, 2, 3])).toBe(false);

    const a = {};
    const b = {};
    expect(shallowEqual([a, b], [a, b])).toBe(true);
    expect(shallowEqual([a, b], [a, {}])).toBe(false);
  });

  it('compares objects by their own keys', () => {
    expect(shallowEqual({a: 1, b: 2}, {a: 1, b: 2})).toBe(true);
    expect(shallowEqual({a: 1, b: 2}, {a: 1, b: 3})).toBe(false);
    expect(shallowEqual({a: 1}, {a: 1, b: 2})).toBe(false);
    expect(shallowEqual({a: 1, b: 2}, {a: 1, c: 2})).toBe(false);
  });

  it('is shallow — nested objects are compared by reference', () => {
    expect(shallowEqual({a: {x: 1}}, {a: {x: 1}})).toBe(false);
    const nested = {x: 1};
    expect(shallowEqual({a: nested}, {a: nested})).toBe(true);
  });

  it('uses Object.is semantics for values', () => {
    expect(shallowEqual([NaN], [NaN])).toBe(true);
    expect(shallowEqual({a: NaN}, {a: NaN})).toBe(true);
    expect(shallowEqual({a: 0}, {a: -0})).toBe(false);
  });
});
