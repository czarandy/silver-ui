'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
} from 'react';
import type {ButtonSize} from 'components/Button';
import {
  DropdownMenuContext,
  DropdownMenuItem,
  type DropdownMenuDivider,
  type DropdownMenuItemData,
  type DropdownMenuItemProps,
  type DropdownMenuOption,
  type DropdownMenuSection,
} from 'components/DropdownMenu';
import {
  formatMenuWidth,
  renderMenuItems,
  useMenuKeyboard,
} from 'components/DropdownMenu/menuUtils';
import {mergeRefs} from 'internal/mergeRefs';
import {useLayer, type LayerReturn} from 'internal/useLayer';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export type ContextMenuSize = ButtonSize;
export type ContextMenuItemData = DropdownMenuItemData;
export type ContextMenuItemProps = DropdownMenuItemProps;
export type ContextMenuDivider = DropdownMenuDivider;
export type ContextMenuSection = DropdownMenuSection;
export type ContextMenuOption = DropdownMenuOption;
export const ContextMenuItem = DropdownMenuItem;

/**
 * How long a touch must be held before the context menu opens.
 */
const LONG_PRESS_DURATION_MS = 500;

/**
 * How far a touch may drift (in px) before it is treated as a scroll/drag
 * rather than a long press.
 */
const LONG_PRESS_MOVE_THRESHOLD_PX = 10;

interface ContextMenuBaseProps {
  /**
   * The region that triggers the context menu on right-click or touch
   * long-press.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the menu surface.
   */
  className?: string;
  /**
   * Test ID applied to the trigger wrapper.
   */
  'data-testid'?: string;
  /**
   * Whether to auto-focus the first menu item on open.
   * @default true
   */
  hasAutoFocus?: boolean;
  /**
   * Whether the context menu is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Width of the menu surface.
   * @default 160
   */
  menuWidth?: number | string;
  /**
   * Called when the menu open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the trigger wrapper.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Menu item size.
   * @default 'md'
   */
  size?: ContextMenuSize;
  /**
   * Inline styles applied to the menu surface.
   */
  style?: CSSProperties;
}

interface ContextMenuDataProps extends ContextMenuBaseProps {
  items: ReadonlyArray<ContextMenuOption>;
  menuContent?: never;
}

interface ContextMenuCompoundProps extends ContextMenuBaseProps {
  items?: never;
  menuContent: ReactNode;
}

export type ContextMenuProps = ContextMenuDataProps | ContextMenuCompoundProps;

const styles = {
  anchor: css({
    position: 'fixed',
    top: 0,
    left: 0,
    w: 0,
    h: 0,
    pointerEvents: 'none',
  }),
  trigger: css({
    display: 'contents',
  }),
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    maxH: '80',
    minW: '40',
    m: 0,
    overflowY: 'auto',
    p: '1',
    borderWidth: 0,
    borderRadius: 'md',
    bg: 'bg',
    boxShadow: 'lg',
    borderStyle: 'solid',
    borderColor: 'border',
  }),
} as const;

/**
 * Right-click (or touch long-press) context menu for contextual actions on a
 * region.
 */
