import {useCallback, useRef, useSyncExternalStore} from 'react';

function measureOverflow(el: HTMLElement | null): number {
  if (el == null) {
    return 0;
  }
  const containerRight = el.getBoundingClientRect().right;
  const children = el.children;
  let hidden = 0;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    if (child.dataset.overflowIgnore != null) {
      continue;
    }
    if (child.getBoundingClientRect().right > containerRight + 1) {
      hidden++;
    }
  }
  return hidden;
}

interface OverflowStore {
  count: number;
  listeners: Set<() => void>;
}

export function useOverflowCount(isEnabled: boolean): {
  count: number;
  ref: (el: HTMLElement | null) => void;
} {
  const storeRef = useRef<OverflowStore>({count: 0, listeners: new Set()});
  const elementRef = useRef<HTMLElement | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const publish = useCallback((next: number) => {
    const store = storeRef.current;
    if (store.count === next) {
      return;
    }
    store.count = next;
    for (const listener of store.listeners) {
      listener();
    }
  }, []);

  const subscribe = useCallback((listener: () => void) => {
    const store = storeRef.current;
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => storeRef.current.count, []);

  const ref = useCallback(
    (el: HTMLElement | null) => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      elementRef.current = el;

      if (el == null || !isEnabled) {
        publish(0);
        return;
      }

      publish(measureOverflow(el));
      observerRef.current = new ResizeObserver(() => {
        publish(measureOverflow(elementRef.current));
      });
      observerRef.current.observe(el);
    },
    [isEnabled, publish],
  );

  const count = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {count, ref};
}
