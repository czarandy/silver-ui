type ResizeCallback = (entry: ResizeObserverEntry) => void;

let observer: ResizeObserver | null = null;
const callbacks = new Map<Element, ResizeCallback>();

function getObserver(): ResizeObserver {
  observer ??= new ResizeObserver(entries => {
    for (const entry of entries) {
      callbacks.get(entry.target)?.(entry);
    }
  });

  return observer;
}

export function observeResize(
  element: Element,
  callback: ResizeCallback,
): void {
  callbacks.set(element, callback);
  getObserver().observe(element);
}

export function unobserveResize(element: Element): void {
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
