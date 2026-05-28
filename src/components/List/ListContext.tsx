import {createContext} from 'react';

export type ListDensity = 'compact' | 'balanced' | 'spacious';
export type ListStyle = 'none' | 'disc' | 'decimal' | 'circle';

export interface ListContextValue {
  density: ListDensity;
  hasDividers: boolean;
  listStyle: ListStyle;
}

export const ListContext = createContext<ListContextValue | null>(null);
ListContext.displayName = 'ListContext';