export function ContextMenu({
  children,
  className,
  'data-testid': dataTestId,
  hasAutoFocus = true,
  isDisabled = false,
  menuWidth = 160,
  onOpenChange,
  ref,
  size = 'md',
  style,
  ...props
}: ContextMenuProps): React.JSX.Element {
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressOriginRef = useRef<{x: number; y: number} | null>(null);
  const items = 'items' in props ? props.items : undefined;
  const menuContent = 'menuContent' in props ? props.menuContent : undefined;

  const handleShow = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleHide = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  const layer: LayerReturn = useLayer({
    isDismissable: false,
    isEscapeDismissEnabled: true,
    onEscape: () => {
      layer.hide();
      triggerRef.current?.focus();
    },
    onHide: handleHide,
    onShow: handleShow,
  });

  const focusFirstItem = useCallback(() => {
    const firstItem = menuRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
    );
    firstItem?.focus();
  }, []);

  const show = useCallback(
    (x: number, y: number) => {
      if (anchorRef.current == null) {
        return;
      }

      anchorRef.current.style.left = `${x}px`;
      anchorRef.current.style.top = `${y}px`;
      const shouldAutoFocus = hasAutoFocus && !layer.isOpen;
      layer.show();

      if (shouldAutoFocus) {
        requestAnimationFrame(() => {
          focusFirstItem();
        });
      }
    },
    [focusFirstItem, hasAutoFocus, layer],
  );

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current != null) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    longPressOriginRef.current = null;
  }, []);

  useEffect(() => cancelLongPress, [cancelLongPress]);

  useEffect(() => {
    if (!layer.isOpen) {
      return;
    }

    const handleMouseDown = (event: globalThis.MouseEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        (menuRef.current?.contains(target) === true ||
          triggerRef.current?.contains(target) === true)
      ) {
        return;
      }
      layer.hide();
    };

    const handleScroll = (event: Event) => {
      const target = event.target;
      if (
        target instanceof Node &&
        menuRef.current?.contains(target) === true
      ) {
        return;
      }
      layer.hide();
    };

    document.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [layer]);

  useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

  const contextValue = useMemo(
    () => ({
      closeMenu: layer.hide,
      menuSize: size,
    }),
    [layer.hide, size],
  );

  const handleContextMenu = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }
      // A native touch long-press may fire `contextmenu`; if so, drop any
      // pending long-press timer so the menu isn't opened twice.
      cancelLongPress();
      event.preventDefault();
      show(event.clientX, event.clientY);
    },
    [cancelLongPress, isDisabled, show],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (isDisabled || event.pointerType !== 'touch') {
        return;
      }
      cancelLongPress();
      const {clientX, clientY} = event;
      longPressOriginRef.current = {x: clientX, y: clientY};
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        longPressOriginRef.current = null;
        show(clientX, clientY);
      }, LONG_PRESS_DURATION_MS);
    },
    [cancelLongPress, isDisabled, show],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      const origin = longPressOriginRef.current;
      if (origin == null) {
        return;
      }
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.hypot(dx, dy) > LONG_PRESS_MOVE_THRESHOLD_PX) {
        cancelLongPress();
      }
    },
    [cancelLongPress],
  );

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }
      if (
        event.key !== 'ContextMenu' &&
        !(event.shiftKey && event.key === 'F10')
      ) {
        return;
      }
      event.preventDefault();
      const rect = event.currentTarget.getBoundingClientRect();
      show(rect.left, rect.bottom);
    },
    [isDisabled, show],
  );

  const handleMenuKeyDown = useMenuKeyboard(menuRef, layer.hide, triggerRef);

  const menuNode = useMemo(
    (): ReactNode => (items == null ? menuContent : renderMenuItems(items)),
    [items, menuContent],
  );

  return (
    <>
      <div
        aria-controls={layer.isOpen ? layer.id : undefined}
        aria-expanded={layer.isOpen}
        aria-haspopup="menu"
        className={styles.trigger}
        data-testid={dataTestId}
        onContextMenu={handleContextMenu}
        onKeyDown={handleTriggerKeyDown}
        onPointerCancel={cancelLongPress}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={cancelLongPress}
        ref={triggerRef}
        role="button"
        tabIndex={0}>
        {children}
      </div>
      <div
        aria-hidden="true"
        className={styles.anchor}
        ref={mergeRefs(anchorRef, layer.ref)}
      />
      {layer.render(
        <div
          aria-label="Context menu"
          className={cx(styles.menu, className)}
          onKeyDown={handleMenuKeyDown}
          ref={menuRef}
          role="menu"
          style={{width: formatMenuWidth(menuWidth), ...style}}
          tabIndex={-1}>
          <DropdownMenuContext value={contextValue}>
            {menuNode}
          </DropdownMenuContext>
        </div>,
        {alignment: 'start', placement: 'below'},
      )}
    </>
  );
}

ContextMenu.displayName = 'ContextMenu';
