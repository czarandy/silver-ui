import {createContext, type ReactNode} from 'react';

export type BreadcrumbsVariant = 'default' | 'supporting';

export interface BreadcrumbsContextValue {
  separator: ReactNode;
  variant: BreadcrumbsVariant;
}

export const BreadcrumbsContext = createContext<BreadcrumbsContextValue>({
  separator: '/',
  variant: 'default',
});

BreadcrumbsContext.displayName = 'BreadcrumbsContext';
