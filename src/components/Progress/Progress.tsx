import {useId, type CSSProperties, type Ref} from 'react';
import {css} from 'styled-system/css';
import {VisuallyHidden} from '../../internal/VisuallyHidden';
import {cx} from '../../internal/cx';
import {progressFillRecipe} from './Progress.recipe';

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

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '1',
    w: 'full',
    minW: '12',
  }),
  header: css({
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '2',
  }),
  label: css({
    color: 'fg',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'medium',
    lineHeight: 'normal',
  }),
  disabledText: css({
    color: 'fg.disabled',
  }),
  valueLabel: css({
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'normal',
    whiteSpace: 'nowrap',
  }),
  track: css({
    w: 'full',
    h: '2',
    overflow: 'hidden',
    borderRadius: 'full',
    bg: 'bg.hover',
  }),
} as const;

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

  return (
    <div
      className={cx(styles.container, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {!isLabelHidden || showValueLabel ? (
        <div className={styles.header}>
          {isLabelHidden ? (
            <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
          ) : (
            <span
              className={cx(
                styles.label,
                isDisabled ? styles.disabledText : undefined,
              )}
              id={labelId}>
              {label}
            </span>
          )}
          {showValueLabel ? (
            <span
              className={cx(
                styles.valueLabel,
                isDisabled ? styles.disabledText : undefined,
              )}>
              {valueText}
            </span>
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
        className={styles.track}
        role={isIndeterminate ? 'progressbar' : roleProp}>
        <div
          className={progressFillRecipe({variant, isDisabled, isIndeterminate})}
          style={isIndeterminate ? undefined : {width: `${percentage}%`}}
        />
      </div>
    </div>
  );
}

Progress.displayName = 'Progress';
