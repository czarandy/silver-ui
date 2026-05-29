import {X} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {useEffect, useMemo, useRef} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useAppShellMobile} from '../AppShell/AppShellMobileContext';
import {Button} from '../Button';
import {Heading} from '../Text';
import {mobileNavRecipe} from './MobileNav.recipe';

export type MobileNavSide = 'start' | 'end';

/**
 * Slide-out drawer for mobile navigation.
 */
export interface MobileNavProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  header?: ReactNode;
  isOpen?: boolean;
  label?: string;
  onOpenChange?: (isOpen: boolean) => void;
  ref?: Ref<HTMLDialogElement>;
  side?: MobileNavSide;
  style?: CSSProperties;
  width?: number;
}

const styles = {
  drawer: css({
    position: 'absolute',
    insetBlock: 0,
    display: 'flex',
    flexDirection: 'column',
    bg: 'bg',
    borderColor: 'border',
    boxSizing: 'border-box',
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
    borderInlineEndWidth: '1px',
    transform: 'translateX(-100%)',
  }),
  drawerEnd: css({
    insetInlineEnd: 0,
    borderInlineStartWidth: '1px',
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
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
    flexShrink: 0,
  }),
  content: css({
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
  style,
  width = 320,
}: MobileNavProps): React.JSX.Element {
  const appShellMobile = useAppShellMobile();
  const isOpen = isOpenFromProps ?? appShellMobile.isMobileNavOpen;
  const onOpenChange = useMemo(
    () =>
      onOpenChangeFromProps ??
      ((isNavOpen: boolean) => {
        if (isNavOpen) {
          appShellMobile.openMobileNav();
        } else {
          appShellMobile.closeMobileNav();
        }
      }),
    [appShellMobile, onOpenChangeFromProps],
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (dialog == null) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const setRef = (node: HTMLDialogElement | null) => {
    dialogRef.current = node;

    if (typeof ref === 'function') {
      ref(node);
    } else if (ref != null) {
      ref.current = node;
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions -- native dialog backdrop clicks close the drawer
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
      ref={setRef}
      style={style}>
      <div
        className={cx(
          styles.drawer,
          side === 'start' ? styles.drawerStart : styles.drawerEnd,
          isOpen && styles.drawerOpen,
        )}
        style={{maxWidth: width, width: '100vw'}}>
        <div className={styles.header}>
          {typeof header === 'string' ? (
            <Heading level={2}>{header}</Heading>
          ) : (
            (header ?? <span />)
          )}
          <Button
            icon={X}
            isIconOnly
            label="Close navigation"
            onClick={() => onOpenChange(false)}
            variant="ghost"
          />
        </div>
        <div className={styles.content}>{children}</div>
      </div>
    </dialog>
  );
}

MobileNav.displayName = 'MobileNav';
