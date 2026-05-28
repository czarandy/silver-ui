import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Step} from './Step';
import {Stepper} from './Stepper';

describe('Stepper', () => {
  it('renders a navigation landmark with steps', () => {
    render(
      <Stepper activeStep={0}>
        <Step label="Step 1" step={0} />
        <Step label="Step 2" step={1} />
        <Step label="Step 3" step={2} />
      </Stepper>,
    );

    expect(
      screen.getByRole('navigation', {name: 'Progress'}),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('marks the active step with aria-current', () => {
    render(
      <Stepper activeStep={1}>
        <Step data-testid="step-0" label="Step 1" step={0} />
        <Step data-testid="step-1" label="Step 2" step={1} />
        <Step data-testid="step-2" label="Step 3" step={2} />
      </Stepper>,
    );

    expect(screen.getByTestId('step-0')).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('step-1')).toHaveAttribute(
      'aria-current',
      'step',
    );
    expect(screen.getByTestId('step-2')).not.toHaveAttribute('aria-current');
  });

  it('renders descriptions and custom navigation label', () => {
    render(
      <Stepper activeStep={0} label="Checkout progress">
        <Step description="Review your cart" label="Cart" step={0} />
        <Step label="Payment" step={1} />
      </Stepper>,
    );

    expect(
      screen.getByRole('navigation', {name: 'Checkout progress'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Review your cart')).toBeInTheDocument();
  });

  it('supports vertical orientation with step content', () => {
    render(
      <Stepper activeStep={0} orientation="vertical">
        <Step label="Account" step={0}>
          <div>Account form</div>
        </Step>
        <Step label="Review" step={1} />
      </Stepper>,
    );

    expect(screen.getByText('Account form')).toBeInTheDocument();
  });

  it('calls onStepClick for completed and active steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();

    render(
      <Stepper activeStep={1} onStepClick={onStepClick}>
        <Step label="Account" step={0} />
        <Step label="Profile" step={1} />
        <Step label="Review" step={2} />
      </Stepper>,
    );

    await user.click(
      screen.getByRole('button', {name: 'Go to step 1: Account'}),
    );
    await user.click(
      screen.getByRole('button', {name: 'Go to step 2: Profile'}),
    );

    expect(onStepClick).toHaveBeenCalledWith(0);
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('does not render buttons for upcoming or disabled steps', () => {
    render(
      <Stepper activeStep={1} onStepClick={() => {}}>
        <Step isDisabled label="Account" step={0} />
        <Step label="Profile" step={1} />
        <Step label="Review" step={2} />
      </Stepper>,
    );

    expect(
      screen.queryByRole('button', {name: 'Go to step 1: Account'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Go to step 3: Review'}),
    ).not.toBeInTheDocument();
  });

  it('supports completion override, error state, custom icon, and data-testid', () => {
    render(
      <Stepper activeStep={0}>
        <Step data-testid="step" isCompleted label="Done" step={0} />
        <Step hasError label="Error" step={1} />
        <Step
          icon={<span data-testid="custom-icon">I</span>}
          label="Icon"
          step={2}
        />
      </Stepper>,
    );

    expect(screen.getByTestId('step')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
