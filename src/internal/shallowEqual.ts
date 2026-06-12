/**
 * Shallow structural equality: `true` when `a` and `b` are the same reference,
 * or are arrays/objects with the same set of keys whose values are each equal
 * by `Object.is`. Non-object values are compared with `Object.is`.
 */
export function shallowEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    typeof a !== 'object' ||
    a === null ||
    typeof b !== 'object' ||
    b === null
  ) {
    return false;
  }

  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }

  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  for (const key of aKeys) {
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !Object.is(aRecord[key], bRecord[key])
    ) {
      return false;
    }
  }
  return true;
}
