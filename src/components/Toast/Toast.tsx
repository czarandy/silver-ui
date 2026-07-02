/* eslint-disable jsx-a11y-x/no-static-element-interactions */
'use client';
import {X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {Button} from 'components/Button';
import {toastRecipe} from 'components/Toast/Toast.recipe';
import type {ToastDismissReason, ToastType} from 'components/Toast/types';
import {cx} from 'internal/cx';
import {nowMonotonicMilliseconds} from 'internal/time';
import useLatest from 'internal/useLatest';

export interface ToastProps {
  /**
   * Auto-dismiss duration in milliseconds.
   */
  autoHideDuration: number;
  /**
   * Toast message content.
   */
  body: ReactNode;
  /**
   * Additional CSS class names applied to the toast.
   */
  className?: string;
  /**
   * Test ID applied to the toast.
   */
  'data-testid'?: string;
  /**
   * Content rendered before the dismiss button.
   */
  endContent?: ReactNode;
  /**
   * Whether the toast auto-dismisses.
   */
  isAutoHide: boolean;
  /**
   * Whether the toast is exiting.
   * @default false
   */
  isExiting?: boolean;
  /**
   * Called when the toast should be dismissed.
   */
  onDismiss: (reason: ToastDismissReason) => void;
  /**
   * Ref forwarded to the toast element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the toast.
   */
  style?: CSSProperties;
  /**
   * Toast tone.
   */
  type: ToastType;
}

const assertiveTypes: Partial<Record<ToastType, true>> = {
  error: true,
  warning: true,
};

/**
 * An individual toast notification.
 */
export function Toast({
  autoHideDuration,
  body,
  className,
  'data-testid': dataTestId,
  endContent,
  isAutoHide,
  isExiting = false,
  onDismiss: onDismissFromProps,
  ref,
  style,
  type,
}: ToastProps): React.JSX.Element {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const remainingRef = useRef(autoHideDuration);
  const isPausedRef = useRef(false);
  const onDismissRef = useLatest(onDismissFromProps);

  const startTimer = useCallback(() => {
    if (!isAutoHide) {
      return;
    }
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
    }
    startedAtRef.current = nowMonotonicMilliseconds();
    timerRef.current = setTimeout(
      () => onDismissRef.current('auto'),
      remainingRef.current,
    );
  }, [isAutoHide]);

  const pauseTimer = useCallback(() => {
    if (!isAutoHide || isPausedRef.current) {
      return;
    }
    isPausedRef.current = true;
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (startedAtRef.current != null) {
      remainingRef.current = Math.max(
        remainingRef.current -
          (nowMonotonicMilliseconds() - startedAtRef.current),
        1000,
      );
    }
  }, [isAutoHide]);

  const resumeTimer = useCallback(() => {
    if (!isAutoHide || !isPausedRef.current) {
      return;
    }
    isPausedRef.current = false;
    startTimer();
  }, [isAutoHide, startTimer]);

  useEffect(() => {
    remainingRef.current = autoHideDuration;
    startTimer();
    return () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [autoHideDuration, startTimer]);

  const classes = toastRecipe({type, isExiting});

  return (
    <div
      aria-atomic="true"
      aria-live={assertiveTypes[type] ? 'assertive' : 'polite'}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      onBlurCapture={resumeTimer}
      onFocusCapture={pauseTimer}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      ref={ref}
      role={assertiveTypes[type] ? 'alert' : 'status'}
      style={style}>
      <div className={classes.inner}>
        <div className={classes.content}>{body}</div>
        <div className={classes.end}>
          {endContent}
          <Button
            icon={X}
            isIconOnly
            label="Dismiss notification"
            onClick={() => onDismissRef.current('manual')}
            size="sm"
            variant="onSolid"
          />
        </div>
      </div>
    </div>
  );
}

Toast.displayName = 'Toast';
