import {useCallback, useMemo, useState} from 'react';
import type {TableSortState, UseTableSortableConfig} from './useTableSortable';

export type TableSortComparator<T> = (a: T, b: T) => number;

export interface UseTableSortableStateConfig<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
> {
  allowUnsortedState?: boolean;
  comparators?: Partial<Record<TSortKey, TableSortComparator<T>>>;
  data: T[];
  defaultSort?: TableSortState<TSortKey>;
  isMultiSortEnabled?: boolean;
  onSortChange?: (sort: TableSortState<TSortKey>) => void;
  sort?: TableSortState<TSortKey>;
}

export interface UseTableSortableStateResult<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
> {
  applySort: (data: T[]) => T[];
  sort: TableSortState<TSortKey>;
  sortConfig: UseTableSortableConfig<TSortKey>;
  sortedData: T[];
}

function stringifySortable(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (
    typeof value === 'bigint' ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return String(value);
  }
  return '';
}

function defaultCompare<T extends Record<string, unknown>>(
  a: T,
  b: T,
  sortKey: string,
): number {
  const left = a[sortKey];
  const right = b[sortKey];
  if (left == null && right == null) {
    return 0;
  }
  if (left == null) {
    return 1;
  }
  if (right == null) {
    return -1;
  }
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return stringifySortable(left).localeCompare(
    stringifySortable(right),
    undefined,
    {
      numeric: true,
    },
  );
}

export function useTableSortableState<
  T extends Record<string, unknown>,
  TSortKey extends string = string,
>({
  allowUnsortedState,
  comparators,
  data,
  defaultSort = [],
  isMultiSortEnabled,
  onSortChange: controlledOnSortChange,
  sort: controlledSort,
}: UseTableSortableStateConfig<T, TSortKey>): UseTableSortableStateResult<
  T,
  TSortKey
> {
  const [uncontrolledSort, setUncontrolledSort] =
    useState<TableSortState<TSortKey>>(defaultSort);
  const sort = controlledSort ?? uncontrolledSort;
  const onSortChange = useCallback(
    (nextSort: TableSortState<TSortKey>) => {
      if (controlledSort == null) {
        setUncontrolledSort(nextSort);
      }
      controlledOnSortChange?.(nextSort);
    },
    [controlledOnSortChange, controlledSort],
  );

  const applySort = useCallback(
    (items: T[]): T[] => {
      if (sort.length === 0) {
        return items;
      }
      return [...items].sort((a, b) => {
        for (const entry of sort) {
          const customCompare = comparators?.[entry.sortKey];
          const result =
            customCompare == null
              ? defaultCompare(a, b, entry.sortKey)
              : customCompare(a, b);
          if (result !== 0) {
            return entry.direction === 'ascending' ? result : -result;
          }
        }
        return 0;
      });
    },
    [comparators, sort],
  );
  const sortedData = useMemo(() => applySort(data), [applySort, data]);
  const sortConfig = useMemo(
    (): UseTableSortableConfig<TSortKey> => ({
      allowUnsortedState,
      isMultiSortEnabled,
      onSortChange,
      sort,
    }),
    [allowUnsortedState, isMultiSortEnabled, onSortChange, sort],
  );

  return {applySort, sort, sortConfig, sortedData};
}
