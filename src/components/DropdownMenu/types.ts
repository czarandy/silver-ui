import type {ReactNode} from 'react';
import type {IconComponent} from 'components/Icon';

export interface DropdownMenuItemData {
  /**
   * Supporting text shown below the label.
   */
  description?: ReactNode;
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
