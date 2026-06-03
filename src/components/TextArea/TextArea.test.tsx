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

  it('sets aria-invalid when over the character limit', () => {
    render(
      <TextArea
        label="Notes"
        maxLength={5}
        onChange={() => {}}
        value="Too long text"
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('disables the textarea when isDisabled is true', () => {
    render(<TextArea isDisabled label="Notes" onChange={() => {}} value="" />);

    expect(screen.getByRole('textbox', {name: 'Notes'})).toBeDisabled();
  });

  it('sets aria-invalid for error status', () => {
    render(
      <TextArea
        label="Notes"
        onChange={() => {}}
        status={{message: 'Required', type: 'error'}}
        value=""
      />,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders description with aria-describedby', () => {
    render(
      <TextArea
        description="Markdown supported"
        label="Notes"
        onChange={() => {}}
        value=""
      />,
    );

    expect(screen.getByText('Markdown supported')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby');
  });

  it('sets aria-required when isRequired is true', () => {
    render(<TextArea isRequired label="Notes" onChange={() => {}} value="" />);

    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('forwards ref to the textarea element', () => {
    const ref = vi.fn<(el: HTMLTextAreaElement | null) => void>();

    render(<TextArea label="Notes" onChange={() => {}} ref={ref} value="" />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLTextAreaElement));
  });
});
