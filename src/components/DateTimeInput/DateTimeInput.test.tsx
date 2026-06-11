import {Temporal} from '@js-temporal/polyfill';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {DateTimeInput} from './DateTimeInput';

describe('DateTimeInput', () => {
  it('updates the time portion', () => {
    const onChange = vi.fn();

    render(
      <DateTimeInput
        label="Meeting"
        onChange={onChange}
        value={Temporal.PlainDateTime.from('2026-05-21T09:00')}
      />,
    );

    fireEvent.change(screen.getByLabelText('Meeting time'), {
      target: {value: '10:30'},
    });
    expect(onChange).toHaveBeenLastCalledWith(
      Temporal.PlainDateTime.from('2026-05-21T10:30'),
    );
  });

  it('auto-fills current time when only date is set', () => {
    const onChange = vi.fn();

    render(<DateTimeInput label="Meeting" onChange={onChange} value={null} />);

    fireEvent.change(screen.getByLabelText('Meeting date'), {
      target: {value: '2026-06-15'},
    });

    const result = onChange.mock.calls[0][0] as Temporal.PlainDateTime;
    expect(result).toBeDefined();
    expect(result.year).toBe(2026);
    expect(result.month).toBe(6);
    expect(result.day).toBe(15);
  });

  it('auto-fills today when only time is set', () => {
    const onChange = vi.fn();
    const today = Temporal.Now.plainDateISO();

    render(<DateTimeInput label="Meeting" onChange={onChange} value={null} />);

    fireEvent.change(screen.getByLabelText('Meeting time'), {
      target: {value: '14:30'},
    });

    const result = onChange.mock.calls[0][0] as Temporal.PlainDateTime;
    expect(result).toBeDefined();
    expect(result.year).toBe(today.year);
    expect(result.month).toBe(today.month);
    expect(result.day).toBe(today.day);
    expect(result.hour).toBe(14);
    expect(result.minute).toBe(30);
  });

  it('disables both inputs when isDisabled is true', () => {
    render(
      <DateTimeInput
        isDisabled
        label="Meeting"
        onChange={() => {}}
        value={null}
      />,
    );

    expect(screen.getByLabelText('Meeting date')).toBeDisabled();
    expect(screen.getByLabelText('Meeting time')).toBeDisabled();
  });

  it('renders error status with aria-invalid', () => {
    render(
      <DateTimeInput
        label="Meeting"
        onChange={() => {}}
        status={{message: 'Invalid date-time', type: 'error'}}
        value={null}
      />,
    );

    expect(screen.getByText('Invalid date-time')).toBeInTheDocument();
  });

  it('associates the field label with the date input', () => {
    render(<DateTimeInput label="Meeting" onChange={() => {}} value={null} />);

    const dateInput = screen.getByLabelText('Meeting date');
    const dateInputId = dateInput.getAttribute('id');
    expect(dateInputId).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByText('Meeting').closest('label')).toHaveAttribute(
      'for',
      dateInputId,
    );
  });

  it('forwards ref to the date input', () => {
    const ref = vi.fn<(el: HTMLInputElement | null) => void>();

    render(
      <DateTimeInput
        label="Meeting"
        onChange={() => {}}
        ref={ref}
        value={null}
      />,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('clamps time to min when date matches the min date', () => {
    const onChange = vi.fn();

    render(
      <DateTimeInput
        label="Meeting"
        min={Temporal.PlainDateTime.from('2026-05-01T08:00')}
        onChange={onChange}
        value={Temporal.PlainDateTime.from('2026-05-01T06:00')}
      />,
    );

    const timeInput = screen.getByLabelText('Meeting time');
    expect(timeInput).toHaveAttribute('min', '08:00');
  });

  it('clamps time to max when date matches the max date', () => {
    const onChange = vi.fn();

    render(
      <DateTimeInput
        label="Meeting"
        max={Temporal.PlainDateTime.from('2026-05-31T18:00')}
        onChange={onChange}
        value={Temporal.PlainDateTime.from('2026-05-31T12:00')}
      />,
    );

    const timeInput = screen.getByLabelText('Meeting time');
    expect(timeInput).toHaveAttribute('max', '18:00');
  });

  it('does not apply time constraints when date differs from min/max date', () => {
    render(
      <DateTimeInput
        label="Meeting"
        max={Temporal.PlainDateTime.from('2026-05-31T18:00')}
        min={Temporal.PlainDateTime.from('2026-05-01T08:00')}
        onChange={() => {}}
        value={Temporal.PlainDateTime.from('2026-05-15T12:00')}
      />,
    );

    const timeInput = screen.getByLabelText('Meeting time');
    expect(timeInput).toHaveAttribute('min', '');
    expect(timeInput).toHaveAttribute('max', '');
  });

  it('clamps the existing time when the date changes to the min boundary', () => {
    const onChange = vi.fn();

    render(
      <DateTimeInput
        label="Meeting"
        min={Temporal.PlainDateTime.from('2026-05-01T08:00')}
        onChange={onChange}
        value={Temporal.PlainDateTime.from('2026-05-15T06:00')}
      />,
    );

    fireEvent.change(screen.getByLabelText('Meeting date'), {
      target: {value: '2026-05-01'},
    });

    const result = onChange.mock.calls[0][0] as Temporal.PlainDateTime;
    expect(result.toPlainDate().toString()).toBe('2026-05-01');
    expect(result.hour).toBe(8);
    expect(result.minute).toBe(0);
  });
});
