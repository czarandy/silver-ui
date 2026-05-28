import {useMemo, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {
  StepperContext,
  type StepperContextValue,
  type StepperOrientation,
} from './StepperContext';

export type {StepperOrientation};

export interface StepperProps {
  /**
   * Zero-based index of the active step.
   */
  activeStep: number;
  /**
   * Step elements to render.
   */
  children: ReactNode;
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
   * Called when a completed or active step indicator is clicked.
   */
  onStepClick?: (index: number) => void;
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
  children,
  className,
  'data-testid': dataTestId,
  label = 'Progress',
  onStepClick,
  orientation = 'horizontal',
  ref,
  style,
}: StepperProps): React.JSX.Element {
  const contextValue = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      isNonLinear: onStepClick != null,
      onStepClick: onStepClick ?? null,
      orientation,
    }),
    [activeStep, onStepClick, orientation],
  );

  return (
    <StepperContext value={contextValue}>
      <nav aria-label={label} ref={ref}>
        <ol
          className={cx(
            styles.root,
            orientation === 'horizontal' ? styles.horizontal : styles.vertical,
            className,
          )}
          data-testid={dataTestId}
          style={style}>
          {children}
        </ol>
      </nav>
    </StepperContext>
  );
}

Stepper.displayName = 'Stepper';
