import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Step} from './internal/Step';

export type StepperOrientation = 'horizontal' | 'vertical';

export interface StepConfig {
  /**
   * Content rendered below the label and description in vertical steppers.
   */
  content?: ReactNode;
  /**
   * Test ID applied to the step's list item.
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
   * Stable identifier for the step. Referenced by `activeStep` and passed to
   * `onStepClick`, and used as the React key when rendering.
   */
  id: string;
  /**
   * Override the automatically computed completed state. By default a step is
   * completed when it appears before the active step.
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
}

export interface StepperProps {
  /**
   * `id` of the active step. A step is completed when it appears before the
   * active step in `steps`; pass an `id` that is not in `steps` (or mark steps
   * `isCompleted`) to represent a fully finished sequence.
   */
  activeStep: string;
  /**
   * Additional CSS class names applied to the ordered list.
   */
  className?: string;
  /**
   * Test ID applied to the ordered list.
   */
  'data-testid'?: string;
  /**
   * Accessible label for the navigation landmark.
   * @default 'Progress'
   */
  label?: string;
  /**
   * Called with the step `id` when a completed or active step indicator is
   * clicked.
   */
  onStepClick?: (id: string) => void;
  /**
   * Layout direction.
   * @default 'horizontal'
   */
  orientation?: StepperOrientation;
  /**
   * Ref forwarded to the navigation element.
   */
  ref?: Ref<HTMLElement>;
  /**
   * Ordered list of steps to render.
   */
  steps: StepConfig[];
  /**
   * Inline styles applied to the ordered list.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    display: 'flex',
    w: 'full',
    m: 0,
    p: 0,
    listStyleType: 'none',
  }),
  horizontal: css({
    flexDirection: 'row',
    alignItems: 'flex-start',
  }),
  vertical: css({
    flexDirection: 'column',
  }),
} as const;

/**
 * Displays progress through a sequence of logical steps.
 */
export function Stepper({
  activeStep,
  className,
  'data-testid': dataTestId,
  label = 'Progress',
  onStepClick,
  orientation = 'horizontal',
  ref,
  steps,
  style,
}: StepperProps): React.JSX.Element {
  const isNonLinear = onStepClick != null;
  const activeIndex = steps.findIndex(step => step.id === activeStep);

  return (
    <nav
      aria-label={label}
      className={className}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      <ol
        className={cx(
          styles.root,
          orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        )}>
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isDisabled = step.isDisabled ?? false;
          const hasError = step.hasError ?? false;
          const isCompleted =
            step.isCompleted ?? (activeIndex !== -1 && index < activeIndex);
          const isClickable =
            isNonLinear && !isDisabled && (isCompleted || isActive);

          return (
            <Step
              content={step.content}
              data-testid={step['data-testid']}
              description={step.description}
              hasError={hasError}
              icon={step.icon}
              index={index}
              isActive={isActive}
              isClickable={isClickable}
              isCompleted={isCompleted}
              isDisabled={isDisabled}
              key={step.id}
              label={step.label}
              onClick={() => onStepClick?.(step.id)}
              orientation={orientation}
            />
          );
        })}
      </ol>
    </nav>
  );
}

Stepper.displayName = 'Stepper';
