import {createContext, use} from 'react';
import type {InputSize, InputStatusType} from '../Field';

export interface InputGroupContextValue {
  isDisabled: boolean;
  isInGroup: true;
  label: string;
  size: InputSize;
  statusType?: InputStatusType;
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(
  null,
);

InputGroupContext.displayName = 'InputGroupContext';

export function useInputGroup(): InputGroupContextValue | null {
  return use(InputGroupContext);
}
