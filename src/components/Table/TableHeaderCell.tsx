import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useTableContext} from './TableContext';

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

const styles = {
  base: css({
    color: 'fg.muted',
    fontWeight: 'semibold',
    maxWidth: 0,
    overflow: 'hidden',
    textAlign: 'start',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  }),
  density: {
    balanced: css({fontSize: 'md', px: '3', py: '2'}),
    compact: css({fontSize: 'md', px: '2', py: '1'}),
    spacious: css({fontSize: 'md', px: '4', py: '3'}),
  },
  dividerBottom: css({
    borderBottomWidth: 'default',
    borderBottomStyle: 'solid',
    borderBottomColor: 'border',
  }),
  dividerColumns: css({
    borderInlineEndWidth: 'default',
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: 'border',
    _last: {
      borderInlineEndWidth: 0,
    },
  }),
} as const;

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
