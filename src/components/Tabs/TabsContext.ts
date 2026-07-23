'use client';

import {createContext, use} from 'react';
import type {ComponentSize} from 'internal/SizeContext';

export type TabsSize = ComponentSize;
export type TabsLayout = 'fill' | 'hug';

export interface TabsContextValue {
  layout: TabsLayout;
  onChange: (value: string) => void;
  size: TabsSize;
  value: string;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

TabsContext.displayName = 'TabsContext';

export function useTabsContext(): TabsContextValue {
  const context = use(TabsContext);
  if (context == null) {
    throw new Error('Tabs children must be used within a Tabs.');
  }
  return context;
}
