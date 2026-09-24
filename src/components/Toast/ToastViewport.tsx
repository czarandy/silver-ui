'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {createPortal} from 'react-dom';
import {Toast} from 'components/Toast/Toast';
import {
  ToastContext,
  type ToastContextValue,
} from 'components/Toast/ToastContext';
import type {
  ToastDismissReason,
  ToastEntry,
  ToastPosition,
} from 'components/Toast/types';
import useHotkey from 'hooks/useHotkey';
import {inheritanceReset} from 'internal/inheritanceReset';
import {mergeRefs} from 'internal/mergeRefs';
import {getActiveModalHost, subscribeModalHosts} from 'internal/modalHostStack';
import {useIsomorphicLayoutEffect} from 'internal/useIsomorphicLayoutEffect';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export interface ToastViewportInset {
  bottom?: number;
  end?: number;
  start?: number;
  top?: number;
}

export interface ToastViewportProps {
  /**
   * App content that should receive the toast context.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the viewport.
   */
  className?: string;
  /**
   * Test ID applied to the viewport.
   */
  'data-testid'?: string;
  /**
   * Custom viewport inset.
   */
  inset?: Readonly<ToastViewportInset>;
  /**
   * Whether to promote the viewport to the CSS top layer using popover. While
   * a modal dialog is open, a top-layer viewport moves inside it so its toasts
   * stay visible and operable above the modal.
   * @default true
   */
  isTopLayer?: boolean;
  /**
   * Maximum visible toast count.
   * @default 5
   */
  maxVisible?: number;
  /**
   * Toast stack position.
   * @default 'bottomEnd'
   */
  position?: ToastPosition;
  /**
   * Ref forwarded to the viewport element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the viewport.
   */
  style?: CSSProperties;
}

/**
 * Re-enters the top layer, which stacks in insertion order and ignores
 * z-index, so the viewport ends up above everything open at this moment.
 * Hiding blurs focus inside the viewport, so it is restored.
 */
function raiseToTopLayer(viewport: HTMLElement): void {
  const focused = viewport.ownerDocument.activeElement;
  const shouldRestoreFocus =
    focused instanceof HTMLElement && viewport.contains(focused);
  // Current engines ignore a redundant hide or show; older ones threw.
  try {
    viewport.hidePopover();
  } catch {
    // Ignore.
  }
  try {
    viewport.showPopover();
  } catch {
    // Ignore.
  }
  if (shouldRestoreFocus && focused !== viewport.ownerDocument.activeElement) {
    focused.focus({preventScroll: true});
  }
}

/**
 * Moves the viewport's container into `target` without React re-rendering
 * it, so toasts keep their state, timers, and user content. The move takes
 * the viewport out of the document, which closes its popover.
 *
 * Focus is not carried across: a move only follows `showModal()` or `close()`,
 * which move focus themselves, or a dialog unmounting, which has already
 * dropped it.
 */
function moveViewport(
  container: HTMLElement,
  target: HTMLElement,
  viewport: HTMLElement | null,
  isTopLayer: boolean,
): void {
  container.setAttribute('data-toast-skip-entry', '');
  target.append(container);
  if (viewport != null && isTopLayer) {
    raiseToTopLayer(viewport);
  }
  // Resolve styles while the attribute is set, so toasts already on screen
  // take their final style as their starting style instead of re-entering.
  viewport?.getBoundingClientRect();
  container.removeAttribute('data-toast-skip-entry');
}

function subscribeToNothing(): () => void {
  return () => {};
}

