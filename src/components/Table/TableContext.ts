import {createContext, use} from 'react';
import type {TableContextValue} from 'components/Table/types';

export const TableContext = createContext<TableContextValue | null>(null);
TableContext.displayName = 'TableContext';

export function useTableContext(): TableContextValue | null {
  return use(TableContext);
}
