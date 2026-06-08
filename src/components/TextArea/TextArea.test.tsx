import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MessageSquare, type LucideProps} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {TextArea} from './TextArea';

function MessageIcon(props: LucideProps): React.JSX.Element {
  return <MessageSquare {...props} data-testid="message-icon" />;
}

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

  it('sets the native maxlength attribute', () => {
    render(
      <TextArea label="Notes" maxLength={10} onChange={() => {}} value="" />,
    );

    expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveAttribute(
      'maxlength',
      '10',
    );
  });

  it('calls onFocus and onBlur', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(
      <TextArea
        label="Notes"
        onBlur={onBlur}
        onChange={() => {}}
        onFocus={onFocus}
        value=""
      />,
    );

    await user.click(screen.getByRole('textbox', {name: 'Notes'}));
    expect(onFocus).toHaveBeenCalledOnce();

    await user.tab();
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('calls onPaste', async () => {
    const user = userEvent.setup();
    const onPaste = vi.fn();

    render(
      <TextArea label="Notes" onChange={() => {}} onPaste={onPaste} value="" />,
    );

    await user.click(screen.getByRole('textbox', {name: 'Notes'}));
    await user.paste('pasted text');
    expect(onPaste).toHaveBeenCalledOnce();
  });

  it('renders placeholder text', () => {
    render(
      <TextArea
        label="Notes"
        onChange={() => {}}
        placeholder="Add notes"
        value=""
      />,
    );

    expect(screen.getByPlaceholderText('Add notes')).toBeInTheDocument();
  });

  it('applies the rows prop', () => {
    render(<TextArea label="Notes" onChange={() => {}} rows={8} value="" />);

    expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveAttribute(
      'rows',
      '8',
    );
  });

  it('sets aria-busy when loading', () => {
    render(<TextArea isLoading label="Notes" onChange={() => {}} value="" />);

    expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('renders a start icon', () => {
    render(
      <TextArea
        label="Notes"
        onChange={() => {}}
        startIcon={MessageIcon}
        value=""
      />,
    );

    expect(screen.getByTestId('message-icon')).toBeInTheDocument();
  });

  it('disables spellcheck when hasSpellCheck is false', () => {
    render(
      <TextArea
        hasSpellCheck={false}
        label="Notes"
        onChange={() => {}}
        value=""
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveAttribute(
      'spellcheck',
      'false',
    );
  });
});
