import {createContext} from 'react';
import type {InputStatus} from '../Field';

export type RadioGroupSize = 'sm' | 'md';

export interface RadioGroupContextValue {
  isDisabled: boolean;
  isRequired?: boolean;
  name: string;
  onChange: (value: string) => void;
  size: RadioGroupSize;
  status?: InputStatus;
  value: string;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null,
);

RadioGroupContext.displayName = 'RadioGroupContext';
