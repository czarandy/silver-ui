import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Stepper, type StepConfig} from './Stepper';

const threeSteps: StepConfig[] = [
  {id: 'account', label: 'Step 1'},
  {id: 'profile', label: 'Step 2'},
  {id: 'review', label: 'Step 3'},
];

describe('Stepper', () => {
  it('renders a navigation landmark with steps', () => {
    render(<Stepper activeStep="account" steps={threeSteps} />);

    expect(
      screen.getByRole('navigation', {name: 'Progress'}),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText('Step 1')).toBeInTheDocument();
    expect(screen.getByText('Step 2')).toBeInTheDocument();
  });

  it('marks the active step with aria-current', () => {
    render(
      <Stepper
        activeStep="profile"
        steps={[
          {id: 'account', label: 'Step 1', 'data-testid': 'step-0'},
          {id: 'profile', label: 'Step 2', 'data-testid': 'step-1'},
          {id: 'review', label: 'Step 3', 'data-testid': 'step-2'},
        ]}
      />,
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
      <Stepper
        activeStep="cart"
        label="Checkout progress"
        steps={[
          {id: 'cart', label: 'Cart', description: 'Review your cart'},
          {id: 'payment', label: 'Payment'},
        ]}
      />,
    );

    expect(
      screen.getByRole('navigation', {name: 'Checkout progress'}),
    ).toBeInTheDocument();
    expect(screen.getByText('Review your cart')).toBeInTheDocument();
  });

  it('supports vertical orientation with step content', () => {
    render(
      <Stepper
        activeStep="account"
        orientation="vertical"
        steps={[
          {id: 'account', label: 'Account', content: <div>Account form</div>},
          {id: 'review', label: 'Review'},
        ]}
      />,
    );

    expect(screen.getByText('Account form')).toBeInTheDocument();
  });

  it('calls onStepClick with the id for completed and active steps', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();

    render(
      <Stepper
        activeStep="profile"
        onStepClick={onStepClick}
        steps={[
          {id: 'account', label: 'Account'},
          {id: 'profile', label: 'Profile'},
          {id: 'review', label: 'Review'},
        ]}
      />,
    );

    await user.click(
      screen.getByRole('button', {name: 'Go to step 1: Account'}),
    );
    await user.click(
      screen.getByRole('button', {name: 'Go to step 2: Profile'}),
    );

    expect(onStepClick).toHaveBeenCalledWith('account');
    expect(onStepClick).toHaveBeenCalledWith('profile');
  });

  it('calls onStepClick in vertical orientation', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();

    render(
      <Stepper
        activeStep="profile"
        onStepClick={onStepClick}
        orientation="vertical"
        steps={[
          {id: 'account', label: 'Account'},
          {id: 'profile', label: 'Profile'},
          {id: 'review', label: 'Review'},
        ]}
      />,
    );

    await user.click(
      screen.getByRole('button', {name: 'Go to step 1: Account'}),
    );
    expect(onStepClick).toHaveBeenCalledWith('account');
  });

  it('does not render buttons for upcoming or disabled steps', () => {
    render(
      <Stepper
        activeStep="profile"
        onStepClick={() => {}}
        steps={[
          {id: 'account', label: 'Account', isDisabled: true},
          {id: 'profile', label: 'Profile'},
          {id: 'review', label: 'Review'},
        ]}
      />,
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
      <Stepper
        activeStep="profile"
        steps={[
          {id: 'account', label: 'Account'},
          {
            id: 'profile',
            label: 'Profile',
            description: 'Fix the errors below',
            hasError: true,
            'data-testid': 'error-step',
          },
          {id: 'review', label: 'Review'},
        ]}
      />,
    );

    expect(screen.getByTestId('error-step')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Fix the errors below')).toBeInTheDocument();
  });

  it('renders check icon when isCompleted overrides active step', () => {
    render(
      <Stepper
        activeStep="done"
        steps={[
          {id: 'done', label: 'Done', isCompleted: true},
          {id: 'upcoming', label: 'Upcoming'},
        ]}
      />,
    );

    expect(screen.getByText('Done')).toBeInTheDocument();
  });

  it('renders custom icon', () => {
    render(
      <Stepper
        activeStep="custom"
        steps={[
          {
            id: 'custom',
            label: 'Custom',
            icon: <span data-testid="custom-icon">I</span>,
          },
        ]}
      />,
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('leaves all steps inactive when activeStep id is not in steps', () => {
    render(
      <Stepper
        activeStep="missing"
        steps={[
          {id: 'account', label: 'Step 1', 'data-testid': 'step-0'},
          {id: 'profile', label: 'Step 2', 'data-testid': 'step-1'},
          {id: 'review', label: 'Step 3', 'data-testid': 'step-2'},
        ]}
      />,
    );

    expect(screen.getByTestId('step-0')).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('step-1')).not.toHaveAttribute('aria-current');
    expect(screen.getByTestId('step-2')).not.toHaveAttribute('aria-current');
  });

  it('forwards className, style, and ref on Stepper', () => {
    const ref = vi.fn<(el: HTMLElement | null) => void>();

    render(
      <Stepper
        activeStep="account"
        className="custom-stepper"
        data-testid="stepper"
        ref={ref}
        steps={[{id: 'account', label: 'Step 1'}]}
        style={{maxWidth: 600}}
      />,
    );

    const stepper = screen.getByTestId('stepper');
    expect(stepper).toHaveClass('custom-stepper');
    expect(stepper).toHaveStyle({maxWidth: '600px'});
    // ref, className, style, and data-testid all target the same <nav> root.
    expect(ref).toHaveBeenCalledWith(stepper);
  });

  it('forwards data-testid on each step', () => {
    render(
      <Stepper
        activeStep="account"
        steps={[{id: 'account', label: 'Step 1', 'data-testid': 'my-step'}]}
      />,
    );

    expect(screen.getByTestId('my-step')).toBeInTheDocument();
  });

  it('communicates error state via indicator label', async () => {
    const user = userEvent.setup();
    const onStepClick = vi.fn();

    render(
      <Stepper
        activeStep="profile"
        onStepClick={onStepClick}
        steps={[
          {id: 'account', label: 'Account'},
          {id: 'profile', label: 'Profile', hasError: true},
        ]}
      />,
    );

    const button = screen.getByRole('button', {
      name: 'Go to step 2: Profile (error)',
    });
    expect(button).toBeInTheDocument();
    await user.click(button);
    expect(onStepClick).toHaveBeenCalledWith('profile');
  });

  it('renders disabled steps without a clickable button', () => {
    render(
      <Stepper
        activeStep="account"
        onStepClick={() => {}}
        steps={[
          {id: 'account', label: 'Account'},
          {
            id: 'profile',
            label: 'Profile',
            isDisabled: true,
            'data-testid': 'disabled-step',
          },
        ]}
      />,
    );

    expect(screen.getByTestId('disabled-step')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: /Profile/}),
    ).not.toBeInTheDocument();
  });
});
