import {createContext, use} from 'react';

export interface InputGroupContextValue {
  isDisabled: boolean;
  isInGroup: true;
  label: string;
}

export const InputGroupContext = createContext<InputGroupContextValue | null>(
  null,
);

InputGroupContext.displayName = 'InputGroupContext';

export function useInputGroup(): InputGroupContextValue | null {
  return use(InputGroupContext);
}
