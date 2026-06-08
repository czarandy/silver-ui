/* eslint-disable jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions */
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {dialogRecipe} from './Dialog.recipe';
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
   * Accessible label for the dialog. When provided, sets `aria-label`
   * directly. When omitted, the dialog uses `aria-labelledby` to
   * reference the heading rendered by a child `LayoutHeader`.
   *
   * Omit this prop when using a `LayoutHeader` inside the dialog.
   * Set it when the dialog has no visible heading.
   */
  label?: string;
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

function formatSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

/**
 * Whether a pointer coordinate falls outside an element's border box. Native
 * `<dialog>` renders its backdrop outside this box, so a click whose
 * coordinates land outside the dialog rect is a backdrop click — regardless of
 * any padding, border, or margin on the dialog element.
 */
function isPointerOutsideElement(
  element: HTMLElement,
  clientX: number,
  clientY: number,
): boolean {
  const rect = element.getBoundingClientRect();
  return (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  );
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
  const pointerDownOnBackdropRef = useRef(false);
  const titleId = useId();
  const isFullscreen = variant === 'fullscreen';
  const {isBackdropDismissEnabled, isEscapeDismissEnabled} =
    getDismissBehavior(dismissBehavior);
  const dialogContextValue = useMemo(
    () => ({onOpenChange, titleId}),
    [onOpenChange, titleId],
  );
  const classes = dialogRecipe({isOpen, variant});

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog == null) {
      return;
    }

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      // Override the dialog's default initial focus when an autofocus target is
      // present. Focus restoration on close is left to the native <dialog>,
      // which restores focus to the element that was focused before
      // showModal() — avoiding races with external focus management.
      const autofocusTarget =
        dialog.querySelector<HTMLElement>('[data-autofocus="true"]') ??
        dialog.querySelector<HTMLElement>('[data-dialog-autofocus="true"]');
      autofocusTarget?.focus();
    } else if (dialog.open) {
      dialog.close();
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
      aria-labelledby={label == null ? titleId : undefined}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      onCancel={event => {
        event.preventDefault();
        if (isEscapeDismissEnabled) {
          onOpenChange(false);
        }
      }}
      onClick={event => {
        const startedOnBackdrop = pointerDownOnBackdropRef.current;
        pointerDownOnBackdropRef.current = false;
        // Keyboard-synthesized clicks (Enter/Space on a child control) report
        // detail 0 and 0,0 coordinates; ignore them so they are not mistaken
        // for a backdrop click.
        if (event.detail === 0) {
          return;
        }
        const releasedOnBackdrop = isPointerOutsideElement(
          event.currentTarget,
          event.clientX,
          event.clientY,
        );
        // Dismiss only when the press and the release both landed on the
        // backdrop. This ignores clicks on dialog padding (inside the rect) and
        // inside-out drags (e.g. text selection) that end on the backdrop.
        if (
          startedOnBackdrop &&
          releasedOnBackdrop &&
          isBackdropDismissEnabled
        ) {
          onOpenChange(false);
        }
      }}
      onPointerDown={event => {
        pointerDownOnBackdropRef.current = isPointerOutsideElement(
          event.currentTarget,
          event.clientX,
          event.clientY,
        );
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
        <div className={classes.inner}>{children}</div>
      </DialogContext>
    </dialog>
  );
}

Dialog.displayName = 'Dialog';
