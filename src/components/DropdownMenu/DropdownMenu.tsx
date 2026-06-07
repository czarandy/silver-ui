import {ChevronDown} from 'lucide-react';
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import isReactNode from '../../internal/isReactNode';
import {Button, type ButtonProps, type ButtonSize} from '../Button';
import {Icon} from '../Icon';
import {Popover} from '../Popover';
import {DropdownMenuContext} from './DropdownMenuContext';
import {formatMenuWidth, renderMenuItems, useMenuKeyboard} from './menuUtils';
import type {DropdownMenuOption} from './types';

export type {
  DropdownMenuDivider,
  DropdownMenuItemData,
  DropdownMenuOption,
  DropdownMenuSection,
} from './types';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type DropdownMenuButtonProps = DistributiveOmit<ButtonProps, 'onClick'>;

export interface DropdownMenuProps {
  /**
   * Trigger button props.
   */
  button?: DropdownMenuButtonProps;
  /**
   * Compound menu content (alternative to `items`).
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the menu surface.
   */
  className?: string;
  /**
   * Test ID applied to the trigger button.
   */
  'data-testid'?: string;
  /**
   * Whether to auto-focus the first menu item on open.
   * @default true
   */
  hasAutoFocus?: boolean;
  /**
   * Whether to show a chevron on the trigger button.
   * @default true
   */
  hasChevron?: boolean;
  /**
   * Controlled open state.
   */
  isMenuOpen?: boolean;
  /**
   * Data-driven menu items.
   */
  items?: ReadonlyArray<DropdownMenuOption>;
  /**
   * Width of the menu surface.
   */
  menuWidth?: number | string;
  /**
   * Click handler for the trigger button.
   */
  onClick?: () => void;
  /**
   * Called when the menu open state changes.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /**
   * Ref forwarded to the trigger button.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Inline styles applied to the menu surface.
   */
  style?: CSSProperties;
}

const styles = {
  menu: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    maxH: '80',
    overflowY: 'auto',
    p: '1',
  }),
} as const;

const defaultButton = {label: 'Menu'} satisfies DropdownMenuButtonProps;

/**
 * Button-triggered menu for grouped actions.
 */
export function DropdownMenu({
  button = defaultButton,
  children,
  className,
  'data-testid': dataTestId,
  hasAutoFocus = true,
  hasChevron = true,
  isMenuOpen,
  items,
  menuWidth,
  onClick,
  onOpenChange,
  ref,
  style,
}: DropdownMenuProps): React.JSX.Element {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = isMenuOpen !== undefined;
  const isOpen = isControlled ? isMenuOpen : internalOpen;
  const menuSize: ButtonSize = button.size ?? 'md';
  const menuRef = useRef<HTMLDivElement>(null);

  if (process.env.NODE_ENV !== 'production') {
    if (items != null && isReactNode(children)) {
      throw new Error(
        'DropdownMenu: pass either `items` or `children`, not both.',
      );
    }
    if (items == null && !isReactNode(children)) {
      throw new Error('DropdownMenu: provide either `items` or `children`.');
    }
  }

  const hide = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalOpen(false);
    }
  }, [isControlled, onOpenChange]);

  const handleMenuKeyDown = useMenuKeyboard(menuRef, hide);

  const contextValue = useMemo(
    () => ({
      closeMenu: hide,
      menuSize,
    }),
    [hide, menuSize],
  );

  const menuNode = useMemo(
    (): ReactNode => (items == null ? children : renderMenuItems(items)),
    [items, children],
  );

  return (
    <Popover
      content={
        <DropdownMenuContext value={contextValue}>
          {/* eslint-disable-next-line jsx-a11y-x/no-static-element-interactions -- keyboard handler captures events for the parent role="menu" element */}
          <div
            className={cx(styles.menu, className)}
            onKeyDown={handleMenuKeyDown}
            ref={menuRef}
            tabIndex={-1}>
            {menuNode}
          </div>
        </DropdownMenuContext>
      }
      hasAutoFocus={hasAutoFocus}
      hasCloseButton={false}
      isOpen={isOpen}
      onOpenChange={(isNextOpen: boolean): void => {
        if (isControlled) {
          onOpenChange?.(isNextOpen);
        } else {
          setInternalOpen(isNextOpen);
        }
      }}
      role="menu"
      style={{width: formatMenuWidth(menuWidth), ...style}}>
      <Button
        {...button}
        data-testid={dataTestId}
        endContent={
          <>
            {button.endContent}
            {hasChevron ? <Icon icon={ChevronDown} size="sm" /> : null}
          </>
        }
        onClick={onClick}
        ref={ref}
      />
    </Popover>
  );
}

DropdownMenu.displayName = 'DropdownMenu';
