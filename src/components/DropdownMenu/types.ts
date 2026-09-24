import type {ReactNode} from 'react';
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
   * @default true
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
   * Item label.
   */
  label: string;
  /**
   * Called when the item is selected.
   */
  onClick?: () => void;
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
