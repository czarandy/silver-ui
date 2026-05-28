import {memo, type ReactElement, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {EmptyState} from '../EmptyState';
import {Text} from '../Text';
import {TableBody} from './TableBody';
import {TableCell} from './TableCell';
import {TableHeader} from './TableHeader';
import {TableHeaderCell} from './TableHeaderCell';
import {TableRow} from './TableRow';
import {
  defaultCellRenderer,
  generateColumns,
  resolveColumnWidths,
} from './columnUtils';
import type {
  BaseTableProps,
  BodyCellRenderProps,
  BodyRowRenderProps,
  HeaderCellRenderProps,
  HeaderRowRenderProps,
  TableCellComponentProps,
  TableColumn,
  TableHeaderCellComponentProps,
  TablePlugin,
  TableRenderProps,
  TableRowComponentProps,
} from './types';

const styles = {
  headerLabelRow: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    minW: 0,
  }),
  table: css({
    w: 'full',
    borderCollapse: 'collapse',
    borderSpacing: 0,
    tableLayout: 'fixed',
  }),
  tableAutoLayout: css({
    tableLayout: 'auto',
  }),
} as const;

const EMPTY_PLUGINS: TablePlugin<Record<string, unknown>>[] = [];

function applyPlugins<TPlugin, TProps, TArgs extends unknown[]>(
  plugins: TPlugin[],
  getter: (
    plugin: TPlugin,
  ) => ((props: TProps, ...args: TArgs) => TProps) | undefined,
  initial: TProps,
  ...args: TArgs
): TProps {
  return plugins.reduce<TProps>((accumulator, plugin, index) => {
    const transform = getter(plugin);
    if (transform == null) {
      return accumulator;
    }
    try {
      return transform(accumulator, ...args);
    } catch (error) {
      console.error(`[Table] Plugin at index ${index} threw:`, error);
      return accumulator;
    }
  }, initial);
}

interface DataRowProps<T extends Record<string, unknown>> {
  CellComponent: React.ComponentType<TableCellComponentProps>;
  columns: TableColumn<T>[];
  item: T;
  plugins: TablePlugin<T>[];
  RowComponent: React.ComponentType<TableRowComponentProps>;
  rowIndex: number;
  rowKey: number | string;
  textOverflow: 'truncate' | 'wrap';
}

function DataRowInner<T extends Record<string, unknown>>({
  CellComponent,
  RowComponent,
  columns,
  item,
  plugins,
  rowIndex,
  rowKey,
  textOverflow,
}: DataRowProps<T>): ReactElement {
  const cells = columns.map(column => {
    const initialHtmlProps: BodyCellRenderProps['htmlProps'] = {};
    if (column.align) {
      initialHtmlProps.style = {textAlign: column.align};
    }

    const cellProps = applyPlugins(
      plugins,
      plugin => plugin.transformBodyCell,
      {htmlProps: initialHtmlProps} satisfies BodyCellRenderProps,
      column,
      item,
    );

    const isDefaultRenderer = column.renderCell == null;
    const rawContent = isDefaultRenderer
      ? defaultCellRenderer(item, column.key)
      : (column.renderCell?.(item) ?? null);
    const content =
      isDefaultRenderer &&
      textOverflow === 'truncate' &&
      typeof rawContent === 'string' &&
      rawContent.length > 0 ? (
        <Text maxLines={1} type="body">
          {rawContent}
        </Text>
      ) : (
        rawContent
      );

    return (
      <CellComponent
        key={column.key}
        {...cellProps.htmlProps}
        className={cx(cellProps.htmlProps.className, cellProps.className)}>
        {content}
      </CellComponent>
    );
  });

  const rowProps = applyPlugins(
    plugins,
    plugin => plugin.transformBodyRow,
    {
      children: <>{cells}</>,
      htmlProps: {},
    } satisfies BodyRowRenderProps,
    item,
    rowIndex,
  );

  return (
    <RowComponent
      key={rowKey}
      {...rowProps.htmlProps}
      className={cx(rowProps.htmlProps.className, rowProps.className)}
      ref={rowProps.ref}>
      {rowProps.children}
    </RowComponent>
  );
}

function areRowPropsEqual<T extends Record<string, unknown>>(
  previous: DataRowProps<T>,
  next: DataRowProps<T>,
): boolean {
  if (
    previous.CellComponent !== next.CellComponent ||
    previous.RowComponent !== next.RowComponent ||
    previous.columns !== next.columns ||
    previous.plugins !== next.plugins ||
    previous.rowIndex !== next.rowIndex ||
    previous.rowKey !== next.rowKey ||
    previous.textOverflow !== next.textOverflow
  ) {
    return false;
  }

  if (previous.item === next.item) {
    return true;
  }

  return Object.keys(next.item).every(
    key => previous.item[key] === next.item[key],
  );
}

const MemoizedDataRow = memo(DataRowInner, areRowPropsEqual) as <
  T extends Record<string, unknown>,
>(
  props: DataRowProps<T>,
) => ReactElement;

