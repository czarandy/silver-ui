'use client';

import {useId} from 'react';

export type ProgressRole = 'meter' | 'progressbar';

export interface UseProgressStateOptions {
  /**
   * Component name used in development warnings.
   */
  componentName: 'CircularProgress' | 'Progress';
  /**
   * Custom formatter for the value label and aria-valuetext.
   */
  formatValueLabel?: (value: number, max: number) => string;
  /**
   * Whether to display the formatted value.
   */
  hasValueLabel: boolean;
  /**
   * Whether the progress indicator is disabled.
   */
  isDisabled: boolean;
  /**
   * Whether the progress indicator is indeterminate.
   */
  isIndeterminate: boolean;
  /**
   * Maximum progress value.
   */
  max: number;
  /**
   * Requested ARIA role.
   */
  role: ProgressRole;
  /**
   * Current progress value.
   */
  value: number;
}

export interface ProgressAriaProps {
  'aria-disabled': true | undefined;
  'aria-labelledby': string;
  'aria-valuemax': number | undefined;
  'aria-valuemin': 0 | undefined;
  'aria-valuenow': number | undefined;
  'aria-valuetext': string | undefined;
  role: ProgressRole;
}

export interface ProgressState {
  /**
   * ARIA attributes applied to the progress indicator element.
   */
  ariaProps: ProgressAriaProps;
  /**
   * Value constrained to the supported range.
   */
  clampedValue: number;
  /**
   * ID applied to the label referenced by the progress indicator.
   */
  labelId: string;
  /**
   * Normalized progress from 0 to 100.
   */
  percentage: number;
  /**
   * Whether the formatted value should be rendered visibly.
   */
  showValueLabel: boolean;
  /**
   * Formatted value shared by the visible label and aria-valuetext.
   */
  valueText: string;
}

function defaultFormatValueLabel(value: number, max: number): string {
  if (max <= 0) {
    return '0%';
  }
  return `${Math.round((value / max) * 100)}%`;
}

/**
 * Resolves the value math and accessibility contract shared by linear and
 * circular progress indicators.
 */
export function useProgressState({
  componentName,
  formatValueLabel = defaultFormatValueLabel,
  hasValueLabel,
  isDisabled,
  isIndeterminate,
  max,
  role,
  value,
}: UseProgressStateOptions): ProgressState {
  const labelId = useId();

  if (process.env.NODE_ENV !== 'production' && max <= 0) {
    console.warn(`${componentName}: \`max\` must be greater than 0.`);
  }

  const clampedValue = Number.isNaN(value)
    ? 0
    : Math.min(Math.max(0, value), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, max);
  const showValueLabel = hasValueLabel && !isIndeterminate;

  return {
    ariaProps: {
      'aria-disabled': isDisabled || undefined,
      'aria-labelledby': labelId,
      'aria-valuemax': isIndeterminate ? undefined : max,
      'aria-valuemin': isIndeterminate ? undefined : 0,
      'aria-valuenow': isIndeterminate ? undefined : clampedValue,
      'aria-valuetext': isIndeterminate ? undefined : valueText,
      role: isIndeterminate ? 'progressbar' : role,
    },
    clampedValue,
    labelId,
    percentage,
    showValueLabel,
    valueText,
  };
}
