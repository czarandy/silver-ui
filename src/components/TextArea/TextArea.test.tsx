import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {TextArea} from './TextArea';

describe('TextArea', () => {
  it('calls onChange and renders a character counter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TextArea label="Notes" maxLength={10} onChange={onChange} value="" />,
    );

    await user.type(screen.getByRole('textbox', {name: 'Notes'}), 'A');
    expect(onChange).toHaveBeenCalledWith('A', expect.anything());
    expect(screen.getByText('0/10')).toBeInTheDocument();
  });
});
