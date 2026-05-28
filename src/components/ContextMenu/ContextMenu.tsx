/* eslint-disable @eslint-react/no-array-index-key, @typescript-eslint/no-base-to-string */
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
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import type {ButtonSize} from '../Button';
import {Divider} from '../Divider';
import {
  DropdownMenuContext,
  DropdownMenuItem,
  type DropdownMenuDivider,
  type DropdownMenuItemData,
  type DropdownMenuItemProps,
  type DropdownMenuOption,
  type DropdownMenuSection,
} from '../DropdownMenu';
import {Text} from '../Text';

export type ContextMenuItemData = DropdownMenuItemData;
export type ContextMenuDivider = DropdownMenuDivider;
export type ContextMenuSection = DropdownMenuSection;
export type ContextMenuOption = DropdownMenuOption;
export type ContextMenuSize = ButtonSize;
export type ContextMenuItemProps = DropdownMenuItemProps;
export const ContextMenuItem = DropdownMenuItem;

interface ContextMenuBaseProps {
  /**
   * Trigger area. Right-click this content to open the menu.
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
   * Whether to focus the first menu item when the menu opens.
   * @default true
   */
  hasAutoFocus?: boolean;
  /**
   * Whether right-click should use the native browser context menu instead.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Menu surface width.
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
  /**
   * Data-driven menu items.
   */
  items: ReadonlyArray<ContextMenuOption>;
  /**
   * Compound menu content. Use this instead of items.
   */
  menuContent?: undefined;
}

interface ContextMenuCompoundProps extends ContextMenuBaseProps {
  /**
   * Data-driven menu items. Use this instead of menuContent.
   */
  items?: undefined;
  /**
   * Compound menu content.
   */
  menuContent: ReactNode;
}

export type ContextMenuProps = ContextMenuDataProps | ContextMenuCompoundProps;

const styles = {
  trigger: css({
    outline: 'none',
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
    bg: 'bg.overlay',
    boxShadow: 'lg',
  }),
  section: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
  }),
  heading: css({
    px: '2',
    py: '1',
    userSelect: 'none',
  }),
  divider: css({
    my: '1',
  }),
} as const;

function formatWidth(value: number | string | undefined): string | undefined {
  if (value == null) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

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

function renderItems(items: ReadonlyArray<ContextMenuOption>): ReactNode {
  return items.map((item, index) => {
    if ('type' in item && item.type === 'divider') {
      return <Divider className={styles.divider} key={`divider-${index}`} />;
    }

    if ('type' in item) {
      return (
        <div
          aria-label={item.title}
          className={styles.section}
          key={`section-${item.title ?? index}`}
          role="group">
          {item.title != null ? (
            <Text
              as="span"
              className={styles.heading}
              color="secondary"
              type="supporting">
              {item.title}
            </Text>
          ) : null}
          {item.items.map(sectionItem => (
            <DropdownMenuItem
              description={sectionItem.description}
              icon={sectionItem.icon}
              isDisabled={sectionItem.isDisabled}
              key={String(sectionItem.label)}
              label={sectionItem.label}
              onClick={sectionItem.onClick}
            />
          ))}
        </div>
      );
    }

    return (
      <DropdownMenuItem
        description={item.description}
        icon={item.icon}
        isDisabled={item.isDisabled}
        key={String(item.label)}
        label={item.label}
        onClick={item.onClick}
      />
    );
  });
}

/**
 * Right-click context menu for contextual actions on a region.
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
      if (hasAutoFocus) {
        requestAnimationFrame(focusFirstItem);
      }
    },
    [focusFirstItem, hasAutoFocus, onOpenChange],
  );

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
      event.preventDefault();
      show(event.clientX, event.clientY);
    },
    [isDisabled, show],
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

  const getMenuItems = useCallback(() => {
    return menuRef.current == null
      ? []
      : Array.from(
          menuRef.current.querySelectorAll<HTMLElement>(
            '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
          ),
        );
  }, []);

  const handleMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const menuItems = getMenuItems();
      const currentIndex = menuItems.findIndex(
        item => item === document.activeElement,
      );
      let nextIndex: number;

      switch (event.key) {
        case 'ArrowDown':
          nextIndex =
            currentIndex === -1
              ? 0
              : Math.min(currentIndex + 1, menuItems.length - 1);
          break;
        case 'ArrowUp':
          nextIndex =
            currentIndex === -1
              ? menuItems.length - 1
              : Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = menuItems.length - 1;
          break;
        case 'Escape':
          event.preventDefault();
          hide();
          return;
        case 'Enter':
        case ' ':
          if (document.activeElement instanceof HTMLElement) {
            event.preventDefault();
            document.activeElement.click();
          }
          return;
        default:
          return;
      }

      event.preventDefault();
      menuItems[nextIndex]?.focus();
    },
    [getMenuItems, hide],
  );

  const menuNode = items == null ? menuContent : renderItems(items);

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
        ref={triggerRef}
        role="button"
        tabIndex={0}>
        {children}
      </div>
      <div
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
          width: formatWidth(menuWidth),
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
