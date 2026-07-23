import type {ComponentSize} from 'internal/SizeContext';

export type InputStatusType = 'warning' | 'error' | 'success';

export interface InputStatus {
  /**
   * Optional status message displayed below the input.
   */
  message?: string;
  /**
   * Validation state shown by the field.
   */
  type: InputStatusType;
}

export type InputSize = ComponentSize;
