'use client';

import {Check, TriangleAlert} from 'lucide-react';
import type {ReactNode} from 'react';
import {Icon} from 'components/Icon';
import type {StepperOrientation} from 'components/Stepper/Stepper';
import {stepRecipe} from 'components/Stepper/internal/Step.recipe';
import {Text} from 'components/Text';
import isReactNode from 'internal/isReactNode';

export type StepState =
  | 'active'
  | 'completed'
  | 'disabled'
  | 'error'
  | 'upcoming';

/**
 * Resolved props for a single rendered step. Computed by `Stepper`; not part of
 * the public API.
 */
export interface StepProps {
  content?: ReactNode;
  'data-testid'?: string;
  description?: string;
  hasError: boolean;
  icon?: ReactNode;
  /**
   * Zero-based position of this step within the stepper.
   */
  index: number;
  isActive: boolean;
  isClickable: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  label: string;
  /**
   * Invoked when a clickable indicator is activated.
   */
  onClick: () => void;
  orientation: StepperOrientation;
}

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

/**
 * Individual step within a `Stepper`. Rendered internally by `Stepper`.
 */
export function Step({
  content,
  'data-testid': dataTestId,
  description,
  hasError,
  icon,
  index,
  isActive,
  isClickable,
  isCompleted,
  isDisabled,
  label,
  onClick,
  orientation,
}: StepProps): React.JSX.Element {
  const isVertical = orientation === 'vertical';
  const state = getStepState({hasError, isActive, isCompleted, isDisabled});

  const classes = stepRecipe({orientation, state, isClickable, isCompleted});

  const defaultIndicatorContent = isCompleted ? (
    <Icon color="inherit" icon={Check} size="sm" />
  ) : (
    <span>{index + 1}</span>
  );
  const indicatorContent = hasError ? (
    <Icon color="inherit" icon={TriangleAlert} size="sm" />
  ) : (
    (icon ?? defaultIndicatorContent)
  );

  const stepLabel = hasError
    ? `Go to step ${index + 1}: ${label} (error)`
    : `Go to step ${index + 1}: ${label}`;

  const indicator = isClickable ? (
    <button
      aria-label={stepLabel}
      className={classes.indicator}
      onClick={onClick}
      type="button">
      {indicatorContent}
    </button>
  ) : (
    <div aria-hidden="true" className={classes.indicator}>
      {indicatorContent}
    </div>
  );

  const labelNode = (
    <div className={classes.labelRow}>
      <Text as="span" className={classes.label} color="inherit" type="label">
        {label}
      </Text>
      {description != null ? (
        <Text
          as="span"
          className={classes.description}
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
        className={classes.root}
        data-testid={dataTestId}>
        <div className={classes.indicatorColumn}>
          {indicator}
          <div className={classes.connectorWrapper} data-step-connector="">
            <div className={classes.connector} />
          </div>
        </div>
        <div className={classes.content}>
          {labelNode}
          {isReactNode(content) ? (
            <div className={classes.childrenContent}>{content}</div>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li
      aria-current={isActive ? 'step' : undefined}
      className={classes.root}
      data-testid={dataTestId}>
      <div className={classes.content}>
        {indicator}
        {labelNode}
      </div>
      <div className={classes.connectorWrapper} data-step-connector="">
        <div className={classes.connector} />
      </div>
    </li>
  );
}

Step.displayName = 'Step';