function BaseTableInner<T extends Record<string, unknown>>({
  children,
  className,
  columns: columnsProp,
  data,
  'data-testid': dataTestId,
  emptyState,
  idKey,
  plugins: pluginsProp,
  ref,
  scrollWrapper: ScrollWrapper,
  style,
  tableProps,
  textOverflow = 'wrap',
}: BaseTableProps<T> & {ref?: Ref<HTMLTableElement>}): ReactElement {
  const plugins = pluginsProp ?? (EMPTY_PLUGINS as TablePlugin<T>[]);
  const RowComponent = TableRow as React.ComponentType<TableRowComponentProps>;
  const CellComponent =
    TableCell as React.ComponentType<TableCellComponentProps>;
  const HeaderCellComponent =
    TableHeaderCell as React.ComponentType<TableHeaderCellComponentProps>;

  const baseColumns =
    columnsProp ?? (data == null ? [] : generateColumns(data));
  const columns = applyPlugins(
    plugins,
    plugin => plugin.transformColumns,
    baseColumns,
  );
  const widths = resolveColumnWidths(columns);

  const tableRenderProps = applyPlugins(
    plugins,
    plugin => plugin.transformTable,
    {
      htmlProps: tableProps ?? {},
    } satisfies TableRenderProps,
  );

  const headerCells = columns.map(column => {
    const headerContent = column.header ?? column.key;
    const initialHtmlProps: HeaderCellRenderProps['htmlProps'] & {
      'data-column-key'?: string;
    } = {
      'data-column-key': column.key,
    };
    if (column.align) {
      initialHtmlProps.style = {textAlign: column.align};
    }

    const headerCellProps = applyPlugins(
      plugins,
      plugin => plugin.transformHeaderCell,
      {
        content: headerContent,
        htmlProps: initialHtmlProps,
      } satisfies HeaderCellRenderProps,
      column,
    );

    const widthStyle = widths.columns.get(column.key)?.style ?? {};
    const mergedStyle = {
      ...widthStyle,
      ...headerCellProps.htmlProps.style,
    };
    const resolvedContent = headerCellProps.content ?? headerContent;
    const title =
      typeof resolvedContent === 'string' && resolvedContent.length > 0
        ? resolvedContent
        : undefined;
    const hasSlots =
      headerCellProps.before != null ||
      headerCellProps.after != null ||
      headerCellProps.overlay != null ||
      headerCellProps.below != null;

    return (
      <HeaderCellComponent
        key={column.key}
        {...headerCellProps.htmlProps}
        className={cx(
          headerCellProps.htmlProps.className,
          headerCellProps.className,
        )}
        style={mergedStyle}
        title={title}>
        {hasSlots ? (
          <>
            {headerCellProps.before}
            {headerCellProps.after == null ? (
              resolvedContent
            ) : (
              <div className={styles.headerLabelRow}>
                {resolvedContent}
                {headerCellProps.after}
              </div>
            )}
            {headerCellProps.overlay}
            {headerCellProps.below}
          </>
        ) : (
          resolvedContent
        )}
      </HeaderCellComponent>
    );
  });

  const headerRowProps = applyPlugins(
    plugins,
    plugin => plugin.transformHeaderRow,
    {
      children: <>{headerCells}</>,
      htmlProps: {},
    } satisfies HeaderRowRenderProps,
  );

  const tableStyle = {
    ...style,
    ...tableRenderProps.htmlProps.style,
    minWidth:
      widths.tableMinWidth > 0 ? `${widths.tableMinWidth}px` : undefined,
  };
  const hasData = data != null && data.length > 0;
  const hasColumns = columns.length > 0;

  let tableElement: ReactNode = (
    <table
      {...tableRenderProps.htmlProps}
      className={cx(
        'silver-base-table',
        styles.table,
        children != null ? styles.tableAutoLayout : undefined,
        tableRenderProps.htmlProps.className,
        tableRenderProps.className,
        className,
      )}
      data-testid={dataTestId}
      ref={ref}
      style={tableStyle}>
      {children ?? (
        <>
          {hasColumns ? (
            <TableHeader>
              <RowComponent
                {...headerRowProps.htmlProps}
                className={cx(
                  headerRowProps.htmlProps.className,
                  headerRowProps.className,
                )}>
                {headerRowProps.children}
              </RowComponent>
            </TableHeader>
          ) : null}
          <TableBody>
            {hasData
              ? data.map((item, rowIndex) => {
                  const rowKey =
                    idKey == null
                      ? rowIndex
                      : typeof idKey === 'function'
                        ? idKey(item)
                        : String(item[idKey]);
                  return (
                    <MemoizedDataRow
                      CellComponent={CellComponent}
                      columns={columns}
                      item={item}
                      key={rowKey}
                      plugins={plugins}
                      RowComponent={RowComponent}
                      rowIndex={rowIndex}
                      rowKey={rowKey}
                      textOverflow={textOverflow}
                    />
                  );
                })
              : data != null &&
                emptyState !== false && (
                  <tr>
                    <td colSpan={Math.max(columns.length, 1)}>
                      {emptyState ?? <EmptyState isCompact title="No data" />}
                    </td>
                  </tr>
                )}
          </TableBody>
        </>
      )}
    </table>
  );

  if (ScrollWrapper != null) {
    tableElement = <ScrollWrapper>{tableElement}</ScrollWrapper>;
  }

  for (let index = plugins.length - 1; index >= 0; index--) {
    const plugin = plugins[index];
    if (plugin.transformTableContext != null) {
      try {
        tableElement = plugin.transformTableContext(tableElement);
      } catch (error) {
        console.error('[Table] Plugin threw in transformTableContext:', error);
      }
    }
  }

  return tableElement as ReactElement;
}

export const BaseTable = BaseTableInner as <T extends Record<string, unknown>>(
  props: BaseTableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;

(BaseTable as {displayName?: string}).displayName = 'BaseTable';
