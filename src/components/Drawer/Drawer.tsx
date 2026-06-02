import type {CSSProperties, ReactNode, Ref} from 'react';
import {useEffect, useRef} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';

export type DrawerPlacement = 'start' | 'end' | 'top' | 'bottom';

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
  ref?: Ref<HTMLElement>;
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

const styles = {
  root: css({
    position: 'fixed',
    p: 0,
    borderWidth: 0,
    bg: 'bg',
    color: 'fg',
    boxShadow: 'xl',
    display: 'flex',
    flexDirection: 'column',
    overscrollBehavior: 'contain',
    _backdrop: {
      bg: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(2px)',
    },
    _focusVisible: {
      outline: 'none',
    },
  }),
  open: css({
    display: 'flex',
  }),
  start: css({
    inset: 0,
    marginInlineEnd: 'auto',
    h: '100dvh',
    maxH: '100dvh',
    borderRadius: 0,
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
  }),
  end: css({
    inset: 0,
    marginInlineStart: 'auto',
    h: '100dvh',
    maxH: '100dvh',
    borderRadius: 0,
    borderInlineStartWidth: '1px',
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: 'border',
  }),
  top: css({
    inset: 0,
    mb: 'auto',
    w: '100dvw',
    maxW: '100dvw',
    borderRadius: 0,
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
  }),
  bottom: css({
    inset: 0,
    mt: 'auto',
    w: '100dvw',
    maxW: '100dvw',
    borderRadius: 0,
    borderBlockStartWidth: '1px',
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: 'border',
  }),
  inner: css({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 auto',
    minH: 0,
    overflow: 'hidden',
  }),
} as const;

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
  children,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: DrawerProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

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

  const effectiveSize = size ?? DEFAULT_SIZES[placement];
  const sizeStyle = getSizeStyle(placement, effectiveSize);

  return (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions -- native dialog backdrop clicks close the drawer
    <dialog
      aria-label={label}
      aria-modal="true"
      className={cx(
        styles.root,
        isOpen ? styles.open : undefined,
        styles[placement],
        className,
      )}
      data-testid={dataTestId}
      onCancel={event => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClick={event => {
        if (event.target === event.currentTarget) {
          onOpenChange(false);
        }
      }}
      ref={mergeRefs(ref as Ref<HTMLDialogElement>, dialogRef)}
      style={{...sizeStyle, ...style}}>
      <div className={styles.inner}>{children}</div>
    </dialog>
  );
}

Drawer.displayName = 'Drawer';
