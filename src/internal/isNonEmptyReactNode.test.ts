import {describe, expect, it} from 'vitest';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';

describe('isNonEmptyReactNode', () => {
  it('returns false for null and undefined', () => {
    expect(isNonEmptyReactNode(null)).toBe(false);
    expect(isNonEmptyReactNode(undefined)).toBe(false);
  });

  it('returns false for booleans', () => {
    expect(isNonEmptyReactNode(true)).toBe(false);
    expect(isNonEmptyReactNode(false)).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isNonEmptyReactNode('')).toBe(false);
  });

  it('returns true for renderable content', () => {
    expect(isNonEmptyReactNode('text')).toBe(true);
    expect(isNonEmptyReactNode(' ')).toBe(true);
    expect(isNonEmptyReactNode(0)).toBe(true);
    expect(isNonEmptyReactNode(['a', 'b'])).toBe(true);
  });
});
