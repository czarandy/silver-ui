'use client';

import {createContext, use} from 'react';

export interface FieldsetContextValue {
  isDisabled: boolean;
}

export const FieldsetContext = createContext<FieldsetContextValue | null>(null);

FieldsetContext.displayName = 'FieldsetContext';

export function useFieldset(): FieldsetContextValue | null {
  return use(FieldsetContext);
}
