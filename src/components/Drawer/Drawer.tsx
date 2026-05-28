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

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  isOpen: boolean;
  label: string;
  onOpenChange: (isOpen: boolean) => void;
  placement?: DrawerPlacement;
  ref?: Ref<HTMLElement>;
  size?: number | string;
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
  left: css({
    inset: 0,
    mr: 'auto',
    h: '100dvh',
    maxH: '100dvh',
    borderRadius: 0,
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
  }),
  right: css({
    inset: 0,
    ml: 'auto',
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
  left: 320,
  right: 320,
  top: '40vh',
  bottom: '40vh',
};

function getSizeStyle(
  placement: DrawerPlacement,
  size: number | string,
): CSSProperties {
  const formatted = formatSize(size);
  if (placement === 'left' || placement === 'right') {
    return {width: formatted, maxWidth: '100dvw'};
  }
  return {height: formatted, maxHeight: '100dvh'};
}

export function Drawer({
  isOpen,
  label,
  onOpenChange,
  placement = 'right',
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
