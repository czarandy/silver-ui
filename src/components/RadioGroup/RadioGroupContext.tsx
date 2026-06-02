import {createContext} from 'react';

export type RadioGroupOrientation = 'horizontal' | 'vertical';
export type RadioGroupSize = 'sm' | 'md';

export interface RadioGroupContextValue {
  isDisabled: boolean;
  isRequired?: boolean;
  name: string;
  onChange: (value: string) => void;
  orientation: RadioGroupOrientation;
  size: RadioGroupSize;
  value: string;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null,
);

RadioGroupContext.displayName = 'RadioGroupContext';
