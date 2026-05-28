import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {NumberInput} from './NumberInput';

describe('NumberInput', () => {
  it('calls onChange with valid numbers', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<NumberInput label="Count" onChange={onChange} value={1} />);

    await user.clear(screen.getByRole('spinbutton', {name: 'Count'}));
    await user.type(screen.getByRole('spinbutton', {name: 'Count'}), '2');
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('supports clearing nullable values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <NumberInput hasClear label="Count" onChange={onChange} value={4} />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Count'}));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
