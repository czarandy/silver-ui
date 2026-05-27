import {
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type RefCallback,
} from 'react';

export interface UseTruncationOptions {
  maxLines: number;
}

export interface UseTruncationReturn {
  ref: RefCallback<HTMLElement>;
  isTruncated: boolean;
  fullText: string;
}

interface TruncationState {
  isTruncated: boolean;
  fullText: string;
}

interface TruncationStore {
  state: TruncationState;
  listeners: Set<() => void>;
}

const initialState: TruncationState = {
  isTruncated: false,
  fullText: '',
};

function getContentHeight(element: HTMLElement): number {
  try {
    const range = document.createRange();
    range.selectNodeContents(element);
    const height = range.getBoundingClientRect().height;
    return height;
  } catch {
    return element.scrollHeight;
  }
}

function hasOverflow(element: HTMLElement, maxLines: number): boolean {
  if (maxLines === 1) {
    return element.scrollWidth > element.offsetWidth;
  }

  return getContentHeight(element) > element.offsetHeight;
}

function getTruncationState(
  element: HTMLElement | null,
  maxLines: number,
): TruncationState {
  if (element == null || maxLines <= 0) {
    return initialState;
  }

  return {
    fullText: element.textContent,
    isTruncated: hasOverflow(element, maxLines),
  };
}

export function useTruncation({
  maxLines,
}: UseTruncationOptions): UseTruncationReturn {
  const storeRef = useRef<TruncationStore>({
    state: initialState,
    listeners: new Set(),
  });
  const elementRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  const subscribe = useCallback((listener: () => void): (() => void) => {
    const store = storeRef.current;
    store.listeners.add(listener);

    return () => {
      store.listeners.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback((): TruncationState => {
    return storeRef.current.state;
  }, []);

  const publishState = useCallback((nextState: TruncationState): void => {
    const store = storeRef.current;
    if (
      store.state.isTruncated === nextState.isTruncated &&
      store.state.fullText === nextState.fullText
    ) {
      return;
    }

    store.state = nextState;
    for (const listener of store.listeners) {
      listener();
    }
  }, []);

  const cancelPendingFrame = useCallback((): void => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const disconnectObserver = useCallback((): void => {
    observerRef.current?.disconnect();
    observerRef.current = null;
  }, []);

  const scheduleUpdate = useCallback(
    (element: HTMLElement | null, lines: number): void => {
      cancelPendingFrame();
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        publishState(getTruncationState(element, lines));
      });
    },
    [cancelPendingFrame, publishState],
  );

  const observeElement = useCallback(
    (element: HTMLElement | null, lines: number): void => {
      disconnectObserver();

      if (
        element == null ||
        lines <= 0 ||
        typeof ResizeObserver === 'undefined'
      ) {
        return;
      }

      observerRef.current = new ResizeObserver(() => {
        publishState(getTruncationState(element, lines));
      });
      observerRef.current.observe(element);
    },
    [disconnectObserver, publishState],
  );

  const ref = useCallback<RefCallback<HTMLElement>>(
    (nextElement: HTMLElement | null) => {
      elementRef.current = nextElement;
      observeElement(nextElement, maxLines);
      scheduleUpdate(nextElement, maxLines);
    },
    [maxLines, observeElement, scheduleUpdate],
  );

  useLayoutEffect(() => {
    const element = elementRef.current;
    observeElement(element, maxLines);
    scheduleUpdate(element, maxLines);

    return () => {
      cancelPendingFrame();
      disconnectObserver();
    };
  }, [
    cancelPendingFrame,
    disconnectObserver,
    maxLines,
    observeElement,
    scheduleUpdate,
  ]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {ref, ...state};
}
