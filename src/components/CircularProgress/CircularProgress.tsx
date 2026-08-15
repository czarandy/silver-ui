'use client';

import type {CSSProperties, Ref} from 'react';
import {circularProgressRecipe} from 'components/CircularProgress/CircularProgress.recipe';
import type {ProgressVariant} from 'components/Progress';
import {useProgressState} from 'components/Progress/useProgressState';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {toPixelSize} from 'internal/toPixelSize';
import {cx} from 'utils/cx';

const VIEWBOX_SIZE = 100;
const RADIUS = 46;
const STROKE_WIDTH = 8;
const FULL_ARC = 100;
const INDETERMINATE_ARC = '25 75';

type CircularProgressStyle = CSSProperties & {
  '--circular-progress-size': number | string | undefined;
};

export interface CircularProgressProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Custom formatter for the centered value label and aria-valuetext.
   */
  formatValueLabel?: (value: number, max: number) => string;
  /**
   * Whether to display the formatted value in the center of the ring.
   * @default false
   */
  hasValueLabel?: boolean;
  /**
   * Whether the progress ring is visually disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to render a rotating indeterminate progress arc.
   * @default false
   */
  isIndeterminate?: boolean;
  /**
   * Whether to visually hide the label below the ring.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Accessible label for the progress ring.
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
   * Diameter of the progress ring. Numbers are pixels and strings are used
   * as CSS lengths.
   * @default 64
   */
  size?: number | string;
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

/**
 * A circular progress ring for determinate or indeterminate loading state.
 */
export function CircularProgress({
  className,
  'data-testid': dataTestId,
  formatValueLabel,
  hasValueLabel = false,
  isDisabled = false,
  isIndeterminate = false,
  isLabelHidden = false,
  label,
  max = 100,
  ref,
  role: roleProp = 'progressbar',
  size = 64,
  style,
  value = 0,
  variant = 'info',
}: CircularProgressProps): React.JSX.Element {
  const {ariaProps, labelId, percentage, showValueLabel, valueText} =
    useProgressState({
      componentName: 'CircularProgress',
      formatValueLabel,
      hasValueLabel,
      isDisabled,
      isIndeterminate,
      max,
      role: roleProp,
      value,
    });
  const classes = circularProgressRecipe({
    variant,
    isDisabled,
    isIndeterminate,
  });
  const rootStyle: CircularProgressStyle = {
    ...style,
    '--circular-progress-size': toPixelSize(size),
  };
  const indicatorStyle: CSSProperties | undefined = isIndeterminate
    ? undefined
    : {
        opacity: percentage === 0 ? 0 : undefined,
        strokeDashoffset: FULL_ARC - percentage,
      };

  return (
    <div
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={rootStyle}>
      <div {...ariaProps} className={classes.visual}>
        <svg
          aria-hidden="true"
          className={classes.svg}
          focusable="false"
          viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}>
          <circle
            className={classes.track}
            cx={VIEWBOX_SIZE / 2}
            cy={VIEWBOX_SIZE / 2}
            pathLength={FULL_ARC}
            r={RADIUS}
            stroke="currentColor"
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            className={classes.indicator}
            cx={VIEWBOX_SIZE / 2}
            cy={VIEWBOX_SIZE / 2}
            data-progress-indicator=""
            pathLength={FULL_ARC}
            r={RADIUS}
            stroke="currentColor"
            strokeDasharray={isIndeterminate ? INDETERMINATE_ARC : FULL_ARC}
            strokeLinecap="round"
            strokeWidth={STROKE_WIDTH}
            style={indicatorStyle}
          />
        </svg>
        {showValueLabel ? (
          <span className={classes.valueLabel}>{valueText}</span>
        ) : null}
      </div>
      {isLabelHidden ? (
        <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
      ) : (
        <span className={classes.label} id={labelId}>
          {label}
        </span>
      )}
    </div>
  );
}

CircularProgress.displayName = 'CircularProgress';
