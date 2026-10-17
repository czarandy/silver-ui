import type {ReactNode} from 'react';
import type {DropdownMenuItemSelectionMode} from 'components/DropdownMenu/DropdownMenuItem';
import type {IconComponent} from 'components/Icon';

export interface DropdownMenuItemData {
  /**
   * Supporting text shown below the label.
   */
  description?: ReactNode;
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
   * Makes the item checkable, rendering `menuitemcheckbox` or `menuitemradio`
   * with `aria-checked` and a leading check or dot. Bound each radio set with
   * dividers or a section so it is grouped for assistive tech.
   */
  selectionMode?: DropdownMenuItemSelectionMode;
  /**
   * Tooltip content shown when the item is hovered or focused.
   */
  tooltip?: ReactNode;
}

export interface DropdownMenuDivider {
  /**
   * Discriminant indicating a visual divider.
   */
  type: 'divider';
}

export interface DropdownMenuSection {
  /**
   * Menu items belonging to this section.
   */
  items: ReadonlyArray<DropdownMenuItemData>;
  /**
   * Optional heading displayed above the section items.
   */
  title?: string;
  /**
   * Discriminant indicating a grouped section.
   */
  type: 'section';
}

export type DropdownMenuOption =
  DropdownMenuDivider | DropdownMenuItemData | DropdownMenuSection;
