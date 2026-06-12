import type {CSSProperties, ReactNode, Ref} from 'react';
import {useTableContext} from 'components/Table/TableContext';
import {cx} from 'internal/cx';
import {tableRecipe} from './Table.recipe';

export interface TableCellProps {
  /**
   * Cell content.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the td.
   */
  className?: string;
  /**
   * Number of columns the cell spans.
   */
  colSpan?: number;
  /**
   * Test ID applied to the td.
   */
  'data-testid'?: string;
  /**
   * Space-separated list of header cell IDs this cell relates to.
   */
  headers?: string;
  /**
   * Ref forwarded to the td element.
   */
  ref?: Ref<HTMLTableCellElement>;
  /**
   * Number of rows the cell spans.
   */
  rowSpan?: number;
  /**
   * Scope of the cell when used as a header-like td.
   */
  scope?: 'col' | 'colgroup' | 'row' | 'rowgroup';
  /**
   * Inline styles applied to the td.
   */
  style?: CSSProperties;
}

/**
 * Table data cell with density, alignment, and divider styling from context.
 */
export function TableCell({
  children,
  className,
  colSpan,
  'data-testid': dataTestId,
  headers,
  ref,
  rowSpan,
  style,
}: TableCellProps): React.JSX.Element {
  const context = useTableContext();
  const classes = tableRecipe({
    density: context?.density,
    dividers: context?.dividers,
    textOverflow: context?.textOverflow,
    verticalAlign: context?.verticalAlign,
  });
  return (
    <td
      className={cx(classes.cell, className)}
      colSpan={colSpan}
      data-part="cell"
      data-testid={dataTestId}
      headers={headers}
      ref={ref}
      rowSpan={rowSpan}
      style={style}>
      {children}
    </td>
  );
}

TableCell.displayName = 'TableCell';
