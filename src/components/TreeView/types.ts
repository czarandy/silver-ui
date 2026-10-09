import type {CSSProperties, MouseEvent, ReactNode} from 'react';

export type TreeViewDensity = 'balanced' | 'compact' | 'spacious';

export interface TreeViewItemData {
  /**
   * Plain-text label used for keyboard type-ahead and generated control labels
   * when `label` is not a string.
   */
  ariaLabel?: string;
  /**
   * Nested child items. Items with children can be expanded or collapsed.
   */
  children?: TreeViewItemData[];
  /**
   * Class name applied to this item's row. It does not apply to the item's
   * nested child rows.
   */
  className?: string;
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
   * Inline styles applied to this item's row. It does not apply to the item's
   * nested child rows. Row indentation is preserved, so `marginLeft` is
   * ignored.
   */
  style?: CSSProperties;
  /**
   * Link target. Only used with `href`.
   */
  target?: string;
}
