import {Check, TriangleAlert} from 'lucide-react';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon} from '../Icon';
import {Text} from '../Text';
import {useStepperContext} from './StepperContext';

export type StepState =
  | 'active'
  | 'completed'
  | 'disabled'
  | 'error'
  | 'upcoming';

export interface StepProps {
  /**
   * Content rendered below the label and description in vertical steppers.
   */
  children?: ReactNode;
  /**
   * Additional CSS class names applied to the step.
   */
  className?: string;
  /**
   * Test ID applied to the step.
   */
  'data-testid'?: string;
  /**
   * Optional supporting text.
   */
  description?: string;
  /**
   * Whether the step has an error.
   * @default false
   */
  hasError?: boolean;
  /**
   * Custom indicator content replacing the number or check icon.
   */
  icon?: ReactNode;
  /**
   * Override the automatically computed completed state.
   */
  isCompleted?: boolean;
  /**
   * Whether the step is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Step label.
   */
  label: string;
  /**
   * Ref forwarded to the list item.
   */
  ref?: Ref<HTMLLIElement>;
  /**
   * Zero-based index of this step.
   */
  step: number;
  /**
   * Inline styles applied to the step.
   */
  style?: CSSProperties;
}

const styles = {
  horizontalRoot: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    position: 'relative',
    _last: {
      flex: 'none',
    },
    '&:last-child [data-step-connector]': {
      display: 'none',
    },
  }),
  horizontalContent: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  }),
  horizontalConnector: css({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    px: '2',
    minW: '6',
    h: '7',
  }),
  horizontalConnectorLine: css({
    h: '0.5',
    w: 'full',
    borderRadius: 'full',
    transitionProperty: 'background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
  }),
  verticalRoot: css({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    minH: '12',
    '&:last-child [data-step-connector]': {
      display: 'none',
    },
  }),
  verticalIndicatorColumn: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    w: '7',
    flexShrink: 0,
  }),
  verticalConnector: css({
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    py: '1',
  }),
  verticalConnectorLine: css({
    w: '0.5',
    h: 'full',
    borderRadius: 'full',
    transitionProperty: 'background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
  }),
  verticalContent: css({
    display: 'flex',
    flexDirection: 'column',
    ps: '3',
    pb: '6',
    flex: 1,
  }),
  indicator: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '7',
    h: '7',
    borderRadius: 'full',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'semibold',
    lineHeight: 'none',
    transitionProperty: 'background-color, color, border-color, opacity',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    flexShrink: 0,
    userSelect: 'none',
    borderWidth: 'emphasized',
    borderStyle: 'solid',
  }),
  indicatorActive: css({
    bg: 'primary',
    borderColor: 'primary',
    color: 'fg.onPrimary',
  }),
  indicatorCompleted: css({
    bg: 'primary',
    borderColor: 'primary',
    color: 'fg.onPrimary',
  }),
  indicatorUpcoming: css({
    bg: 'transparent',
    borderColor: 'border.emphasized',
    color: 'fg.muted',
  }),
  indicatorDisabled: css({
    bg: 'transparent',
    borderColor: 'border',
    color: 'fg.disabled',
  }),
  indicatorError: css({
    bg: 'status.error.solid',
    borderColor: 'status.error.solid',
    color: 'status.error.solidFg',
  }),
  indicatorClickable: css({
    cursor: 'pointer',
    _hover: {
      opacity: 0.85,
    },
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
    },
  }),
  connectorCompleted: css({
    bg: 'primary',
  }),
  connectorIncomplete: css({
    bg: 'track.emphasized',
  }),
  labelRow: css({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pt: '1',
    maxW: '120px',
  }),
  labelRowVertical: css({
    alignItems: 'flex-start',
    maxW: 'none',
    pt: '0.5',
  }),
  label: css({
    textAlign: 'center',
  }),
  labelVertical: css({
    textAlign: 'start',
  }),
  labelActive: css({
    color: 'fg',
    fontWeight: 'semibold',
  }),
  labelCompleted: css({
    color: 'fg',
  }),
  labelUpcoming: css({
    color: 'fg.muted',
  }),
  labelDisabled: css({
    color: 'fg.disabled',
  }),
  labelError: css({
    color: 'status.error.fg',
  }),
  description: css({
    textAlign: 'center',
  }),
  descriptionVertical: css({
    textAlign: 'start',
  }),
  descriptionError: css({
    color: 'status.error.fg',
  }),
  buttonReset: css({
    bg: 'none',
    borderWidth: 0,
    p: 0,
    m: 0,
    font: 'inherit',
  }),
  stepContent: css({
    pt: '3',
  }),
} as const;

