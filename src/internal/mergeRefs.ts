import type {Ref, RefCallback} from 'react';

/**
 * Composes refs for imperative use. Components and hooks use useMergeRefs to
 * keep the callback stable across renders.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  return (value: T | null) => {
    const detachCallbacks: (() => void)[] = [];
    for (const ref of refs) {
      if (typeof ref === 'function') {
        const cleanup = ref(value);
        if (typeof cleanup === 'function') {
          detachCallbacks.push(cleanup);
        } else {
          detachCallbacks.push(() => {
            ref(null);
          });
        }
      } else if (ref != null) {
        const objectRef = ref as {current: T | null};
        objectRef.current = value;
        detachCallbacks.push(() => {
          objectRef.current = null;
        });
      }
    }
    return () => {
      for (const detach of detachCallbacks) {
        detach();
      }
    };
  };
}
