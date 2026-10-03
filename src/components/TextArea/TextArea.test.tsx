import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MessageSquare, type LucideProps} from 'lucide-react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {inputRecipe, inputStyles} from 'components/Field/inputStyles';
import {TextArea} from 'components/TextArea/TextArea';
import {SizeContext} from 'internal/SizeContext';
import {assertNonNull, createResizeObserverStub} from 'internal/testHelpers';

function MessageIcon(props: LucideProps): React.JSX.Element {
  return <MessageSquare {...props} data-testid="message-icon" />;
}

describe('TextArea', () => {
  it.each([
    'on',
    'off',
    'street-address',
    'section-home shipping street-address',
  ])('forwards autoComplete=%s unchanged', autoComplete => {
    render(
      <TextArea
        autoComplete={autoComplete}
        label="Address"
        onChange={() => {}}
        value=""
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Address'})).toHaveAttribute(
      'autocomplete',
      autoComplete,
    );
  });

  it('omits autocomplete when no hint is supplied and removes a previous hint', () => {
    const {rerender} = render(
      <TextArea label="Notes" onChange={() => {}} value="" />,
    );
    expect(screen.getByRole('textbox')).not.toHaveAttribute('autocomplete');

    rerender(
      <TextArea
        autoComplete="off"
        label="Notes"
        onChange={() => {}}
        value=""
      />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('autocomplete', 'off');

    rerender(<TextArea label="Notes" onChange={() => {}} value="" />);
    expect(screen.getByRole('textbox')).not.toHaveAttribute('autocomplete');
  });

  it.each([
    {isDisabled: false, isReadOnly: false},
    {isDisabled: true, isReadOnly: false},
    {isDisabled: false, isReadOnly: true},
  ])(
    'preserves editing and form behavior with autocomplete and %o',
    async props => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <form aria-label="Delivery">
          <TextArea
            {...props}
            autoComplete="street-address"
            htmlName="address"
            label="Address"
            onChange={onChange}
            value="123 Main St"
          />
        </form>,
      );
      const textarea = screen.getByRole('textbox', {name: 'Address'});
      expect(textarea).toHaveAttribute('autocomplete', 'street-address');
      await user.type(textarea, 'A');
      const expectedCall = ['123 Main StA', expect.anything()];
      expect(onChange.mock.calls).toEqual(
        props.isDisabled || props.isReadOnly ? [] : [expectedCall],
      );
      expect(
        new FormData(screen.getByRole<HTMLFormElement>('form')).get('address'),
      ).toBe(props.isDisabled ? null : '123 Main St');
    },
  );

  it('inherits the ambient size', () => {
    render(
      <SizeContext value="lg">
        <TextArea label="Notes" onChange={() => {}} value="" />
      </SizeContext>,
    );

    const textarea = screen.getByRole('textbox', {name: 'Notes'});
    // eslint-disable-next-line testing-library/no-node-access -- the size recipe is applied to the textarea wrapper
    expect(textarea.parentElement).toHaveClass(inputRecipe({size: 'lg'}));
  });

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

  it('uses the default cursor when read-only', () => {
    render(
      <TextArea isReadOnly label="Notes" onChange={() => {}} value="Text" />,
    );

    const cursorClass = assertNonNull(
      inputStyles.control
        .split(' ')
        .find(className => className.includes('cursor_default')),
    );
    expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveClass(
      cursorClass,
    );
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

  describe('auto-grow', () => {
    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    function mockTextareaSize({
      scrollHeight,
      width = () => 300,
    }: {
      scrollHeight: () => number;
      width?: () => number;
    }): void {
      vi.spyOn(
        HTMLTextAreaElement.prototype,
        'scrollHeight',
        'get',
      ).mockImplementation(scrollHeight);
      vi.spyOn(
        HTMLTextAreaElement.prototype,
        'clientWidth',
        'get',
      ).mockImplementation(width);
    }

    it('leaves a fixed-rows textarea resizable and unsized', () => {
      render(<TextArea label="Notes" onChange={() => {}} value="" />);

      const textarea = screen.getByRole('textbox', {name: 'Notes'});
      expect(textarea).toHaveAttribute('rows', '3');
      expect(textarea).not.toHaveAttribute('style');
    });

    it('sizes to its content and starts at minRows', () => {
      mockTextareaSize({scrollHeight: () => 120});
      render(
        <TextArea label="Notes" minRows={2} onChange={() => {}} value="Long" />,
      );

      const textarea = screen.getByRole('textbox', {name: 'Notes'});
      expect(textarea).toHaveAttribute('rows', '2');
      // jsdom has no computed line height, so rows are 24px each.
      expect(textarea).toHaveStyle({height: '120px'});
      expect(textarea).toHaveStyle({overflowY: 'hidden'});
    });

    it('never shrinks below minRows', () => {
      mockTextareaSize({scrollHeight: () => 10});
      render(
        <TextArea label="Notes" minRows={4} onChange={() => {}} value="" />,
      );

      expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveStyle({
        height: '96px',
      });
    });

    it('turns on auto-grow with only maxRows, defaulting to three rows', () => {
      mockTextareaSize({scrollHeight: () => 10});
      render(
        <TextArea label="Notes" maxRows={6} onChange={() => {}} value="" />,
      );

      const textarea = screen.getByRole('textbox', {name: 'Notes'});
      expect(textarea).toHaveAttribute('rows', '3');
      expect(textarea).toHaveStyle({height: '72px'});
    });

    it('stops at maxRows and scrolls the rest', () => {
      mockTextareaSize({scrollHeight: () => 500});
      render(
        <TextArea
          label="Notes"
          maxRows={5}
          minRows={2}
          onChange={() => {}}
          value="Long"
        />,
      );

      const textarea = screen.getByRole('textbox', {name: 'Notes'});
      expect(textarea).toHaveStyle({height: '120px'});
      expect(textarea).toHaveStyle({overflowY: 'auto'});
    });

    it('re-measures when the value changes', () => {
      let scrollHeight = 72;
      mockTextareaSize({scrollHeight: () => scrollHeight});
      const {rerender} = render(
        <TextArea label="Notes" minRows={3} onChange={() => {}} value="" />,
      );
      const textarea = screen.getByRole('textbox', {name: 'Notes'});
      expect(textarea).toHaveStyle({height: '72px'});

      scrollHeight = 240;
      rerender(
        <TextArea
          label="Notes"
          minRows={3}
          onChange={() => {}}
          value="Pasted note"
        />,
      );

      expect(textarea).toHaveStyle({height: '240px'});
    });

    it('re-measures when its width changes', () => {
      const stub = createResizeObserverStub();
      vi.stubGlobal('ResizeObserver', stub.ResizeObserverStub);
      let scrollHeight = 72;
      let width = 300;
      mockTextareaSize({scrollHeight: () => scrollHeight, width: () => width});
      render(
        <TextArea label="Notes" minRows={3} onChange={() => {}} value="Note" />,
      );
      const textarea = screen.getByRole('textbox', {name: 'Notes'});

      // A height-only resize (the hook setting the height) is ignored.
      scrollHeight = 240;
      act(() => stub.resize(textarea));
      expect(textarea).toHaveStyle({height: '72px'});

      width = 150;
      act(() => stub.resize(textarea));
      expect(textarea).toHaveStyle({height: '240px'});
      stub.reset();
    });

    it('rejects rows combined with minRows or maxRows', () => {
      render(
        // @ts-expect-error -- rows is fixed-height; minRows turns on auto-grow
        <TextArea
          label="Notes"
          minRows={2}
          onChange={() => {}}
          rows={4}
          value=""
        />,
      );

      expect(screen.getByRole('textbox', {name: 'Notes'})).toHaveAttribute(
        'rows',
        '2',
      );
    });
  });

  it('renders labelEnd without changing the accessible name', () => {
    render(
      <TextArea
        label="Notes"
        labelEnd={<a href="#help">Formatting help</a>}
        onChange={() => {}}
        value=""
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Notes'})).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: 'Formatting help'}),
    ).toBeInTheDocument();
  });
});
