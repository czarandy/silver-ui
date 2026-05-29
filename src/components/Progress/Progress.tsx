import {useId, type CSSProperties, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

export type ProgressVariant =
  | 'accent'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'error';

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
   * @default 'accent'
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
  mutedText: css({
    color: 'fg.muted',
  }),
  disabledText: css({
    color: 'silver-neutral.400',
  }),
  valueLabel: css({
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'normal',
    whiteSpace: 'nowrap',
  }),
  visuallyHidden: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
  track: css({
    w: 'full',
    h: '2',
    overflow: 'hidden',
    borderRadius: 'full',
    bg: 'silver-neutral.100',
  }),
  fill: css({
    h: 'full',
    borderRadius: 'full',
    transitionProperty: 'width',
    transitionDuration: 'normal',
    transitionTimingFunction: 'default',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
    },
  }),
  indeterminateFill: css({
    h: 'full',
    w: '40%',
    borderRadius: 'full',
    animation: 'pulse 1.5s ease-in-out infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'pulse 3s ease-in-out infinite',
    },
  }),
  variant: {
    accent: css({bg: 'primary'}),
    success: css({bg: 'green.600'}),
    warning: css({bg: 'yellow.500'}),
    error: css({bg: 'red.600'}),
    neutral: css({bg: 'silver-neutral.500'}),
    disabled: css({bg: 'silver-neutral.400'}),
  },
} as const;

function defaultFormatValueLabel(value: number, max: number): string {
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
  style,
  value = 0,
  variant = 'accent',
}: ProgressProps): React.JSX.Element {
  const labelId = useId();
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = max > 0 ? (clampedValue / max) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, max);
  const showValueLabel = hasValueLabel && !isIndeterminate;
  const fillVariant = isDisabled ? 'disabled' : variant;

  return (
    <div
      className={cx(styles.container, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {!isLabelHidden || showValueLabel ? (
        <div className={styles.header}>
          <span
            className={cx(
              styles.label,
              isLabelHidden ? styles.visuallyHidden : undefined,
              isDisabled ? styles.disabledText : undefined,
            )}
            id={labelId}>
            {label}
          </span>
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
        <span className={styles.visuallyHidden} id={labelId}>
          {label}
        </span>
      )}

      <div
        aria-labelledby={labelId}
        aria-valuemax={isIndeterminate ? undefined : max}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        aria-valuetext={isIndeterminate ? undefined : valueText}
        className={styles.track}
        role={isIndeterminate ? 'progressbar' : 'meter'}>
        <div
          className={cx(
            isIndeterminate ? styles.indeterminateFill : styles.fill,
            styles.variant[fillVariant],
          )}
          style={isIndeterminate ? undefined : {width: `${percentage}%`}}
        />
      </div>
    </div>
  );
}

Progress.displayName = 'Progress';
