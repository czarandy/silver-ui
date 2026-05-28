import {createContext, use} from 'react';
import type {ButtonSize} from '../Button/Button';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

export interface ButtonGroupContextValue {
  isDisabled: boolean;
  orientation: ButtonGroupOrientation;
  size: ButtonSize;
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(
  null,
);
ButtonGroupContext.displayName = 'ButtonGroupContext';

export function useButtonGroup(): ButtonGroupContextValue | null {
  return use(ButtonGroupContext);
}
