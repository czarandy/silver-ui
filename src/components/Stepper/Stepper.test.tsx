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

  it('calls onStepClick in vertical orientation', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();

    render(
      <Stepper activeStep={1} onStepClick={onStepClick} orientation="vertical">
        <Step label="Account" step={0} />
        <Step label="Profile" step={1} />
        <Step label="Review" step={2} />
      </Stepper>,
    );

    await user.click(
      screen.getByRole('button', {name: 'Go to step 1: Account'}),
    );
    expect(onStepClick).toHaveBeenCalledWith(0);
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

  it('renders error state with error indicator', () => {
    render(
      <Stepper activeStep={1}>
        <Step label="Account" step={0} />
        <Step
          data-testid="error-step"
          description="Fix the errors below"
          hasError
          label="Profile"
          step={1}
        />
        <Step label="Review" step={2} />
      </Stepper>,
    );

    expect(screen.getByTestId('error-step')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Fix the errors below')).toBeInTheDocument();
  });

  it('renders check icon when isCompleted overrides active step', () => {
    render(
      <Stepper activeStep={0}>
        <Step isCompleted label="Done" step={0} />
        <Step label="Upcoming" step={1} />
      </Stepper>,
    );

    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(
      <Stepper activeStep={0}>
        <Step
          icon={<span data-testid="custom-icon">I</span>}
          label="Custom"
          step={0}
        />
      </Stepper>,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('marks all steps completed when activeStep exceeds range', () => {
    render(
      <Stepper activeStep={3}>
        <Step data-testid="step-0" label="Step 1" step={0} />
        <Step data-testid="step-1" label="Step 2" step={1} />
        <Step data-testid="step-2" label="Step 3" step={2} />
      </Stepper>,
    );

    expect(screen.getByTestId('step-0')).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('step-1')).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('step-2')).not.toHaveAttribute('aria-current');
  });

  it('forwards className, style, and ref on Stepper', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();

    render(
      <Stepper
        activeStep={0}
        className="custom-stepper"
        data-testid="stepper"
        ref={ref}
        style={{maxWidth: 600}}>
        <Step label="Step 1" step={0} />
      </Stepper>,
    );

    const stepper = screen.getByTestId('stepper');
    expect(stepper).toHaveClass('custom-stepper');
    expect(stepper).toHaveStyle({maxWidth: '600px'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it('forwards data-testid on Step', () => {
    render(
      <Stepper activeStep={0}>
        <Step data-testid="my-step" label="Step 1" step={0} />
      </Stepper>,
    );

    expect(screen.getByTestId('my-step')).toBeInTheDocument();
  });

  it('communicates error state via indicator label', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();

    render(
      <Stepper activeStep={1} onStepClick={onStepClick}>
        <Step label="Account" step={0} />
        <Step hasError label="Profile" step={1} />
      </Stepper>,
    );

    const button = screen.getByRole('button', {
      name: 'Go to step 2: Profile (error)',
    });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('renders disabled steps without a clickable button', () => {
    render(
      <Stepper activeStep={0} onStepClick={() => {}}>
        <Step label="Account" step={0} />
        <Step data-testid="disabled-step" isDisabled label="Profile" step={1} />
      </Stepper>,
    );

    expect(screen.getByTestId('disabled-step')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /Profile/}),
    ).not.toBeInTheDocument();
  });
});