function getStepState({
  hasError,
  isActive,
  isCompleted,
  isDisabled,
}: {
  hasError: boolean;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
}): StepState {
  if (hasError) {
    return 'error';
  }

  if (isDisabled) {
    return 'disabled';
  }

  if (isActive) {
    return 'active';
  }

  if (isCompleted) {
    return 'completed';
  }

  return 'upcoming';
}

function getLabelClassName(state: StepState, isVertical: boolean): string {
  return cx(
    styles.label,
    isVertical ? styles.labelVertical : undefined,
    state === 'error' ? styles.labelError : undefined,
    state === 'disabled' ? styles.labelDisabled : undefined,
    state === 'active' ? styles.labelActive : undefined,
    state === 'completed' ? styles.labelCompleted : undefined,
    state === 'upcoming' ? styles.labelUpcoming : undefined,
  );
}

function getIndicatorClassName(state: StepState, isClickable: boolean): string {
  return cx(
    styles.indicator,
    state === 'error' ? styles.indicatorError : undefined,
    state === 'disabled' ? styles.indicatorDisabled : undefined,
    state === 'active' ? styles.indicatorActive : undefined,
    state === 'completed' ? styles.indicatorCompleted : undefined,
    state === 'upcoming' ? styles.indicatorUpcoming : undefined,
    isClickable ? styles.indicatorClickable : undefined,
  );
}

/**
 * Individual step within a `Stepper`.
 */
export function Step({
  children,
  className,
  'data-testid': dataTestId,
  description,
  hasError = false,
  icon,
  isCompleted: isCompletedFromProps,
  isDisabled = false,
  label,
  ref,
  step,
  style,
}: StepProps): React.JSX.Element {
  const {activeStep, orientation, isNonLinear, onStepClick} =
    useStepperContext();
  const isActive = step === activeStep;
  const isCompleted = isCompletedFromProps ?? step < activeStep;
  const isVertical = orientation === 'vertical';
  const isClickable = isNonLinear && !isDisabled && (isCompleted || isActive);
  const state = getStepState({hasError, isActive, isCompleted, isDisabled});
  const connectorClassName = cx(
    isVertical ? styles.verticalConnectorLine : styles.horizontalConnectorLine,
    isCompleted ? styles.connectorCompleted : styles.connectorIncomplete,
  );
  const defaultIndicatorContent = isCompleted ? (
    <Icon color="inherit" icon={Check} size="sm" />
  ) : (
    <span>{step + 1}</span>
  );
  const indicatorContent = hasError ? (
    <Icon color="inherit" icon={TriangleAlert} size="sm" />
  ) : (
    (icon ?? defaultIndicatorContent)
  );

  const handleClick = () => {
    if (isClickable) {
      onStepClick?.(step);
    }
  };

  const indicator = isClickable ? (
    <button
      aria-label={`Go to step ${step + 1}: ${label}`}
      className={cx(styles.buttonReset, getIndicatorClassName(state, true))}
      onClick={handleClick}
      type="button">
      {indicatorContent}
    </button>
  ) : (
    <div aria-hidden="true" className={getIndicatorClassName(state, false)}>
      {indicatorContent}
    </div>
  );

  const labelNode = (
    <div
      className={cx(
        styles.labelRow,
        isVertical ? styles.labelRowVertical : undefined,
      )}>
      <Text
        as="span"
        className={getLabelClassName(state, isVertical)}
        color="inherit"
        type="label">
        {label}
      </Text>
      {description != null ? (
        <Text
          as="span"
          className={cx(
            styles.description,
            isVertical ? styles.descriptionVertical : undefined,
            state === 'error' ? styles.descriptionError : undefined,
          )}
          color="secondary"
          type="supporting">
          {description}
        </Text>
      ) : null}
    </div>
  );

  if (isVertical) {
    return (
      <li
        aria-current={isActive ? 'step' : undefined}
        className={cx(styles.verticalRoot, className)}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        <div className={styles.verticalIndicatorColumn}>
          {indicator}
          <div className={styles.verticalConnector} data-step-connector="">
            <div className={connectorClassName} />
          </div>
        </div>
        <div className={styles.verticalContent}>
          {labelNode}
          {children != null ? (
            <div className={styles.stepContent}>{children}</div>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li
      aria-current={isActive ? 'step' : undefined}
      className={cx(styles.horizontalRoot, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <div className={styles.horizontalContent}>
        {indicator}
        {labelNode}
      </div>
      <div className={styles.horizontalConnector} data-step-connector="">
        <div className={connectorClassName} />
      </div>
    </li>
  );
}

Step.displayName = 'Step';
