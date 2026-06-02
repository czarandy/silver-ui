import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {plainDateCreate} from '../../internal/plainDate';
import {DateRangeInput} from './DateRangeInput';

const defaultRange = {
  start: plainDateCreate(2026, 5, 10),
  end: plainDateCreate(2026, 5, 12),
};

describe('DateRangeInput', () => {
  it('renders a formatted range and clears it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateRangeInput
        hasClear
        label="Window"
        onChange={onChange}
        value={defaultRange}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Window'})).toHaveValue(
      'May 10, 2026 - May 12, 2026',
    );
    await user.click(screen.getByRole('button', {name: 'Clear Window'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('renders placeholder when value is undefined', () => {
    render(
      <DateRangeInput label="Window" onChange={() => {}} value={undefined} />,
    );

    expect(screen.getByRole('textbox', {name: 'Window'})).toHaveAttribute(
      'placeholder',
      'Select a date range',
    );
  });

  it('does not show clear button when hasClear is false', () => {
    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Window'}),
    ).not.toBeInTheDocument();
  });

  it('does not show clear button when value is undefined', () => {
    render(
      <DateRangeInput
        hasClear
        label="Window"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Window'}),
    ).not.toBeInTheDocument();
  });

  it('disables the input and calendar button when isDisabled is true', () => {
    render(
      <DateRangeInput
        isDisabled
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Window'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Choose Window'})).toBeDisabled();
  });

  it('hides clear button when isDisabled is true', () => {
    render(
      <DateRangeInput
        hasClear
        isDisabled
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Window'}),
    ).not.toBeInTheDocument();
  });

  it('does not disable the input when isLoading is true', () => {
    render(
      <DateRangeInput
        isLoading
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Window'})).toBeEnabled();
  });

  it('renders error status with aria-invalid', () => {
    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        status={{message: 'Range is required', type: 'error'}}
        value={undefined}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Window'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Range is required')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <DateRangeInput
        data-testid="range-input"
        isRequired
        label="Window"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(screen.getByTestId('range-input')).toBeRequired();
  });

  it('renders optional indicator text', () => {
    render(
      <DateRangeInput
        isOptional
        label="Window"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(
      <DateRangeInput
        description="Select check-in and check-out."
        label="Window"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(
      screen.getByText('Select check-in and check-out.'),
    ).toBeInTheDocument();
  });

  it('forwards data-testid to the input', () => {
    render(
      <DateRangeInput
        data-testid="range-field"
        label="Window"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(screen.getByTestId('range-field')).toBeInTheDocument();
  });

  it('renders a calendar trigger button', () => {
    render(
      <DateRangeInput
        label="Window"
        onChange={() => {}}
        value={defaultRange}
      />,
    );

    const trigger = screen.getByRole('button', {name: 'Choose Window'});
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeEnabled();
  });
});
