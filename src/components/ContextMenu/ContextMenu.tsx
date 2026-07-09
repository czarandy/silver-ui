'use client';

import {
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
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
  trigger: css({
    display: 'contents',
  }),
  menu: css({
    display: 'none',
    flexDirection: 'column',
    gap: '0.5',
    maxH: '80',
    minW: '40',
    m: 0,
    overflowY: 'auto',
    p: '1',
    borderWidth: 0,
    borderRadius: 'md',
    _open: {
      display: 'flex',
    },
    bg: 'bg',
    boxShadow: 'lg',
    borderStyle: 'solid',
    borderColor: 'border',
  }),
} as const;

function isPopoverOpen(element: HTMLElement | null): boolean {
  if (element == null) {
    return false;
  }
  if (element.hasAttribute('popover-open')) {
    return true;
  }
  try {
    return element.matches(':popover-open');
  } catch {
    return false;
  }
}

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
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressOriginRef = useRef<{x: number; y: number} | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({x: 0, y: 0});
  const items = 'items' in props ? props.items : undefined;
  const menuContent = 'menuContent' in props ? props.menuContent : undefined;

  const hide = useCallback(() => {
    if (!isOpen) {
      return;
    }
    menuRef.current?.hidePopover();
    setIsOpen(false);
    onOpenChange?.(false);
  }, [isOpen, onOpenChange]);

  const focusFirstItem = useCallback(() => {
    const firstItem = menuRef.current?.querySelector<HTMLElement>(
      '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
    );
    firstItem?.focus();
  }, []);

  const show = useCallback(
    (x: number, y: number) => {
      setPosition({x, y});
      if (isPopoverOpen(menuRef.current)) {
        menuRef.current?.hidePopover();
      }
      menuRef.current?.showPopover();
      setIsOpen(true);
      onOpenChange?.(true);
      requestAnimationFrame(() => {
        if (menuRef.current != null) {
          const rect = menuRef.current.getBoundingClientRect();
          const margin = 4;
          const clampedX = Math.min(x, window.innerWidth - rect.width - margin);
          const clampedY = Math.min(
            y,
            window.innerHeight - rect.height - margin,
          );
          setPosition({
            x: Math.max(0, clampedX),
            y: Math.max(0, clampedY),
          });
        }
        if (hasAutoFocus) {
          focusFirstItem();
        }
      });
    },
    [focusFirstItem, hasAutoFocus, onOpenChange],
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
    if (!isOpen) {
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
      hide();
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [hide, isOpen]);

  useImperativeHandle(ref, () => triggerRef.current as HTMLDivElement);

  const contextValue = useMemo(
    () => ({
      closeMenu: hide,
      menuSize: size,
    }),
    [hide, size],
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

  const handleMenuKeyDown = useMenuKeyboard(menuRef, hide, triggerRef);

  const menuNode = useMemo(
    (): ReactNode => (items == null ? menuContent : renderMenuItems(items)),
    [items, menuContent],
  );

  return (
    <>
      <div
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
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
        aria-label="Context menu"
        className={cx(styles.menu, className)}
        id={menuId}
        onKeyDown={handleMenuKeyDown}
        popover="manual"
        ref={menuRef}
        role="menu"
        style={{
          left: position.x,
          position: 'fixed',
          top: position.y,
          width: formatMenuWidth(menuWidth),
          ...style,
        }}
        tabIndex={-1}>
        <DropdownMenuContext value={contextValue}>
          {menuNode}
        </DropdownMenuContext>
      </div>
    </>
  );
}

ContextMenu.displayName = 'ContextMenu';
