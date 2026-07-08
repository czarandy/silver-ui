import {describe, expect, it} from 'vitest';
import {cx} from 'utils/cx';

describe('cx', () => {
  it('joins truthy class names with spaces', () => {
    expect(cx('root', 'active', 'selected')).toBe('root active selected');
  });

  it('filters false, null, and undefined values', () => {
    expect(cx('root', false, null, undefined, 'active')).toBe('root active');
  });

  it('returns an empty string when no classes are provided', () => {
    expect(cx()).toBe('');
  });
});
