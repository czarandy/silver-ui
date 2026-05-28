import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {DateRangeInput} from './DateRangeInput';

describe('DateRangeInput', () => {
  it('renders a formatted range and clears it', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <DateRangeInput
        hasClear
        label="Window"
        onChange={onChange}
        value={{start: '2026-05-10', end: '2026-05-12'}}
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Window'})).toHaveValue(
      'May 10, 2026 - May 12, 2026',
    );
    await user.click(screen.getByRole('button', {name: 'Clear Window'}));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
