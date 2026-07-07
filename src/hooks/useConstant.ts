'use client';

import {useRef} from 'react';

const UNSET = Symbol('useConstant.unset');

/**
 * Computes `init` once on the first render and returns the same value on every
 * subsequent render. Unlike `useMemo`, the value is guaranteed stable for the
 * lifetime of the component (no dependency array, never recomputed).
 */
const useConstant = <T>(init: () => T): T => {
  const ref = useRef<T | typeof UNSET>(UNSET);
  /* eslint-disable @eslint-react/refs -- first-render lazy initialization: slot is read and written once, value is stable thereafter */
  if (ref.current === UNSET) {
    ref.current = init();
  }
  return ref.current;
  /* eslint-enable @eslint-react/refs */
};

export default useConstant;
