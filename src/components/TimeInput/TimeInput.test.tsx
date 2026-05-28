import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {TimeInput} from './TimeInput';

describe('TimeInput', () => {
  it('calls onChange with ISO time values', () => {
    const onChange = vi.fn();

    render(<TimeInput label="Start time" onChange={onChange} value="09:00" />);

    fireEvent.change(screen.getByLabelText('Start time'), {
      target: {value: '10:30'},
    });
    expect(onChange).toHaveBeenLastCalledWith('10:30');
  });
});
