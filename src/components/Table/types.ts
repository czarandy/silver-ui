import type {
  HTMLAttributes,
  ReactNode,
  Ref,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from 'react';
import type {TableFilterFieldRef} from './plugins/filtering/useTableFiltering';

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
  htmlProps: HTMLAttributes<HTMLTableRowElement>;
}

export interface HeaderCellRenderProps {
  after?: ReactNode;
  before?: ReactNode;
  below?: ReactNode;
  className?: string;
  content?: ReactNode;
  htmlProps: ThHTMLAttributes<HTMLTableCellElement>;
  overlay?: ReactNode;
}

export interface BodyRowRenderProps {
  children: ReactNode;
  className?: string;
  htmlProps: HTMLAttributes<HTMLTableRowElement>;
  ref?: Ref<HTMLTableRowElement>;
}

export interface BodyCellRenderProps {
  className?: string;
  htmlProps: TdHTMLAttributes<HTMLTableCellElement>;
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

export interface TableRowComponentProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLTableRowElement>;
}

export interface TableCellComponentProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
}

export interface TableHeaderCellComponentProps extends ThHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
  className?: string;
}

export type TableDensity = 'balanced' | 'compact' | 'spacious';
export type TableDividers = 'columns' | 'grid' | 'none' | 'rows';
export type TableTextOverflow = 'truncate' | 'wrap';

export interface TableContextValue {
  density: TableDensity;
  dividers: TableDividers;
  hasHover: boolean;
  isStriped: boolean;
  textOverflow: TableTextOverflow;
  verticalAlign: TableVerticalAlign;
}
