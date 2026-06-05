import {Temporal} from '@js-temporal/polyfill';
import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {TimeInput} from './TimeInput';

const T = (s: string) => Temporal.PlainTime.from(s);

describe('TimeInput', () => {
  it('calls onChange with PlainTime values', () => {
    const onChange = vi.fn();

    render(
      <TimeInput label="Start time" onChange={onChange} value={T('09:00')} />,
    );

    fireEvent.change(screen.getByLabelText('Start time'), {
      target: {value: '10:30'},
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({hour: 10, minute: 30}),
    );
  });

  it('calls onChange with undefined when input is cleared', () => {
    const onChange = vi.fn();

    render(
      <TimeInput label="Start time" onChange={onChange} value={T('09:00')} />,
    );

    fireEvent.change(screen.getByLabelText('Start time'), {
      target: {value: ''},
    });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it('renders with hasSeconds and includes seconds in value', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        hasSeconds
        label="Time"
        onChange={onChange}
        value={T('14:30:45')}
      />,
    );

    const input = screen.getByLabelText('Time');
    expect(input).toHaveValue('14:30:45');
    expect(input).toHaveAttribute('step', '1');
  });

  it('uses step=60 when hasSeconds is false', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Time" onChange={onChange} value={T('14:30')} />);

    expect(screen.getByLabelText('Time')).toHaveAttribute('step', '60');
  });

  it('uses custom step when provided', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        label="Time"
        onChange={onChange}
        step={900}
        value={T('12:00')}
      />,
    );

    expect(screen.getByLabelText('Time')).toHaveAttribute('step', '900');
  });

  it('renders a clear button when hasClear is true and value is set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TimeInput
        hasClear
        label="Time"
        onChange={onChange}
        value={T('09:00')}
      />,
    );

    const clearButton = screen.getByRole('button', {name: 'Clear Time'});
    expect(clearButton).toBeInTheDocument();

    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('does not render a clear button when value is undefined', () => {
    const onChange = vi.fn();

    render(
      <TimeInput hasClear label="Time" onChange={onChange} value={undefined} />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Time'}),
    ).not.toBeInTheDocument();
  });

  it('does not render a clear button when disabled', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        hasClear
        isDisabled
        label="Time"
        onChange={onChange}
        value={T('09:00')}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Time'}),
    ).not.toBeInTheDocument();
  });

  it('sets min and max attributes on the input', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        label="Time"
        max={T('17:00')}
        min={T('08:00')}
        onChange={onChange}
        value={T('12:00')}
      />,
    );

    const input = screen.getByLabelText('Time');
    expect(input).toHaveAttribute('min', '08:00');
    expect(input).toHaveAttribute('max', '17:00');
  });

  it('disables the input when isDisabled is true', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        isDisabled
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    expect(screen.getByLabelText('Time')).toBeDisabled();
  });

  it('sets aria-busy when isLoading is true', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        isLoading
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    expect(screen.getByLabelText('Time')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders a spinner when isLoading is true', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        isLoading
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();
  });

  it('sets aria-invalid when status is error', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        label="Time"
        onChange={onChange}
        status={{type: 'error', message: 'Invalid time'}}
        value={T('23:00')}
      />,
    );

    expect(screen.getByLabelText('Time')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid time');
  });

  it('does not set aria-invalid for warning status', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        label="Time"
        onChange={onChange}
        status={{type: 'warning', message: 'Outside office hours'}}
        value={T('22:00')}
      />,
    );

    expect(screen.getByLabelText('Time')).not.toHaveAttribute('aria-invalid');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Outside office hours',
    );
  });

  it('renders description with aria-describedby', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        description="Use 24-hour format"
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    const input = screen.getByLabelText('Time');
    const describedById = input.getAttribute('aria-describedby');
    expect(describedById).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access, @typescript-eslint/no-non-null-assertion -- verifying aria-describedby target content
    expect(document.getElementById(describedById!)).toHaveTextContent(
      'Use 24-hour format',
    );
  });

  it('hides the label visually when isLabelHidden is true', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        isLabelHidden
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    // The label should still be accessible (the input is labelable)
    expect(screen.getByLabelText('Time')).toBeInTheDocument();
  });

  it('forwards ref to the input element', () => {
    const onChange = vi.fn();
    const ref = vi.fn<(el: HTMLInputElement | null) => void>();

    render(
      <TimeInput
        label="Time"
        onChange={onChange}
        ref={ref}
        value={undefined}
      />,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('renders the "Optional" indicator when isOptional is true', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        isOptional
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('renders the "Required" indicator and aria-required', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        isRequired
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByLabelText(/Time/)).toBeRequired();
  });

  it('applies placeholder text', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        label="Time"
        onChange={onChange}
        placeholder="HH:MM"
        value={undefined}
      />,
    );

    expect(screen.getByLabelText('Time')).toHaveAttribute(
      'placeholder',
      'HH:MM',
    );
  });

  it('applies the default placeholder', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Time" onChange={onChange} value={undefined} />);

    expect(screen.getByLabelText('Time')).toHaveAttribute(
      'placeholder',
      'Select a time',
    );
  });

  it('applies data-testid to the input', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        data-testid="my-time"
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    expect(screen.getByTestId('my-time')).toBeInTheDocument();
    expect(screen.getByTestId('my-time').tagName).toBe('INPUT');
  });

  it('applies htmlName to the input', () => {
    const onChange = vi.fn();

    render(
      <TimeInput
        htmlName="start_time"
        label="Time"
        onChange={onChange}
        value={undefined}
      />,
    );

    expect(screen.getByLabelText('Time')).toHaveAttribute('name', 'start_time');
  });

  it('renders input type="time"', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Time" onChange={onChange} value={undefined} />);

    expect(screen.getByLabelText('Time')).toHaveAttribute('type', 'time');
  });

  it('calls onBlur when the input loses focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onBlur = vi.fn();

    render(
      <TimeInput
        label="Time"
        onBlur={onBlur}
        onChange={onChange}
        value={undefined}
      />,
    );

    const input = screen.getByLabelText('Time');
    await user.click(input);
    await user.tab();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('calls onFocus when the input gains focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onFocus = vi.fn();

    render(
      <TimeInput
        label="Time"
        onChange={onChange}
        onFocus={onFocus}
        value={undefined}
      />,
    );

    await user.click(screen.getByLabelText('Time'));
    expect(onFocus).toHaveBeenCalledOnce();
  });
});
