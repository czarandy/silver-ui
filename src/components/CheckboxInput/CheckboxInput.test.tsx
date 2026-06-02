import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxInput} from './CheckboxInput';

describe('CheckboxInput', () => {
  it('calls onChange with checked state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CheckboxInput label="Accept" onChange={onChange} value={false} />);

    await user.click(screen.getByRole('checkbox', {name: 'Accept'}));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('supports indeterminate state', () => {
    render(
      <CheckboxInput label="Mixed" onChange={() => {}} value="indeterminate" />,
    );

    expect(screen.getByRole('checkbox', {name: 'Mixed'})).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });
});
