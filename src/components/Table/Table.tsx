import {
  memo,
  useMemo,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {EmptyState} from 'components/EmptyState';
import {tableRecipe} from 'components/Table/Table.recipe';
import {TableBody} from 'components/Table/TableBody';
import {TableCell} from 'components/Table/TableCell';
import {TableContext} from 'components/Table/TableContext';
import {TableHeader} from 'components/Table/TableHeader';
import {TableHeaderCell} from 'components/Table/TableHeaderCell';
import {TableRow} from 'components/Table/TableRow';
import {
  defaultCellRenderer,
  generateColumns,
  resolveColumnWidths,
} from 'components/Table/columnUtils';
import {useBaseTablePlugins} from 'components/Table/useBaseTablePlugins';
import {Text} from 'components/Text';
import {cx} from 'internal/cx';
import isReactNode from '../../internal/isReactNode';
import useShallowEqualMemo from '../../internal/useShallowEqualMemo';
import type {
  BodyCellRenderProps,
  BodyRowRenderProps,
  HeaderCellRenderProps,
  HeaderRowRenderProps,
  TableCellComponentProps,
  TableColumn,
  TableContextValue,
  TableDensity,
  TableDividers,
  TableHeaderCellComponentProps,
  TablePlugin,
  TableRenderProps,
  TableRowComponentProps,
  TableTextOverflow,
  TableVerticalAlign,
} from './types';

export interface TableProps<T extends Record<string, unknown>> {
  /**
   * Table primitives rendered instead of data-driven content. When provided,
   * `columns`/`data` are ignored and the children are rendered as-is.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the table element.
   */
  className?: string;
  /**
   * Column definitions. When omitted, columns are inferred from `data`.
   */
  columns?: TableColumn<T>[];
  /**
   * Row data rendered into the table body.
   */
  data?: T[];
  /**
   * Test ID applied to the table element.
   */
  'data-testid'?: string;
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
   * Content shown when `data` is an empty array. Omit for the default empty
   * state; pass `null` to render nothing.
   */
  emptyState?: ReactNode;
  /**
   * Whether rows highlight on hover.
   * @default false
   */
  hasHover?: boolean;
  /**
   * Stable row identity, used as the React key for each body row.
   */
  idKey?: (keyof T & string) | ((item: T) => number | string);
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
   * Ref forwarded to the table element.
   */
  ref?: Ref<HTMLTableElement>;
  /**
   * Inline styles applied to the table element.
   */
  style?: CSSProperties;
  /**
   * Extra HTML attributes spread onto the table element.
   */
  tableProps?: HTMLAttributes<HTMLTableElement>;
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
      if (process.env.NODE_ENV !== 'production') {
        throw error;
      }
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

/**
 * Data table with configurable density, dividers, hover, and striping. Applies
 * column definitions, plugins, and data mapping, and shares visual state with
 * its row/cell primitives through `TableContext`.
 */
function TableInner<T extends Record<string, unknown>>({
  children,
  className,
  columns: columnsProp,
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
  const plugins = useBaseTablePlugins(userPlugins);
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

  const classes = tableRecipe({isAutoLayout: isReactNode(children)});
  const RowComponent = TableRow as React.ComponentType<TableRowComponentProps>;
  const CellComponent =
    TableCell as React.ComponentType<TableCellComponentProps>;
  const HeaderCellComponent =
    TableHeaderCell as React.ComponentType<TableHeaderCellComponentProps>;

  const baseColumns =
    columnsProp ?? (data == null ? [] : generateColumns(data));
  const transformedColumns = applyPlugins(
    plugins,
    plugin => plugin.transformColumns,
    baseColumns,
  );
  // Keep `columns` referentially stable while its contents are unchanged so the
  // memoized data rows (which compare `columns` by identity) skip re-rendering
  // when an upstream value rebuilds the array each render.
  const columns = useShallowEqualMemo(transformedColumns);
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
    const renderedContent =
      typeof resolvedContent === 'string' ||
      typeof resolvedContent === 'number' ? (
        <Text
          color="secondary"
          maxLines={1}
          size="md"
          type="body"
          weight="semibold">
          {resolvedContent}
        </Text>
      ) : (
        resolvedContent
      );
    const hasSlots =
      isReactNode(headerCellProps.before) ||
      isReactNode(headerCellProps.after) ||
      isReactNode(headerCellProps.overlay) ||
      isReactNode(headerCellProps.below);

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
            {!isReactNode(headerCellProps.after) ? (
              renderedContent
            ) : (
              <div
                className={classes.headerLabelRow}
                data-part="header-label-row">
                {renderedContent}
                {headerCellProps.after}
              </div>
            )}
            {headerCellProps.overlay}
            {headerCellProps.below}
          </>
        ) : (
          renderedContent
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
    <div className={classes.wrapper} data-part="wrapper">
      <table
        {...tableRenderProps.htmlProps}
        className={cx(
          classes.table,
          tableRenderProps.htmlProps.className,
          tableRenderProps.className,
          className,
        )}
        data-part="table"
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
                  (emptyState === undefined || isReactNode(emptyState)) && (
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
    </div>
  );

  for (let index = plugins.length - 1; index >= 0; index--) {
    const plugin = plugins[index];
    if (plugin.transformTableContext != null) {
      try {
        tableElement = plugin.transformTableContext(tableElement);
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          throw error;
        }
        console.error('[Table] Plugin threw in transformTableContext:', error);
      }
    }
  }

  return <TableContext value={contextValue}>{tableElement}</TableContext>;
}

export const Table = TableInner as <T extends Record<string, unknown>>(
  props: TableProps<T> & {ref?: Ref<HTMLTableElement>},
) => ReactElement;

(Table as {displayName?: string}).displayName = 'Table';
