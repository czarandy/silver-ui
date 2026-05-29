/* eslint-disable jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions */
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';

export type DialogVariant = 'fullscreen' | 'standard';
export type DialogPurpose = 'form' | 'info' | 'required';

export interface DialogPosition {
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
  top?: number | string;
}

export interface DialogProps {
  /**
   * Dialog body content.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the dialog.
   */
  className?: string;
  /**
   * Test ID applied to the dialog.
   */
  'data-testid'?: string;
  /**
   * Whether to render inline instead of as a modal.
   * @default false
   */
  isInline?: boolean;
  /**
   * Whether the dialog is open.
   */
  isOpen: boolean;
  /**
   * Accessible label for the dialog.
   */
  label: string;
  /**
   * Maximum height of the dialog. Numbers are treated as pixels.
   * @default '75vh'
   */
  maxHeight?: number | string;
  /**
   * Called when the dialog requests an open-state change.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Fixed positioning offsets for the dialog.
   */
  position?: Readonly<DialogPosition>;
  /**
   * Controls escape and backdrop-click dismiss behavior.
   * @default 'info'
   */
  purpose?: DialogPurpose;
  /**
   * Ref forwarded to the dialog element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Inline styles applied to the dialog.
   */
  style?: CSSProperties;
  /**
   * Display variant.
   * @default 'standard'
   */
  variant?: DialogVariant;
  /**
   * Dialog width. Numbers are treated as pixels.
   * @default 400
   */
  width?: number | string;
}

const styles = {
  root: css({
    position: 'fixed',
    m: 'auto',
    p: 0,
    borderWidth: 0,
    bg: 'bg',
    color: 'fg',
    borderRadius: 'md',
    boxShadow: 'xl',
    flexDirection: 'column',
    overscrollBehavior: 'contain',
    _backdrop: {
      bg: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(2px)',
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  open: css({
    display: 'flex',
  }),
  fullscreen: css({
    w: '100dvw',
    h: '100dvh',
    maxW: '100dvw',
    maxH: '100dvh',
    borderRadius: 0,
    m: 0,
    inset: 0,
  }),
  inner: css({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minH: 0,
    overflow: 'hidden',
    borderRadius: 'inherit',
  }),
  inline: css({
    position: 'relative',
    display: 'flex',
    p: 0,
    borderWidth: 0,
    bg: 'bg',
    color: 'fg',
    borderRadius: 'md',
    boxShadow: 'xl',
    flexDirection: 'column',
  }),
} as const;

function formatSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * A modal or inline dialog surface with backdrop, focus management,
 * and configurable dismiss behavior.
 */
export function Dialog({
  isOpen,
  isInline = false,
  label,
  onOpenChange,
  width = 400,
  maxHeight = '75vh',
  position,
  variant = 'standard',
  purpose = 'info',
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DialogProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isFullscreen = variant === 'fullscreen';
  const allowEscape = purpose !== 'required';
  const allowBackdropClick = purpose === 'info';

  useEffect(() => {
    if (isInline) {
      return;
    }
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) {
        dialog.showModal();
      }
      dialog
        .querySelector<HTMLElement>('[data-autofocus="true"], [autofocus]')
        ?.focus();
    } else if (dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [isInline, isOpen]);

  useEffect(() => {
    if (!isOpen || isInline) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isInline, isOpen]);

  if (isInline) {
    if (!isOpen) {
      return null;
    }
    return (
      <div
        aria-label={label}
        className={cx(
          styles.inline,
          isFullscreen ? styles.fullscreen : undefined,
          className,
        )}
        data-testid={dataTestId}
        ref={ref as Ref<HTMLDivElement>}
        style={{
          width: isFullscreen ? undefined : formatSize(width),
          maxHeight: isFullscreen ? undefined : formatSize(maxHeight),
          ...style,
        }}>
        <div className={styles.inner}>{children}</div>
      </div>
    );
  }

  const positionStyle =
    position != null && !isFullscreen
      ? {
          bottom:
            position.bottom == null ? 'auto' : formatSize(position.bottom),
          left: position.left == null ? 'auto' : formatSize(position.left),
          margin: 0,
          right: position.right == null ? 'auto' : formatSize(position.right),
          top: position.top == null ? 'auto' : formatSize(position.top),
        }
      : undefined;

  return (
    <dialog
      aria-label={label}
      aria-modal="true"
      className={cx(
        styles.root,
        isOpen ? styles.open : undefined,
        isFullscreen ? styles.fullscreen : undefined,
        className,
      )}
      data-testid={dataTestId}
      onCancel={event => {
        event.preventDefault();
        if (allowEscape) {
          onOpenChange(false);
        }
      }}
      onClick={event => {
        if (event.target === event.currentTarget && allowBackdropClick) {
          onOpenChange(false);
        }
      }}
      ref={mergeRefs(ref as Ref<HTMLDialogElement>, dialogRef)}
      role={purpose === 'required' ? 'alertdialog' : undefined}
      style={{
        width: isFullscreen ? undefined : formatSize(width),
        maxHeight: isFullscreen ? undefined : formatSize(maxHeight),
        ...positionStyle,
        ...style,
      }}>
      <div className={styles.inner}>{children}</div>
    </dialog>
  );
}

Dialog.displayName = 'Dialog';
