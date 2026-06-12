import type {CSSProperties, ReactNode, Ref} from 'react';
import {useEffect, useRef} from 'react';
import {cx} from 'internal/cx';
import {
  resolveDismissBehavior,
  type DismissBehavior,
} from '../../internal/dismissBehavior';
import {mergeRefs} from '../../internal/mergeRefs';
import {useBackdropDismiss} from '../../internal/useBackdropDismiss';
import {useScrollLock} from '../../internal/useScrollLock';
import {drawerRecipe} from './Drawer.recipe';

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';
export type DrawerDismissBehavior = DismissBehavior;

export interface DrawerProps {
  /**
   * Drawer body content.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the drawer.
   */
  className?: string;
  /**
   * Test ID applied to the drawer.
   */
  'data-testid'?: string;
  /**
   * Controls whether Escape and backdrop clicks request dismissal. Pass a
   * boolean to enable or disable both behaviors together.
   * @default {isEscapeDismissEnabled: true, isBackdropDismissEnabled: true}
   */
  dismissBehavior?: DrawerDismissBehavior;
  /**
   * Whether the drawer is open.
   */
  isOpen: boolean;
  /**
   * Accessible label for the drawer.
   */
  label: string;
  /**
   * Called when the drawer requests an open-state change.
   */
  onOpenChange: (isOpen: boolean) => void;
  /**
   * Edge of the viewport the drawer slides in from.
   * @default 'end'
   */
  placement?: DrawerPlacement;
  /**
   * Ref forwarded to the drawer element.
   */
  ref?: Ref<HTMLDialogElement>;
  /**
   * Width (start/end) or height (top/bottom) of the drawer.
   */
  size?: number | string;
  /**
   * Inline styles applied to the drawer.
   */
  style?: CSSProperties;
}

function formatSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

const DEFAULT_SIZES: Record<DrawerPlacement, number | string> = {
  start: 320,
  end: 320,
  top: '40vh',
  bottom: '40vh',
};

function getSizeStyle(
  placement: DrawerPlacement,
  size: number | string,
): CSSProperties {
  const formatted = formatSize(size);
  if (placement === 'start' || placement === 'end') {
    return {width: formatted, maxWidth: '100dvw'};
  }
  return {height: formatted, maxHeight: '100dvh'};
}

/**
 * A slide-in panel anchored to an edge of the viewport.
 */
export function Drawer({
  isOpen,
  label,
  onOpenChange,
  placement = 'end',
  size,
  dismissBehavior,
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DrawerProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const {isBackdropDismissEnabled, isEscapeDismissEnabled} =
    resolveDismissBehavior(dismissBehavior);
  const backdropDismiss = useBackdropDismiss<HTMLDialogElement>({
    isEnabled: isBackdropDismissEnabled,
    onDismiss: () => onOpenChange(false),
  });

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
      dialog
        .querySelector<HTMLElement>('[data-autofocus="true"], [autofocus]')
        ?.focus();
    } else if (dialog.open) {
      dialog.close();
      triggerRef.current?.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  useScrollLock(isOpen);

  const effectiveSize = size ?? DEFAULT_SIZES[placement];
  const sizeStyle = getSizeStyle(placement, effectiveSize);
  const classes = drawerRecipe({isOpen, placement});

  return (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions -- native dialog backdrop clicks close the drawer
    <dialog
      aria-label={label}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      onCancel={event => {
        event.preventDefault();
        if (isEscapeDismissEnabled) {
          onOpenChange(false);
        }
      }}
      onClick={backdropDismiss.onClick}
      onPointerDown={backdropDismiss.onPointerDown}
      ref={mergeRefs(ref, dialogRef)}
      style={{...sizeStyle, ...style}}>
      <div className={classes.inner}>{children}</div>
    </dialog>
  );
}

Drawer.displayName = 'Drawer';
