import {createContext} from 'react';
import type {CheckboxInputSize} from 'components/CheckboxInput';

export type CheckboxGroupOrientation = 'horizontal' | 'vertical';
export type CheckboxGroupSize = CheckboxInputSize;

export interface CheckboxGroupContextValue {
  htmlName?: string;
  isDisabled: boolean;
  onChange: (value: string, isChecked: boolean) => void;
  orientation: CheckboxGroupOrientation;
  selectedValues: Set<string>;
  size: CheckboxGroupSize;
}

export const CheckboxGroupContext =
  createContext<CheckboxGroupContextValue | null>(null);

CheckboxGroupContext.displayName = 'CheckboxGroupContext';
