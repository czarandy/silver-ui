'use client';

import type {AriaAttributes, CSSProperties, ReactNode, Ref} from 'react';
import {useDropdownMenuContext} from 'components/DropdownMenu/DropdownMenuContext';
import {dropdownMenuItemRecipe} from 'components/DropdownMenu/DropdownMenuItem.recipe';
import {Icon, type IconComponent} from 'components/Icon';
import {Item} from 'components/Item';
import {Tooltip} from 'components/Tooltip';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

export interface DropdownMenuItemProps {
  /**
   * Keyboard shortcuts that activate the menu item.
   */
  'aria-keyshortcuts'?: AriaAttributes['aria-keyshortcuts'];
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
  /**
   * Tooltip content shown when the item is hovered or focused.
   */
  tooltip?: ReactNode;
}

/**
 * Action item inside a `DropdownMenu`.
 */
export function DropdownMenuItem({
  'aria-keyshortcuts': ariaKeyshortcuts,
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
  tooltip,
}: DropdownMenuItemProps): React.JSX.Element {
  const context = useDropdownMenuContext();
  const menuSize = context?.menuSize ?? 'md';
  const classes = dropdownMenuItemRecipe({size: menuSize});
  const hasTooltip = isNonEmptyReactNode(tooltip);
  const useAriaDisabled = hasTooltip && isDisabled;

  const item = (
    <button
      aria-disabled={useAriaDisabled || undefined}
      aria-keyshortcuts={ariaKeyshortcuts}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      disabled={isDisabled && !useAriaDisabled}
      onClick={event => {
        if (isDisabled) {
          event.preventDefault();
          return;
        }
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

  if (hasTooltip) {
    return <Tooltip content={tooltip}>{item}</Tooltip>;
  }

  return item;
}

DropdownMenuItem.displayName = 'DropdownMenuItem';
