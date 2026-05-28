import type {MouseEvent, ReactNode} from 'react';

export type TreeViewDensity = 'balanced' | 'compact' | 'spacious';

export interface TreeViewItemData {
  /**
   * Nested child items. Items with children can be expanded or collapsed.
   */
  children?: TreeViewItemData[];
  /**
   * Secondary description text displayed below the label.
   */
  description?: string;
  /**
   * Content rendered after the label.
   */
  endContent?: ReactNode;
  /**
   * URL for link items.
   */
  href?: string;
  /**
   * Stable unique identifier used for React keys and expansion tracking.
   */
  id: string;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the item is initially expanded.
   * @default false
   */
  isExpanded?: boolean;
  /**
   * Whether the item is currently selected.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Primary item label.
   */
  label: ReactNode;
  /**
   * Click handler for action items.
   */
  onClick?: (event: MouseEvent) => void;
  /**
   * Content rendered before the label.
   */
  startContent?: ReactNode;
  /**
   * Link target. Only used with `href`.
   */
  target?: string;
}
