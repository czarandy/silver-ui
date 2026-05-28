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
        value="2026-05-21T09:00"
      />,
    );

    fireEvent.change(screen.getByLabelText('Meeting time'), {
      target: {value: '10:30'},
    });
    expect(onChange).toHaveBeenLastCalledWith('2026-05-21T10:30');
  });
});
