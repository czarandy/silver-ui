import {Temporal} from '@js-temporal/polyfill';
import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {TimeInput} from './TimeInput';

describe('TimeInput', () => {
  it('calls onChange with PlainTime values', () => {
    const onChange = vi.fn();
    const value = Temporal.PlainTime.from('09:00');

    render(<TimeInput label="Start time" onChange={onChange} value={value} />);

    fireEvent.change(screen.getByLabelText('Start time'), {
      target: {value: '10:30'},
    });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({hour: 10, minute: 30}),
    );
  });

  it('calls onChange with undefined when cleared', () => {
    const onChange = vi.fn();
    const value = Temporal.PlainTime.from('09:00');

    render(<TimeInput label="Start time" onChange={onChange} value={value} />);

    fireEvent.change(screen.getByLabelText('Start time'), {
      target: {value: ''},
    });
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