const styles = {
  // The anchor marks the viewport's home in the tree (keeping theme scopes and
  // tab order); the container holds the viewport and moves between the anchor
  // and the active modal. Neither generates a box.
  contents: css({display: 'contents'}),
  viewport: css({
    ...inheritanceReset,
    position: 'fixed',
    zIndex: 500,
    display: 'flex',
    flexDirection: 'column',
    p: '4',
    pointerEvents: 'none',
    inset: 'unset',
    m: 0,
    borderWidth: 0,
    bg: 'transparent',
    overflow: 'visible',
  }),
  bottomEnd: css({bottom: 0, insetInlineEnd: 0, alignItems: 'flex-end'}),
  bottomStart: css({bottom: 0, insetInlineStart: 0, alignItems: 'flex-start'}),
  topEnd: css({
    top: 0,
    insetInlineEnd: 0,
    alignItems: 'flex-end',
    flexDirection: 'column-reverse',
  }),
  topStart: css({
    top: 0,
    insetInlineStart: 0,
    alignItems: 'flex-start',
    flexDirection: 'column-reverse',
  }),
  wrapper: css({
    pointerEvents: 'auto',
    display: 'grid',
    gridTemplateRows: '1fr',
    pb: '3',
    transitionProperty: 'grid-template-rows, padding',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  }),
  wrapperExiting: css({
    gridTemplateRows: '0fr',
    pb: 0,
  }),
  wrapperInner: css({
    overflow: 'hidden',
  }),
  position: {
    bottomEnd: '',
    bottomStart: '',
    topEnd: '',
    topStart: '',
  } satisfies Record<ToastPosition, string>,
} as const;

styles.position.bottomEnd = styles.bottomEnd;
styles.position.bottomStart = styles.bottomStart;
styles.position.topEnd = styles.topEnd;
styles.position.topStart = styles.topStart;

/**
 * Toast provider and viewport. Mount once near the app root to enable
 * toast notifications. Components below this provider can call `useToast()`
 * to show toasts.
 *
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <ToastViewport>
 *       <MyRoutes />
 *     </ToastViewport>
 *   );
 * }
 * ```
 */
