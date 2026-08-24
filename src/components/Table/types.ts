import type {HTMLAttributes, ReactNode, Ref} from 'react';
import type {TableCellProps} from 'components/Table/TableCell';
import type {TableHeaderCellProps} from 'components/Table/TableHeaderCell';
import type {TableRowProps} from 'components/Table/TableRow';
import type {TableFilterFieldRef} from 'components/Table/plugins/filtering/useTableFiltering';

export interface ProportionalWidth {
  minWidth?: number;
  type: 'proportional';
  value: number;
}

export interface PixelWidth {
  type: 'pixel';
  value: number;
}

export type ColumnWidth = PixelWidth | ProportionalWidth;

export interface TableSortableColumnConfig {
  sortKey?: string;
}

export type TableColumnAlign = 'start' | 'center' | 'end';
export type TableVerticalAlign = 'middle' | 'top' | 'bottom';

export interface TableColumn<T extends Record<string, unknown>> {
  align?: TableColumnAlign;
  filter?: string | TableFilterFieldRef;
  header?: ReactNode;
  key: string;
  renderCell?: (item: T) => ReactNode;
  resizable?: boolean;
  sortable?: boolean | TableSortableColumnConfig;
  width?: ColumnWidth;
}

export type TableStyle = string | undefined;

export interface TableRenderProps {
  className?: string;
  htmlProps: HTMLAttributes<HTMLTableElement>;
}

export interface HeaderRowRenderProps {
  children: ReactNode;
  className?: string;
  htmlProps: Omit<TableRowProps, 'children' | 'ref'>;
}

export interface HeaderCellRenderProps {
  after?: ReactNode;
  before?: ReactNode;
  below?: ReactNode;
  className?: string;
  content?: ReactNode;
  htmlProps: Omit<TableHeaderCellProps, 'children' | 'ref' | 'title'>;
  overlay?: ReactNode;
}

export interface BodyRowRenderProps {
  children: ReactNode;
  className?: string;
  htmlProps: Omit<TableRowProps, 'children' | 'ref'>;
  ref?: Ref<HTMLTableRowElement>;
}

export interface BodyCellRenderProps {
  className?: string;
  htmlProps: Omit<TableCellProps, 'children' | 'ref'>;
}

export interface TablePlugin<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  transformBodyCell?: (
    props: BodyCellRenderProps,
    column: TableColumn<T>,
    item: T,
  ) => BodyCellRenderProps;
  transformBodyRow?: (
    props: BodyRowRenderProps,
    item: T,
    index: number,
  ) => BodyRowRenderProps;
  transformColumns?: (columns: TableColumn<T>[]) => TableColumn<T>[];
  transformHeaderCell?: (
    props: HeaderCellRenderProps,
    column: TableColumn<T>,
  ) => HeaderCellRenderProps;
  transformHeaderRow?: (props: HeaderRowRenderProps) => HeaderRowRenderProps;
  transformTable?: (props: TableRenderProps) => TableRenderProps;
  transformTableContext?: (children: ReactNode) => ReactNode;
}

export type TableRowComponentProps = TableRowProps;

export type TableCellComponentProps = TableCellProps;

export type TableHeaderCellComponentProps = TableHeaderCellProps;

export type TableDensity = 'balanced' | 'compact' | 'spacious';
export type TableDividers = 'columns' | 'grid' | 'none' | 'rows';
export type TableSection = 'body' | 'footer' | 'header';
export type TableTextOverflow = 'truncate' | 'wrap';

export interface TableContextValue {
  density: TableDensity;
  dividers: TableDividers;
  hasHover: boolean;
  isStriped: boolean;
  textOverflow: TableTextOverflow;
  verticalAlign: TableVerticalAlign;
}
