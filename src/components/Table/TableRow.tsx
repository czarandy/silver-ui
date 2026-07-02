'use client';

import type {CSSProperties, ReactNode, Ref} from 'react';
import {tableRecipe} from 'components/Table/Table.recipe';
import {useTableContext} from 'components/Table/TableContext';
import {cx} from 'internal/cx';

export interface TableRowProps {
  /**
   * Cell elements rendered inside the row.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the tr.
   */
  className?: string;
  /**
   * Test ID applied to the tr.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the tr element.
   */
  ref?: Ref<HTMLTableRowElement>;
  /**
   * Inline styles applied to the tr.
   */
  style?: CSSProperties;
}

/**
 * Table row with hover and striped styling from context.
 */
export function TableRow({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: TableRowProps): React.JSX.Element {
  const context = useTableContext();
  const classes = tableRecipe({
    isStriped: context?.isStriped,
    hasHover: context?.hasHover,
  });

  return (
    <tr
      className={cx(classes.row, className)}
      data-part="row"
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </tr>
  );
}

TableRow.displayName = 'TableRow';
