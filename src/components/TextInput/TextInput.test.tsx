import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {TextInput} from './TextInput';

describe('TextInput', () => {
  it('calls onChange with text values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextInput label="Name" onChange={onChange} value="" />);

    await user.type(screen.getByRole('textbox', {name: 'Name'}), 'A');
    expect(onChange).toHaveBeenCalledWith('A', expect.anything());
  });

  it('clears values when hasClear is set', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<TextInput hasClear label="Name" onChange={onChange} value="Ada" />);

    await user.click(screen.getByRole('button', {name: 'Clear Name'}));
    expect(onChange).toHaveBeenCalledWith('', null);
  });
});
