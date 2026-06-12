import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from 'internal/cx';
import {css} from 'styled-system/css';
import {mergeRefs} from '../../internal/mergeRefs';
import {Toast} from './Toast';
import {ToastContext, type ToastContextValue} from './ToastContext';
import type {ToastDismissReason, ToastEntry, ToastPosition} from './types';

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
   * Whether to promote the viewport to the CSS top layer using popover.
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

const styles = {
  viewport: css({
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
  const toastsRef = useRef(toasts);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

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
    entry?.options.onHide?.(reason);
    setExitingIds(previous => new Set(previous).add(id));
    globalThis.setTimeout(() => {
      setExitingIds(previous => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
      setToasts(previous => previous.filter(toast => toast.id !== id));
    }, 180);
  }, []);

  const findByUniqueID = useCallback((uniqueID: string) => {
    return toastsRef.current.find(toast => toast.options.uniqueID === uniqueID);
  }, []);

  const contextValue = useMemo<ToastContextValue>(
    () => ({addToast, findByUniqueID, removeToast}),
    [addToast, findByUniqueID, removeToast],
  );

  useEffect(() => {
    if (!isTopLayer) {
      return;
    }
    try {
      viewportRef.current?.showPopover();
    } catch {
      // Already showing.
    }
  }, [isTopLayer]);

  const insetStyle: CSSProperties = {
    ...(inset?.top != null ? {top: inset.top} : null),
    ...(inset?.bottom != null ? {bottom: inset.bottom} : null),
    ...(inset?.start != null ? {insetInlineStart: inset.start} : null),
    ...(inset?.end != null ? {insetInlineEnd: inset.end} : null),
    ...style,
  };
  const visibleToasts = toasts.slice(-maxVisible);

  return (
    <ToastContext value={contextValue}>
      {children}
      <div
        aria-label="Notifications"
        className={cx(styles.viewport, styles.position[position], className)}
        data-testid={dataTestId}
        popover={isTopLayer ? 'manual' : undefined}
        ref={mergeRefs(viewportRef, ref)}
        role="region"
        style={insetStyle}>
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
                  onDismiss={reason => removeToast(entry.id, reason)}
                  type={type}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}

ToastViewport.displayName = 'ToastViewport';
