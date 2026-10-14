import type {Ref, RefCallback} from 'react';

interface RefCacheNode {
  callback?: RefCallback<unknown>;
  children: WeakMap<object, RefCacheNode>;
}

const cacheRoot: RefCacheNode = {children: new WeakMap()};

/**
 * Returns the same callback for the same ordered, non-null refs, including
 * inline calls made during render. Every cache level uses weak keys so unused
 * consumer refs and their composed callbacks can be collected.
 */
export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]): RefCallback<T> {
  let cache = cacheRoot;
  for (const ref of refs) {
    if (ref == null) {
      continue;
    }
    let child = cache.children.get(ref);
    if (child == null) {
      child = {children: new WeakMap()};
      cache.children.set(ref, child);
    }
    cache = child;
  }

  if (cache.callback != null) {
    return cache.callback;
  }

  const callback = composeRefs(refs);
  cache.callback = callback;
  return callback;
}

function composeRefs<T>(refs: (Ref<T> | undefined)[]): RefCallback<T> {
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
