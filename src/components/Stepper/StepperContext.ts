import {createContext, use} from 'react';

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepperContextValue {
  activeStep: number;
  isNonLinear: boolean;
  onStepClick: ((index: number) => void) | null;
  orientation: StepperOrientation;
}

export const StepperContext = createContext<StepperContextValue | null>(null);
StepperContext.displayName = 'StepperContext';

export function useStepperContext(): StepperContextValue {
  const context = use(StepperContext);

  if (context == null) {
    throw new Error('Step must be used within a Stepper.');
  }

  return context;
}
