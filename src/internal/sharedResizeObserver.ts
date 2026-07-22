type ResizeCallback = (entry: ResizeObserverEntry) => void;

let observer: ResizeObserver | null = null;
const callbacks = new Map<Element, Set<ResizeCallback>>();

function getObserver(): ResizeObserver {
  observer ??= new ResizeObserver(entries => {
    for (const entry of entries) {
      const targetCallbacks = callbacks.get(entry.target);
      if (targetCallbacks == null) {
        continue;
      }
      // Copy so a callback unobserving during dispatch cannot skip others.
      for (const callback of [...targetCallbacks]) {
        callback(entry);
      }
    }
  });

  return observer;
}

export function observeResize(
  element: Element,
  callback: ResizeCallback,
): void {
  let targetCallbacks = callbacks.get(element);
  if (targetCallbacks == null) {
    targetCallbacks = new Set();
    callbacks.set(element, targetCallbacks);
    getObserver().observe(element);
  }
  targetCallbacks.add(callback);
}

/**
 * Stops observing `element` for `callback`; with no callback, removes every
 * callback for `element`. The element itself is unobserved once no callbacks
 * remain — two components can safely observe the same element (e.g. a shared
 * parent) without evicting each other.
 */
export function unobserveResize(
  element: Element,
  callback?: ResizeCallback,
): void {
  const targetCallbacks = callbacks.get(element);
  if (targetCallbacks == null) {
    return;
  }

  if (callback != null) {
    targetCallbacks.delete(callback);
    if (targetCallbacks.size > 0) {
      return;
    }
  }

  callbacks.delete(element);

  if (observer == null) {
    return;
  }

  observer.unobserve(element);

  if (callbacks.size === 0) {
    observer.disconnect();
    observer = null;
  }
}
