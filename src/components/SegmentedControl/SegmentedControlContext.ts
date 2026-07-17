'use client';

import {createContext, use} from 'react';

export type SegmentedControlLayout = 'fill' | 'hug';
export type SegmentedControlSize = 'lg' | 'md' | 'sm';

export interface SegmentedControlContextValue {
  isDisabled: boolean;
  layout: SegmentedControlLayout;
  onChange: (value: string) => void;
  size: SegmentedControlSize;
  tabStopValue: string | undefined;
  value: string | undefined;
}

export const SegmentedControlContext =
  createContext<SegmentedControlContextValue | null>(null);

SegmentedControlContext.displayName = 'SegmentedControlContext';

export function useSegmentedControlContext(): SegmentedControlContextValue {
  const context = use(SegmentedControlContext);
  if (context == null) {
    throw new Error(
      'SegmentedControlItem must be used within a SegmentedControl.',
    );
  }
  return context;
}
