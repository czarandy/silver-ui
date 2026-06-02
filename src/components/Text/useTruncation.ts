import {
  useCallback,
  useRef,
  useSyncExternalStore,
  type RefCallback,
} from 'react';
import {useIsomorphicLayoutEffect} from '../../internal/useIsomorphicLayoutEffect';

export interface UseTruncationOptions {
  maxLines: number;
}

export interface UseTruncationReturn {
  elementWidth: number;
  fullText: string;
  isTruncated: boolean;
  ref: RefCallback<HTMLElement>;
}

interface TruncationState {
  elementWidth: number;
  fullText: string;
  isTruncated: boolean;
}

interface TruncationStore {
  listeners: Set<() => void>;
  state: TruncationState;
}

const initialState: TruncationState = {
  elementWidth: 0,
  isTruncated: false,
  fullText: '',
};

function getContentHeight(element: HTMLElement): number {
  if (typeof document === 'undefined') {
    return element.scrollHeight;
  }

  try {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect().height;
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
    elementWidth: element.offsetWidth,
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
      store.state.fullText === nextState.fullText &&
      store.state.elementWidth === nextState.elementWidth
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
        scheduleUpdate(element, lines);
      });
      observerRef.current.observe(element);
    },
    [disconnectObserver, scheduleUpdate],
  );

  const ref = useCallback<RefCallback<HTMLElement>>(
    (nextElement: HTMLElement | null) => {
      elementRef.current = nextElement;
      observeElement(nextElement, maxLines);
      scheduleUpdate(nextElement, maxLines);
    },
    [maxLines, observeElement, scheduleUpdate],
  );

  useIsomorphicLayoutEffect(() => {
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
