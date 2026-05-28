import {createContext} from 'react';

export interface AccordionContextValue {
  isOpen: (value: string) => boolean;
  toggle: (value: string) => void;
}

export const AccordionContext = createContext<AccordionContextValue | null>(
  null,
);
AccordionContext.displayName = 'AccordionContext';
