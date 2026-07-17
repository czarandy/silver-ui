'use client';

import type {
  AriaAttributes,
  CSSProperties,
  ReactNode,
  Ref,
  ThHTMLAttributes,
} from 'react';
import {tableRecipe} from 'components/Table/Table.recipe';
import {useTableContext} from 'components/Table/TableContext';
import {cx} from 'utils/cx';

export interface TableHeaderCellProps {
  /**
   * Indicates whether and how the column is sorted.
   */
  'aria-sort'?: AriaAttributes['aria-sort'];
  /**
   * Header cell content.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the th.
   */
  className?: string;
  /**
   * Column key used by table plugins.
   */
  'data-column-key'?: string;
  /**
   * Test ID applied to the th.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the th element.
   */
  ref?: Ref<HTMLTableCellElement>;
  /**
   * Scope of the header cell.
   * @default 'col'
   */
  scope?: ThHTMLAttributes<HTMLTableCellElement>['scope'];
  /**
   * Inline styles applied to the th.
   */
  style?: CSSProperties;
  /**
   * Native tooltip text applied to the th.
   */
  title?: string;
}

/**
 * Table header cell with density and divider styling from context.
 */
export function TableHeaderCell({
  'aria-sort': ariaSort,
  children,
  className,
  'data-column-key': dataColumnKey,
  'data-testid': dataTestId,
  ref,
  scope = 'col',
  style,
  title,
}: TableHeaderCellProps): React.JSX.Element {
  const context = useTableContext();
  const classes = tableRecipe({
    density: context?.density,
    dividers: context?.dividers,
  });
  return (
    <th
      aria-sort={ariaSort}
      className={cx(classes.headerCell, className)}
      data-column-key={dataColumnKey}
      data-part="header-cell"
      data-testid={dataTestId}
      ref={ref}
      scope={scope}
      style={style}
      title={title}>
      {children}
    </th>
  );
}

TableHeaderCell.displayName = 'TableHeaderCell';