export function ToastViewport({
  children,
  className,
  'data-testid': dataTestId,
  inset,
  isTopLayer = true,
  maxVisible = 5,
  position = 'bottomEnd',
  ref,
  style,
}: ToastViewportProps): React.JSX.Element {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [exitingIds, setExitingIds] = useState<Set<string>>(() => new Set());
  const [isFocusWithinViewport, setIsFocusWithinViewport] = useState(false);
  const toastsRef = useRef(toasts);
  const shownToastIdsRef = useRef<ReadonlySet<string>>(new Set());
  const anchorRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  // Portals cannot render on the server, and the first client render must
  // match it.
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  // Created by us rather than rendered by React, so it can move between hosts
  // without React noticing: the toasts inside are never remounted.
  const [container] = useState(() => {
    if (typeof document === 'undefined') {
      return null;
    }
    const element = document.createElement('div');
    element.className = styles.contents;
    return element;
  });
  const exitTimeoutsRef = useRef(
    new Map<string, ReturnType<typeof globalThis.setTimeout>>(),
  );

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  useHotkey('f6', () => viewportRef.current?.focus(), {
    isEnabled: toasts.length > 0,
    isEnabledOnFormElements: true,
    hasPreventDefault: true,
  });

  const addToast = useCallback((entry: ToastEntry) => {
    setToasts(previous => {
      const {uniqueID, collisionBehavior = 'overwrite'} = entry.options;
      if (uniqueID != null) {
        const existing = previous.find(
          toast => toast.options.uniqueID === uniqueID,
        );
        if (existing != null) {
          if (collisionBehavior === 'ignore') {
            return previous;
          }
          return previous.map(toast =>
            toast.options.uniqueID === uniqueID ? entry : toast,
          );
        }
      }
      return [...previous, entry];
    });
  }, []);

  const removeToast = useCallback((id: string, reason: ToastDismissReason) => {
    const entry = toastsRef.current.find(toast => toast.id === id);
    if (entry == null || exitTimeoutsRef.current.has(id)) {
      return;
    }
    setExitingIds(previous => new Set(previous).add(id));
    const timeout = globalThis.setTimeout(() => {
      exitTimeoutsRef.current.delete(id);
      setExitingIds(previous => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
      setToasts(previous => previous.filter(toast => toast.id !== id));
    }, 180);
    exitTimeoutsRef.current.set(id, timeout);
    entry.options.onHide?.(reason);
  }, []);

  const findByUniqueID = useCallback((uniqueID: string) => {
    return toastsRef.current.find(toast => toast.options.uniqueID === uniqueID);
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({addToast, findByUniqueID, removeToast}),
    [addToast, findByUniqueID, removeToast],
  );

  // An open modal dialog makes everything outside it inert, so a top-layer
  // viewport lives inside the active modal and otherwise at its anchor.
  // `isClient` is a dependency because the viewport only exists once the
  // portal renders after hydration, and must then be placed and shown.
  useIsomorphicLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (container == null || anchor == null) {
      return;
    }
    const place = (): void => {
      // A dialog rendered inside a toast hosts nothing: the viewport cannot
      // move into its own descendant, and is not inert to that dialog anyway.
      const target =
        (isTopLayer
          ? getActiveModalHost(host => !container.contains(host))
          : null) ?? anchor;
      const viewport = viewportRef.current;
      if (container.parentNode !== target) {
        moveViewport(container, target, viewport, isTopLayer);
      } else if (
        isTopLayer &&
        viewport != null &&
        target !== anchor &&
        getActiveModalHost() === target
      ) {
        // The host re-ran showModal() and re-entered the top layer above us.
        // A dialog opened from a toast is left above the viewport.
        raiseToTopLayer(viewport);
      }
    };
    place();
    const unsubscribe = isTopLayer ? subscribeModalHosts(place) : undefined;
    return () => {
      unsubscribe?.();
      container.remove();
    };
  }, [container, isClient, isTopLayer]);

  // A newly shown toast re-enters the top layer, so it appears above popovers
  // opened after the viewport (and modals that do not register as hosts). A
  // dialog opened from a toast stays on top: it is what the user is using.
  useIsomorphicLayoutEffect(() => {
    const previousIds = shownToastIdsRef.current;
    shownToastIdsRef.current = new Set(toasts.map(toast => toast.id));
    const viewport = viewportRef.current;
    const activeHost = getActiveModalHost();
    if (
      !isTopLayer ||
      viewport == null ||
      toasts.every(toast => previousIds.has(toast.id)) ||
      (activeHost != null && viewport.contains(activeHost))
    ) {
      return;
    }
    raiseToTopLayer(viewport);
  }, [isTopLayer, toasts]);

  useEffect(() => {
    const exitTimeouts = exitTimeoutsRef.current;
    return () => {
      for (const timeout of exitTimeouts.values()) {
        globalThis.clearTimeout(timeout);
      }
      exitTimeouts.clear();
    };
  }, []);

  const handleBlurCapture = useCallback((event: FocusEvent<HTMLDivElement>) => {
    const nextFocusedElement = event.relatedTarget;
    if (
      nextFocusedElement instanceof Node &&
      event.currentTarget.contains(nextFocusedElement)
    ) {
      return;
    }
    setIsFocusWithinViewport(false);
  }, []);

  const insetStyle: CSSProperties = {
    ...(inset?.top != null ? {top: inset.top} : null),
    ...(inset?.bottom != null ? {bottom: inset.bottom} : null),
    ...(inset?.start != null ? {insetInlineStart: inset.start} : null),
    ...(inset?.end != null ? {insetInlineEnd: inset.end} : null),
    ...style,
  };
  const visibleToasts = toasts.slice(-maxVisible);

  const viewport = (
    <div
      aria-keyshortcuts="F6"
      aria-label="Notifications"
      className={cx(styles.viewport, styles.position[position], className)}
      data-testid={dataTestId}
      onBlurCapture={handleBlurCapture}
      onFocusCapture={() => setIsFocusWithinViewport(true)}
      popover={isTopLayer ? 'manual' : undefined}
      ref={mergeRefs(viewportRef, ref)}
      role="region"
      style={insetStyle}
      tabIndex={visibleToasts.length > 0 ? 0 : -1}>
      {visibleToasts.map(entry => {
        const type = entry.options.type ?? 'info';
        const isAutoHide =
          entry.options.isAutoHide ?? (type === 'error' ? false : true);
        return (
          <div
            className={cx(
              styles.wrapper,
              exitingIds.has(entry.id) ? styles.wrapperExiting : undefined,
            )}
            key={entry.id}>
            <div className={styles.wrapperInner}>
              <Toast
                autoHideDuration={entry.options.autoHideDuration ?? 5000}
                body={entry.options.body}
                endContent={entry.options.endContent}
                isAutoHide={isAutoHide}
                isExiting={exitingIds.has(entry.id)}
                isPaused={isFocusWithinViewport}
                onDismiss={reason => removeToast(entry.id, reason)}
                type={type}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <ToastContext value={contextValue}>
      {children}
      <div className={styles.contents} ref={anchorRef} />
      {isClient && container != null ? createPortal(viewport, container) : null}
    </ToastContext>
  );
}

ToastViewport.displayName = 'ToastViewport';
