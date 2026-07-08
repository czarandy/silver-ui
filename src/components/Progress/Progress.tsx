'use client';

import {useId, type CSSProperties, type Ref} from 'react';
import {progressRecipe} from 'components/Progress/Progress.recipe';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {cx} from 'internal/cx';

export type ProgressVariant =
  | 'error'
  | 'info'
  | 'neutral'
  | 'success'
  | 'warning';

export interface ProgressProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Custom formatter for the value label and aria-valuetext.
   */
  formatValueLabel?: (value: number, max: number) => string;
  /**
   * Whether to display the formatted value beside the label.
   * @default false
   */
  hasValueLabel?: boolean;
  /**
   * Whether the progress bar is visually disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to render an indeterminate loading indicator.
   * @default false
   */
  isIndeterminate?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Accessible label for the progress bar.
   */
  label: string;
  /**
   * Maximum progress value.
   * @default 100
   */
  max?: number;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * ARIA role for the progress indicator. Use 'progressbar' for task
   * completion and 'meter' for static gauges.
   * @default 'progressbar'
   */
  role?: 'meter' | 'progressbar';
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Current progress value.
   * @default 0
   */
  value?: number;
  /**
   * Semantic color variant.
   * @default 'info'
   */
  variant?: ProgressVariant;
}

function defaultFormatValueLabel(value: number, max: number): string {
  if (max <= 0) {
    return '0%';
  }
  return `${Math.round((value / max) * 100)}%`;
}

/**
 * A progress bar that communicates determinate or indeterminate loading state.
 */
export function Progress({
  className,
  'data-testid': dataTestId,
  formatValueLabel = defaultFormatValueLabel,
  hasValueLabel = false,
  isDisabled = false,
  isIndeterminate = false,
  isLabelHidden = false,
  label,
  max = 100,
  ref,
  role: roleProp = 'progressbar',
  style,
  value = 0,
  variant = 'info',
}: ProgressProps): React.JSX.Element {
  const labelId = useId();

  if (process.env.NODE_ENV !== 'production' && max <= 0) {
    console.warn('Progress: `max` must be greater than 0.');
  }

  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, max);
  const showValueLabel = hasValueLabel && !isIndeterminate;
  const classes = progressRecipe({variant, isDisabled, isIndeterminate});

  return (
    <div
      className={cx(classes.container, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {!isLabelHidden || showValueLabel ? (
        <div className={classes.header}>
          {isLabelHidden ? (
            <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
          ) : (
            <span className={classes.label} id={labelId}>
              {label}
            </span>
          )}
          {showValueLabel ? (
            <span className={classes.valueLabel}>{valueText}</span>
          ) : null}
        </div>
      ) : (
        <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
      )}

      <div
        aria-disabled={isDisabled || undefined}
        aria-labelledby={labelId}
        aria-valuemax={isIndeterminate ? undefined : max}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        aria-valuetext={isIndeterminate ? undefined : valueText}
        className={classes.track}
        role={isIndeterminate ? 'progressbar' : roleProp}>
        <div
          className={classes.fill}
          style={isIndeterminate ? undefined : {width: `${percentage}%`}}
        />
      </div>
    </div>
  );
}

Progress.displayName = 'Progress';
