import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {plainDateCreate} from '../../internal/plainDate';
import {DateInput} from './DateInput';

describe('DateInput', () => {
  it('renders a formatted date and clears it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateInput
        hasClear
        label="Due date"
        onChange={onChange}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Due date'})).toHaveValue(
      'May 21, 2026',
    );
    await user.click(screen.getByRole('button', {name: 'Clear Due date'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('renders the default placeholder when no value is set', () => {
    render(
      <DateInput label="Due date" onChange={() => {}} value={undefined} />,
    );

    expect(screen.getByRole('textbox', {name: 'Due date'})).toHaveAttribute(
      'placeholder',
      'Select a date',
    );
  });

  it('renders a calendar trigger button', () => {
    render(
      <DateInput
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    const trigger = screen.getByRole('button', {name: 'Choose Due date'});
    expect(trigger).toBeInTheDocument();
    expect(trigger).toBeEnabled();
  });

  it('disables the calendar trigger when disabled', () => {
    render(
      <DateInput
        isDisabled
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(
      screen.getByRole('button', {name: 'Choose Due date'}),
    ).toBeDisabled();
  });

  it('disables the input and hides the clear button when disabled', () => {
    render(
      <DateInput
        hasClear
        isDisabled
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Due date'})).toBeDisabled();
    expect(
      screen.queryByRole('button', {name: 'Clear Due date'}),
    ).not.toBeInTheDocument();
  });

  it('hides the clear button when isLoading is true', () => {
    render(
      <DateInput
        hasClear
        isLoading
        label="Due date"
        onChange={() => {}}
        value={plainDateCreate(2026, 5, 21)}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Due date'}),
    ).not.toBeInTheDocument();
  });

  it('renders error status with aria-invalid', () => {
    render(
      <DateInput
        label="Due date"
        onChange={() => {}}
        status={{message: 'Date is required', type: 'error'}}
        value={undefined}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Due date'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Date is required')).toBeInTheDocument();
  });

  it('sets aria-required when isRequired is true', () => {
    render(
      <DateInput
        data-testid="date-field"
        isRequired
        label="Due date"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(screen.getByTestId('date-field')).toBeRequired();
  });

  it('renders optional indicator text', () => {
    render(
      <DateInput
        isOptional
        label="Due date"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('visually hides the label when isLabelHidden is true', () => {
    render(
      <DateInput
        isLabelHidden
        label="Due date"
        onChange={() => {}}
        value={undefined}
      />,
    );

    const label = screen.getByText('Due date');
    expect(label).toBeInTheDocument();
  });

  it('forwards data-testid to the input', () => {
    render(
      <DateInput
        data-testid="date-field"
        label="Due date"
        onChange={() => {}}
        value={undefined}
      />,
    );

    expect(screen.getByTestId('date-field')).toBeInTheDocument();
  });
});
