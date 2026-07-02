'use client';

import {createContext, use} from 'react';

export type LayoutArea = 'header' | 'content' | 'start' | 'end' | 'footer';

export interface LayoutDividerContextValue {
  hasDividers: boolean;
}

export const LayoutAreaContext = createContext<LayoutArea>('content');
LayoutAreaContext.displayName = 'LayoutAreaContext';
export const LayoutDividerContext =
  createContext<LayoutDividerContextValue | null>(null);
LayoutDividerContext.displayName = 'LayoutDividerContext';

export function useLayoutArea(): LayoutArea {
  return use(LayoutAreaContext);
}

export function useLayoutDivider(): LayoutDividerContextValue | null {
  return use(LayoutDividerContext);
}
