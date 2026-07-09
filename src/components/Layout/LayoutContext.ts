'use client';

import {createContext, use} from 'react';

export type LayoutArea = 'header' | 'content' | 'start' | 'end' | 'footer';

export interface LayoutRegionsContextValue {
  hasDividers: boolean;
  hasFooter: boolean;
  hasHeader: boolean;
}

export const LayoutAreaContext = createContext<LayoutArea>('content');
LayoutAreaContext.displayName = 'LayoutAreaContext';
export const LayoutRegionsContext =
  createContext<LayoutRegionsContextValue | null>(null);
LayoutRegionsContext.displayName = 'LayoutRegionsContext';

export function useLayoutArea(): LayoutArea {
  return use(LayoutAreaContext);
}

export function useLayoutRegions(): LayoutRegionsContextValue | null {
  return use(LayoutRegionsContext);
}
