'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {useDropdownMenuContext} from 'components/DropdownMenu/DropdownMenuContext';
import {dropdownMenuItemRecipe} from 'components/DropdownMenu/DropdownMenuItem.recipe';
import {Icon, type IconComponent} from 'components/Icon';
import {Item} from 'components/Item';
import {cx} from 'utils/cx';

export interface DropdownMenuItemProps {
  /**
   * Additional CSS class names applied to the item.
   */
  className?: string;
  /**
   * Test ID applied to the item.
   */
  'data-testid'?: string;
  /**
   * Supporting text shown below the label.
   */
  description?: ReactNode;
  /**
   * Trailing content.
   */
  endContent?: ReactNode;
  /**
   * Icon rendered before the label.
   */
  icon?: IconComponent;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Item label.
   */
  label: string;
  /**
   * Called when the item is selected.
   */
  onClick?: () => void;
  /**
   * Ref forwarded to the item button.
   */
  ref?: Ref<HTMLButtonElement>;
  /**
   * Inline styles applied to the item.
   */
  style?: CSSProperties;
}

/**
 * Action item inside a `DropdownMenu`.
 */
export function DropdownMenuItem({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  icon,
  isDisabled = false,
  label,
  onClick,
  ref,
  style,
}: DropdownMenuItemProps): React.JSX.Element {
  const context = useDropdownMenuContext();
  const menuSize = context?.menuSize ?? 'md';
  const classes = dropdownMenuItemRecipe({size: menuSize});

  return (
    <button
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      disabled={isDisabled}
      onClick={() => {
        onClick?.();
        context?.closeMenu();
      }}
      ref={ref}
      role="menuitem"
      style={style}
      type="button">
      <Item
        as="span"
        description={description}
        endContent={endContent}
        label={label}
        startContent={
          icon != null ? (
            <span className={classes.icon}>
              <Icon color="secondary" icon={icon} size="sm" />
            </span>
          ) : null
        }
      />
    </button>
  );
}

DropdownMenuItem.displayName = 'DropdownMenuItem';
