import {useMemo, type ReactElement, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {BaseTable} from './BaseTable';
import {TableContext} from './TableContext';
import type {
  BaseTableProps,
  TableContextValue,
  TableDensity,
  TableDividers,
  TablePlugin,
  TableRenderProps,
  TableTextOverflow,
  TableVerticalAlign,
} from './types';
import {useBaseTablePlugins} from './useBaseTablePlugins';

export interface TableProps<T extends Record<string, unknown>> extends Omit<
  BaseTableProps<T>,
  'plugins'
> {
  /**
   * Spacing density for rows and cells.
   * @default 'balanced'
   */
  density?: TableDensity;
  /**
   * Which divider lines to show between cells.
   * @default 'rows'
   */
  dividers?: TableDividers;
  /**
   * Whether rows highlight on hover.
   * @default false
   */
  hasHover?: boolean;
  /**
   * Whether alternating rows have a subtle background.
   * @default false
   */
  isStriped?: boolean;
  /**
   * Plugin map or array that extends table behavior.
   */
  plugins?: Record<string, TablePlugin<T>> | TablePlugin<T>[];
  /**
   * How overflowing cell text is handled.
   * @default 'wrap'
   */
  textOverflow?: TableTextOverflow;
  /**
   * Vertical alignment of cell content.
   * @default 'middle'
   */
  verticalAlign?: TableVerticalAlign;
}

const styles = {
  scrollWrapper: css({
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  }),
  table: css({
    color: 'fg',
    fontFamily: 'body',
  }),
} as const;

function TableScrollWrapper({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <div className={styles.scrollWrapper}>{children}</div>;
}

function buildTableStylePlugin<
  T extends Record<string, unknown>,
>(): TablePlugin<T> {
  return {
    transformTable(props: TableRenderProps): TableRenderProps {
      return {
        ...props,
        className: cx(props.className, styles.table, 'silver-table'),
      };
    },
  };
}

/**
 * Data table with configurable density, dividers, hover, and striping.
 */
function TableInner<T extends Record<string, unknown>>({
  children,
  className,
  columns,
  data,
  'data-testid': dataTestId,
  density = 'balanced',
  dividers = 'rows',
  emptyState,
  hasHover = false,
  idKey,
  isStriped = false,
  plugins: userPlugins,
  ref,
  style,
  tableProps,
  textOverflow = 'wrap',
  verticalAlign = 'middle',
}: TableProps<T> & {ref?: Ref<HTMLTableElement>}): ReactElement {
  const tablePlugin = useMemo(() => buildTableStylePlugin<T>(), []);
  const basePlugins = useMemo(() => [tablePlugin], [tablePlugin]);
  const plugins = useBaseTablePlugins(basePlugins, userPlugins);
  const contextValue = useMemo(
    (): TableContextValue => ({
      density,
      dividers,
      hasHover,
      isStriped,
      textOverflow,
      verticalAlign,
    }),
    [density, dividers, hasHover, isStriped, textOverflow, verticalAlign],
  );

  return (
    <TableContext value={contextValue}>
      <BaseTable<T>
        className={className}
        columns={columns}
        data={data}
        data-testid={dataTestId}
        emptyState={emptyState}
        idKey={idKey}
        plugins={plugins}
        ref={ref}
        scrollWrapper={TableScrollWrapper}
        style={style}
        tableProps={tableProps}
        textOverflow={textOverflow}>
        {children}
      </BaseTable>
    </TableContext>
  );
}

export const Table = TableInner as <T extends Record<string, unknown>>(
  props: TableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;

(Table as {displayName?: string}).displayName = 'Table';
