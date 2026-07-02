'use client';

import {createContext} from 'react';

export interface AccordionContextValue {
  getIsOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

export const AccordionContext = createContext<AccordionContextValue | null>(
  null,
);
AccordionContext.displayName = 'AccordionContext';
