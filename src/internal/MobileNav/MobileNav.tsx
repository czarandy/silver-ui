import {X} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {useCallback, useEffect, useRef} from 'react';
import {css} from 'styled-system/css';
import {useAppShellMobile} from '../../components/AppShell/AppShellMobileContext';
import {Button} from '../../components/Button';
import {cx} from '../cx';
import {mergeRefs} from '../mergeRefs';
import {mobileNavRecipe} from './MobileNav.recipe';

export type MobileNavSide = 'start' | 'end';

/**
 * Slide-out drawer for mobile navigation.
 */
export interface MobileNavProps {
  /**
   * Drawer body content.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the dialog element.
   */
  className?: string;
  /**
   * Test ID applied to the dialog element.
   */
  'data-testid'?: string;
  /**
   * Content rendered in the drawer header bar.
   */
  header?: ReactNode;
  /**
   * Whether the drawer is open.
   */
  isOpen?: boolean;
  /**
   * Accessible label for the dialog.
   */
  label?: string;
  /**
   * Called when the drawer requests an open-state change.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the dialog element.
   */
  ref?: Ref<HTMLDialogElement>;
  /**
   * Which edge of the viewport the drawer slides from.
   * @default 'end'
   */
  side?: MobileNavSide;
  /**
   * Maximum drawer width.
   * @default 320
   */
  size?: number | string;
  /**
   * Inline styles applied to the dialog element.
   */
  style?: CSSProperties;
}

function formatSize(value: number | string): string {
  return typeof value === 'number' ? `${value}px` : value;
}

const CLOSE_BUTTON_SELECTOR = '[aria-label="Close navigation"]';

const styles = {
  drawer: css({
    position: 'absolute',
    insetBlock: 0,
    display: 'flex',
    flexDirection: 'column',
    bg: 'bg',
    borderColor: 'border',
    overflow: 'hidden',
    transitionProperty: 'transform',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01s',
    },
  }),
  drawerStart: css({
    insetInlineStart: 0,
    borderInlineEndWidth: 'default',
    transform: 'translateX(-100%)',
  }),
  drawerEnd: css({
    insetInlineEnd: 0,
    borderInlineStartWidth: 'default',
    transform: 'translateX(100%)',
  }),
  drawerOpen: css({
    transform: 'translateX(0)',
  }),
  header: css({
    h: '12',
    px: '2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBlockEndWidth: 'default',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
    flexShrink: 0,
  }),
  body: css({
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    p: '2',
  }),
};

export function MobileNav({
  children,
  className,
  'data-testid': dataTestId,
  header,
  isOpen: isOpenFromProps,
  label,
  onOpenChange: onOpenChangeFromProps,
  ref,
  side = 'end',
  size = 320,
  style,
}: MobileNavProps): React.JSX.Element {
  const appShellMobile = useAppShellMobile();
  const isOpen = isOpenFromProps ?? appShellMobile.isMobileNavOpen;
  const {openMobileNav, closeMobileNav} = appShellMobile;
  const onOpenChange = useCallback(
    (isNextOpen: boolean) => {
      if (onOpenChangeFromProps != null) {
        onOpenChangeFromProps(isNextOpen);
      } else if (isNextOpen) {
        openMobileNav();
      } else {
        closeMobileNav();
      }
    },
    [openMobileNav, closeMobileNav, onOpenChangeFromProps],
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog == null) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();

      const firstFocusable = dialog.querySelector<HTMLElement>(
        `a[href], button:not(${CLOSE_BUTTON_SELECTOR}):not([disabled])`,
      );
      if (firstFocusable != null) {
        firstFocusable.focus();
      }
    } else if (!isOpen && dialog.open) {
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

  const formattedSize = formatSize(size);

  return (
    <dialog
      aria-label={label ?? (typeof header === 'string' ? header : 'Navigation')}
      className={cx(mobileNavRecipe({isOpen}), className)}
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
      ref={mergeRefs(ref, dialogRef)}
      style={style}>
      <div
        className={cx(
          styles.drawer,
          side === 'start' ? styles.drawerStart : styles.drawerEnd,
          isOpen && styles.drawerOpen,
        )}
        style={{maxWidth: formattedSize, width: '100vw'}}>
        <div className={styles.header}>
          {header ?? <span />}
          <Button
            icon={X}
            isIconOnly
            label="Close navigation"
            onClick={() => onOpenChange(false)}
            variant="ghost"
          />
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}

MobileNav.displayName = 'MobileNav';
