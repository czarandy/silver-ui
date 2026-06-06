import {expect} from 'vitest';

/**
 * Asserts a value is neither null nor undefined, then returns it narrowed to
 * `NonNullable<T>`. Lets tests drop `!` non-null assertions and `?.` access
 * while still failing with a clear diff when the value is unexpectedly missing.
 */
export function assertNonNull<T>(value: T, message?: string): NonNullable<T> {
  expect(value, message).not.toBeNull();
  expect(value, message).not.toBeUndefined();
  return value as NonNullable<T>;
}
