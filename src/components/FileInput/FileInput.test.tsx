import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {FileInput} from './FileInput';

describe('FileInput', () => {
  it('calls onChange when a file is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const file = new File(['hello'], 'hello.txt', {type: 'text/plain'});

    render(<FileInput label="Upload" onChange={onChange} value={null} />);

    await user.upload(screen.getByLabelText('Upload'), file);
    expect(onChange).toHaveBeenCalledWith(file);
  });
});
