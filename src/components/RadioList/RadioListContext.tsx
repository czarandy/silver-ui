import {createContext} from 'react';
import type {InputStatus} from '../Field';

export type RadioListSize = 'sm' | 'md';

export interface RadioListContextValue {
  isDisabled: boolean;
  isRequired: boolean;
  name: string;
  onChange: (value: string) => void;
  size: RadioListSize;
  status?: InputStatus;
  value: string;
}

export const RadioListContext = createContext<RadioListContextValue | null>(
  null,
);

RadioListContext.displayName = 'RadioListContext';
