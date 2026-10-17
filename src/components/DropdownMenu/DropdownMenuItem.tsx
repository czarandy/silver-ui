'use client';

import {Check} from 'lucide-react';
import type {AriaAttributes, CSSProperties, ReactNode, Ref} from 'react';
import {useDropdownMenuContext} from 'components/DropdownMenu/DropdownMenuContext';
import {dropdownMenuItemRecipe} from 'components/DropdownMenu/DropdownMenuItem.recipe';
import {Icon, type IconComponent} from 'components/Icon';
import {Item} from 'components/Item';
import {Tooltip} from 'components/Tooltip';
import isNonEmptyReactNode from 'internal/isNonEmptyReactNode';
import {cx} from 'utils/cx';

/**
 * How a checkable item behaves. `'checkbox'` items toggle independently;
 * `'radio'` items pick one option from their group.
 */
export type DropdownMenuItemSelectionMode = 'checkbox' | 'radio';

const ROLES = {
  checkbox: 'menuitemcheckbox',
  radio: 'menuitemradio',
} as const satisfies Record<DropdownMenuItemSelectionMode, string>;

/**
 * Matches every enabled item a menu's arrow keys and typeahead can land on.
 * A single compound selector rather than a selector list: jsdom returns a
 * scoped list's matches grouped per selector instead of in document order.
 */
export const MENU_ITEM_SELECTOR = `:is(${['menuitem', ...Object.values(ROLES)]
  .map(role => `[role="${role}"]`)
  .join(', ')}):not(:disabled):not([aria-disabled="true"])`;

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
   * Whether activating the item closes the menu. Set to `false` for items
   * users flip repeatedly, such as toggles, so the menu stays open with focus
   * on the item.
   * @default true, or false when `selectionMode` is `'checkbox'`
   */
  hasCloseOnSelect?: boolean;
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
   * Whether a checkable item is checked. Only applies with `selectionMode`.
   * @default false
   */
  isSelected?: boolean;
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
   * Makes the item checkable. It renders as `menuitemcheckbox` or
   * `menuitemradio` with `aria-checked`, and shows a leading check (checkbox)
   * or dot (radio) when `isSelected`. Bound each radio set with dividers or a
   * section so assistive tech knows which options belong together.
   */
  selectionMode?: DropdownMenuItemSelectionMode;
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
  hasCloseOnSelect,
  icon,
  isDisabled = false,
  isSelected = false,
  label,
  onClick,
  ref,
  selectionMode,
  style,
  tooltip,
}: DropdownMenuItemProps): React.JSX.Element {
  const context = useDropdownMenuContext();
  const menuSize = context?.menuSize ?? 'md';
  const classes = dropdownMenuItemRecipe({size: menuSize});
  const hasTooltip = isNonEmptyReactNode(tooltip);
  const useAriaDisabled = hasTooltip && isDisabled;
  // Checkbox items stay open so several can be flipped in one visit; a radio
  // choice, like an action, is done once picked.
  const shouldCloseOnSelect = hasCloseOnSelect ?? selectionMode !== 'checkbox';
  const isCheckable = selectionMode != null;

  const indicator = isCheckable ? (
    <span aria-hidden={true} className={classes.indicator}>
      {isSelected ? (
        selectionMode === 'checkbox' ? (
          <Icon color="accent" icon={Check} size="sm" />
        ) : (
          <span className={classes.radioDot} />
        )
      ) : null}
    </span>
  ) : null;
  const iconNode =
    icon != null ? (
      <span className={classes.icon}>
        <Icon color="secondary" icon={icon} size="sm" />
      </span>
    ) : null;

  const item = (
    <button
      aria-checked={isCheckable ? isSelected : undefined}
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
        if (shouldCloseOnSelect) {
          context?.closeMenu();
        }
      }}
      ref={ref}
      role={selectionMode == null ? 'menuitem' : ROLES[selectionMode]}
      style={style}
      type="button">
      <Item
        as="span"
        description={description}
        endContent={endContent}
        label={label}
        startContent={
          indicator != null && iconNode != null ? (
            <span className={classes.start}>
              {indicator}
              {iconNode}
            </span>
          ) : (
            (indicator ?? iconNode)
          )
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
