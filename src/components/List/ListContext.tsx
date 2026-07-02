'use client';

import {createContext} from 'react';

export type ListStyle = 'none' | 'disc' | 'decimal' | 'circle';

export interface ListContextValue {
  hasDividers: boolean;
  listStyle: ListStyle;
}

export const ListContext = createContext<ListContextValue | null>(null);
ListContext.displayName = 'ListContext';
