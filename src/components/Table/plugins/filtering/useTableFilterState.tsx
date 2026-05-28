import {useCallback, useState} from 'react';
import type {TableFilterState, TableFilterValue} from './useTableFiltering';

export interface UseTableFilterStateResult {
  clearAll: () => void;
  filters: TableFilterState;
  onFilterChange: (key: string, value: TableFilterValue | null) => void;
}

export function useTableFilterState(
  initialState?: TableFilterState,
): UseTableFilterStateResult {
  const [filters, setFilters] = useState<TableFilterState>(initialState ?? {});
  const onFilterChange = useCallback(
    (key: string, value: TableFilterValue | null) => {
      setFilters(previous => {
        if (value == null) {
          const {[key]: _removed, ...next} = previous;
          return next;
        }
        return {...previous, [key]: value};
      });
    },
    [],
  );
  const clearAll = useCallback(() => setFilters({}), []);

  return {clearAll, filters, onFilterChange};
}
