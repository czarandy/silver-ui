import {useRef} from 'react';
import {shallowEqual} from 'internal/shallowEqual';

/**
 * Returns a referentially stable version of `value`: the same reference is
 * preserved across renders for as long as each new value is shallow-equal to
 * the last one returned. Identity only changes when the shallow contents
 * change.
 *
 * Useful when an upstream value is rebuilt every render (e.g. a freshly mapped
 * array) but its contents are usually unchanged, and something downstream
 * compares it by reference — a `memo` comparator, an effect dependency, etc.
 */
const useShallowEqualMemo = <T>(value: T): T => {
  const ref = useRef(value);
  /* eslint-disable @eslint-react/refs -- memo-compare: the slot is read and rewritten only when the shallow contents change, preserving identity otherwise */
  if (!shallowEqual(ref.current, value)) {
    ref.current = value;
  }
  return ref.current;
  /* eslint-enable @eslint-react/refs */
};

export default useShallowEqualMemo;
