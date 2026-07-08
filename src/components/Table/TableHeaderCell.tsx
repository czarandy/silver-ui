'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {tableRecipe} from 'components/Table/Table.recipe';
import {useTableContext} from 'components/Table/TableContext';
import {cx} from 'utils/cx';

export interface TableHeaderCellProps {
  /**
   * Header cell content.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the th.
   */
  className?: string;
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
  scope?: 'col' | 'colgroup' | 'row' | 'rowgroup';
  /**
   * Inline styles applied to the th.
   */
  style?: CSSProperties;
}

/**
 * Table header cell with density and divider styling from context.
 */
export function TableHeaderCell({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  scope = 'col',
  style,
}: TableHeaderCellProps): React.JSX.Element {
  const context = useTableContext();
  const classes = tableRecipe({
    density: context?.density,
    dividers: context?.dividers,
  });
  return (
    <th
      className={cx(classes.headerCell, className)}
      data-part="header-cell"
      data-testid={dataTestId}
      ref={ref}
      scope={scope}
      style={style}>
      {children}
    </th>
  );
}

TableHeaderCell.displayName = 'TableHeaderCell';
