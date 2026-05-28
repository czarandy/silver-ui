import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useTableContext} from './TableContext';

export interface TableHeaderCellProps {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLTableCellElement>;
  scope?: 'col' | 'colgroup' | 'row' | 'rowgroup';
  style?: CSSProperties;
}

const styles = {
  base: css({
    boxSizing: 'border-box',
    color: 'fg.muted',
    fontWeight: 'semibold',
    overflow: 'hidden',
    textAlign: 'start',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  density: {
    balanced: css({fontSize: 'xs', px: '3', py: '2'}),
    compact: css({fontSize: 'xs', px: '2', py: '1'}),
    spacious: css({fontSize: 'xs', px: '4', py: '3'}),
  },
  dividerBottom: css({
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'border',
  }),
  dividerColumns: css({
    borderInlineEndWidth: '1px',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    _last: {
      borderInlineEndWidth: 0,
    },
  }),
} as const;

export function TableHeaderCell({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  scope = 'col',
  style,
}: TableHeaderCellProps): React.JSX.Element {
  const context = useTableContext();
  return (
    <th
      className={cx(
        'silver-table-header-cell',
        styles.base,
        styles.dividerBottom,
        context == null ? undefined : styles.density[context.density],
        context?.dividers === 'columns' || context?.dividers === 'grid'
          ? styles.dividerColumns
          : undefined,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      scope={scope}
      style={style}>
      {children}
    </th>
  );
}

TableHeaderCell.displayName = 'TableHeaderCell';
