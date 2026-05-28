import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
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
        value="2026-05-21"
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Due date'})).toHaveValue(
      'May 21, 2026',
    );
    await user.click(screen.getByRole('button', {name: 'Clear Due date'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
