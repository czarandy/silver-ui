import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useTableContext} from './TableContext';

export interface TableCellProps {
  children?: ReactNode;
  className?: string;
  colSpan?: number;
  'data-testid'?: string;
  headers?: string;
  ref?: Ref<HTMLTableCellElement>;
  rowSpan?: number;
  scope?: 'col' | 'colgroup' | 'row' | 'rowgroup';
  style?: CSSProperties;
}

const styles = {
  base: css({
    boxSizing: 'border-box',
  }),
  density: {
    balanced: css({fontSize: 'sm', px: '3', py: '2'}),
    compact: css({fontSize: 'sm', px: '2', py: '1'}),
    spacious: css({fontSize: 'sm', px: '4', py: '3'}),
  },
  dividerColumns: css({
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    _last: {
      borderInlineEndWidth: 0,
    },
  }),
  dividerRows: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'border',
  }),
  truncate: css({
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  verticalAlign: {
    bottom: css({verticalAlign: 'bottom'}),
    middle: css({verticalAlign: 'middle'}),
    top: css({verticalAlign: 'top'}),
  },
  wrap: css({
    overflowWrap: 'anywhere',
    whiteSpace: 'normal',
  }),
} as const;

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
  return (
    <td
      className={cx(
        'silver-table-cell',
        styles.base,
        context == null ? undefined : styles.density[context.density],
        context == null
          ? undefined
          : styles.verticalAlign[context.verticalAlign],
        context?.textOverflow === 'truncate' ? styles.truncate : styles.wrap,
        context?.dividers === 'rows' || context?.dividers === 'grid'
          ? styles.dividerRows
          : undefined,
        context?.dividers === 'columns' || context?.dividers === 'grid'
          ? styles.dividerColumns
          : undefined,
        className,
      )}
      colSpan={colSpan}
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
