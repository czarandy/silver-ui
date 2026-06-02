/* eslint-disable jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions */
import {
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {DialogContext} from './DialogContext';

export type DialogVariant = 'fullscreen' | 'standard';
export type DialogRole = 'alertdialog' | 'dialog';
export type DialogDismissBehavior =
  | boolean
  | {
      isBackdropDismissEnabled?: boolean;
      isEscapeDismissEnabled?: boolean;
    };

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
   * Controls whether Escape and backdrop clicks request dismissal. Pass a
   * boolean to enable or disable both behaviors together.
   * @default {isEscapeDismissEnabled: true, isBackdropDismissEnabled: true}
   */
  dismissBehavior?: DialogDismissBehavior;
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
   * Ref forwarded to the dialog element.
   */
  ref?: Ref<HTMLDialogElement>;
  /**
   * ARIA role exposed by the dialog.
   * @default 'dialog'
   */
  role?: DialogRole;
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
      bg: 'overlay.scrim',
      backdropFilter: 'blur(2px)',
    },
    _focusVisible: {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
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
} as const;

function formatSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function getDismissBehavior(
  dismissBehavior: DialogDismissBehavior | undefined,
): {isBackdropDismissEnabled: boolean; isEscapeDismissEnabled: boolean} {
  if (dismissBehavior == null) {
    return {isBackdropDismissEnabled: true, isEscapeDismissEnabled: true};
  }

  if (typeof dismissBehavior === 'boolean') {
    return {
      isBackdropDismissEnabled: dismissBehavior,
      isEscapeDismissEnabled: dismissBehavior,
    };
  }

  return {
    isBackdropDismissEnabled: dismissBehavior.isBackdropDismissEnabled ?? true,
    isEscapeDismissEnabled: dismissBehavior.isEscapeDismissEnabled ?? true,
  };
}

/**
 * A modal dialog surface with backdrop, focus management,
 * and configurable dismiss behavior.
 */
export function Dialog({
  isOpen,
  label,
  onOpenChange,
  width = 400,
  maxHeight = '75vh',
  position,
  variant = 'standard',
  dismissBehavior,
  children,
  className,
  'data-testid': dataTestId,
  role = 'dialog',
  style,
  ref,
}: DialogProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const isFullscreen = variant === 'fullscreen';
  const {isBackdropDismissEnabled, isEscapeDismissEnabled} =
    getDismissBehavior(dismissBehavior);
  const dialogContextValue = useMemo(() => ({onOpenChange}), [onOpenChange]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) {
        dialog.showModal();
      }
      const autofocusTarget =
        dialog.querySelector<HTMLElement>('[data-autofocus="true"]') ??
        dialog.querySelector<HTMLElement>('[data-dialog-autofocus="true"]');
      autofocusTarget?.focus();
    } else if (dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

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
      className={cx(
        styles.root,
        isOpen ? styles.open : undefined,
        isFullscreen ? styles.fullscreen : undefined,
        className,
      )}
      data-testid={dataTestId}
      onCancel={event => {
        event.preventDefault();
        if (isEscapeDismissEnabled) {
          onOpenChange(false);
        }
      }}
      onClick={event => {
        if (event.target === event.currentTarget && isBackdropDismissEnabled) {
          onOpenChange(false);
        }
      }}
      ref={mergeRefs(ref, dialogRef)}
      role={role === 'dialog' ? undefined : role}
      style={{
        width: isFullscreen ? undefined : formatSize(width),
        maxHeight: isFullscreen ? undefined : formatSize(maxHeight),
        ...positionStyle,
        ...style,
      }}>
      <DialogContext value={dialogContextValue}>
        <div className={styles.inner}>{children}</div>
      </DialogContext>
    </dialog>
  );
}

Dialog.displayName = 'Dialog';
