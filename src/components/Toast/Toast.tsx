/* eslint-disable jsx-a11y-x/no-static-element-interactions */
import {X} from 'lucide-react';
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Button} from '../Button';
import type {ToastDismissReason, ToastType} from './types';

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

const styles = {
  root: css({
    width: '100',
    maxW: 'calc(100vw - 32px)',
    p: '4',
    borderRadius: 'lg',
    boxShadow: 'xl',
    fontFamily: 'body',
    transitionProperty: 'opacity, transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    '@starting-style': {
      opacity: 0,
      transform: 'translateY(8px)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  }),
  info: css({bg: 'status.info.solid', color: 'status.info.solidFg'}),
  error: css({bg: 'status.error.solid', color: 'status.error.solidFg'}),
  success: css({bg: 'status.success.solid', color: 'status.success.solidFg'}),
  warning: css({bg: 'status.warning.solid', color: 'status.warning.solidFg'}),
  exiting: css({
    opacity: 0,
    transform: 'translateY(-8px)',
  }),
  inner: css({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '3',
  }),
  content: css({
    flex: 1,
    minW: 0,
  }),
  end: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    flexShrink: 0,
    mt: '-1',
    me: '-1',
  }),
} as const;

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
  onDismiss,
  ref,
  style,
  type,
}: ToastProps): React.JSX.Element {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const remainingRef = useRef(autoHideDuration);
  const isPausedRef = useRef(false);

  const startTimer = useCallback(() => {
    if (!isAutoHide) {
      return;
    }
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
    }
    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(
      () => onDismiss('auto'),
      remainingRef.current,
    );
  }, [isAutoHide, onDismiss]);

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
        remainingRef.current - (Date.now() - startedAtRef.current),
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

  return (
    <div
      aria-atomic="true"
      aria-live={assertiveTypes[type] ? 'assertive' : 'polite'}
      className={cx(
        styles.root,
        styles[type],
        isExiting ? styles.exiting : undefined,
        className,
      )}
      data-testid={dataTestId}
      onBlurCapture={resumeTimer}
      onFocusCapture={pauseTimer}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      ref={ref}
      role={assertiveTypes[type] ? 'alert' : 'status'}
      style={style}>
      <div className={styles.inner}>
        <div className={styles.content}>{body}</div>
        <div className={styles.end}>
          {endContent}
          <Button
            icon={X}
            isIconOnly
            label="Dismiss notification"
            onClick={() => onDismiss('manual')}
            size="sm"
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
}

Toast.displayName = 'Toast';
