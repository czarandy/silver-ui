import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {LockKeyhole} from 'lucide-react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {getNecessity} from 'components/Field';
import {inputRecipe, type InputVariants} from 'components/Field/inputStyles';
import {InputGroup} from 'components/InputGroup';
import {InputGroupText} from 'components/InputGroup/InputGroupText';
import {PinInput, type PinInputProps} from 'components/PinInput/PinInput';
import {pinInputRecipe} from 'components/PinInput/PinInput.recipe';
import {css} from 'styled-system/css';

const noop = () => {};

// Mirrors the css() merge PinInput uses for its wrapper: the recipe's slot
// overrides replace the conflicting inputRecipe utilities, so the raw
// inputRecipe class list is not a subset of the rendered classes.
function getWrapperClassName(variants: InputVariants = {}): string {
  return css(
    inputRecipe.raw(variants),
    pinInputRecipe.raw({size: variants.size ?? 'md'}).wrapper,
  );
}

function getCells(label = 'Digit'): HTMLInputElement[] {
  return screen.getAllByLabelText(new RegExp(`^${label} \\d+ of \\d+$`));
}

type ControlledPinInputProps = Omit<
  PinInputProps,
  'isOptional' | 'isRequired' | 'onChange' | 'value'
> & {
  initialValue?: string;
  isOptional?: boolean;
  isRequired?: boolean;
  onChange?: PinInputProps['onChange'];
};

function ControlledPinInput({
  initialValue = '',
  isOptional,
  isRequired,
  onChange,
  ...props
}: ControlledPinInputProps): React.JSX.Element {
  const [value, setValue] = useState(initialValue);
  return (
    <PinInput
      {...props}
      {...getNecessity(isOptional, isRequired)}
      onChange={(nextValue, event) => {
        onChange?.(nextValue, event);
        setValue(nextValue);
      }}
      value={value}
    />
  );
}

describe('PinInput', () => {
  it('renders six cells by default and supports a custom length', () => {
    const {rerender} = render(
      <PinInput label="Code" onChange={noop} value="" />,
    );

    expect(getCells()).toHaveLength(6);

    rerender(<PinInput label="Code" length={4} onChange={noop} value="" />);
    expect(getCells()).toHaveLength(4);
  });

  it.each([0, -1, 1.5, Number.POSITIVE_INFINITY, Number.NaN])(
    'rejects invalid length %s in development',
    length => {
      expect(() =>
        render(
          <PinInput label="Code" length={length} onChange={noop} value="" />,
        ),
      ).toThrow(`PinInput: length must be a positive integer, received`);
    },
  );

  it('types as a controlled value, passes native events, and auto-advances', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<PinInputProps['onChange']>();
    render(<ControlledPinInput label="Code" onChange={onChange} />);
    const cells = getCells();

    await user.click(cells[0]);
    await user.keyboard('12');

    expect(onChange).toHaveBeenNthCalledWith(1, '1', expect.any(Object));
    expect(onChange).toHaveBeenNthCalledWith(2, '12', expect.any(Object));
    expect(cells.map(cell => cell.value)).toEqual(['1', '2', '', '', '', '']);
    expect(cells[2]).toHaveFocus();
  });

  it('replaces a filled cell and selects its character on focus', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<PinInputProps['onChange']>();
    render(
      <ControlledPinInput
        initialValue="123"
        label="Code"
        onChange={onChange}
      />,
    );
    const cells = getCells();

    await user.click(cells[1]);
    expect(cells[1].selectionStart).toBe(0);
    expect(cells[1].selectionEnd).toBe(1);
    fireEvent.change(cells[1], {target: {value: '9'}});

    expect(onChange).toHaveBeenCalledWith('193', expect.any(Object));
    expect(cells[2]).toHaveFocus();
  });

  it('redirects focus from a cell past the first empty one', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<PinInputProps['onChange']>();
    render(
      <ControlledPinInput initialValue="12" label="Code" onChange={onChange} />,
    );
    const cells = getCells();

    await user.click(cells[5]);
    expect(cells[2]).toHaveFocus();

    await user.keyboard('3');
    expect(onChange).toHaveBeenCalledWith('123', expect.any(Object));
  });

  it('keeps focus on a clicked cell when the code is complete', async () => {
    const user = userEvent.setup();
    render(
      <ControlledPinInput initialValue="123456" label="Code" onChange={noop} />,
    );
    const cells = getCells();

    await user.click(cells[5]);
    expect(cells[5]).toHaveFocus();
  });

  it('distributes a multi-character native change', () => {
    const onChange = vi.fn<PinInputProps['onChange']>();
    render(<ControlledPinInput label="Code" onChange={onChange} />);
    const cells = getCells();

    fireEvent.change(cells[0], {target: {value: '123'}});

    expect(onChange).toHaveBeenCalledWith('123', expect.any(Object));
    expect(cells.map(cell => cell.value).slice(0, 3)).toEqual(['1', '2', '3']);
    expect(cells[3]).toHaveFocus();
  });

  it('accepts one-time-code autofill without truncation', () => {
    const onComplete = vi.fn();
    render(<ControlledPinInput label="Code" onComplete={onComplete} />);
    const cells = getCells();

    // A maxLength would make the browser truncate the inserted SMS code to a
    // single character before the change event fires.
    for (const cell of cells) {
      expect(cell).not.toHaveAttribute('maxlength');
    }

    fireEvent.change(cells[0], {target: {value: '123456'}});

    expect(cells.map(cell => cell.value)).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('123456');
  });

  it('keeps only the typed character when typing over a filled cell without a selection', () => {
    const onChange = vi.fn<PinInputProps['onChange']>();
    render(
      <ControlledPinInput
        initialValue="123"
        label="Code"
        onChange={onChange}
      />,
    );
    const cells = getCells();

    // Caret sits after the existing character: the browser appends.
    fireEvent.change(cells[1], {target: {value: '29'}});
    expect(onChange).toHaveBeenLastCalledWith('193', expect.any(Object));
    expect(cells[2]).toHaveFocus();

    // Caret sits before the existing character: the browser prepends.
    fireEvent.change(cells[2], {target: {value: '83'}});
    expect(onChange).toHaveBeenLastCalledWith('198', expect.any(Object));
  });

  it('rejects non-ASCII digits in numeric mode', () => {
    const onChange = vi.fn<PinInputProps['onChange']>();
    render(<PinInput label="Code" onChange={onChange} value="" />);

    fireEvent.change(getCells()[0], {target: {value: 'a-٣'}});

    expect(onChange).not.toHaveBeenCalled();
  });

  it('accepts ASCII letters and digits while preserving case in alphanumeric mode', () => {
    const onChange = vi.fn<PinInputProps['onChange']>();
    render(
      <ControlledPinInput
        label="Code"
        onChange={onChange}
        type="alphanumeric"
      />,
    );

    fireEvent.change(getCells('Character')[0], {target: {value: 'aB9-'}});

    expect(onChange).toHaveBeenCalledWith('aB9', expect.any(Object));
    expect(
      getCells('Character')
        .slice(0, 3)
        .map(cell => cell.value),
    ).toEqual(['a', 'B', '9']);
  });

  describe('keyboard navigation', () => {
    it('exposes a single tab stop so Tab leaves the group', async () => {
      const user = userEvent.setup();
      render(
        <>
          <ControlledPinInput initialValue="12" label="Code" />
          <button type="button">after</button>
        </>,
      );
      const cells = getCells();

      expect(cells.map(cell => cell.tabIndex)).toEqual([-1, -1, 0, -1, -1, -1]);

      await user.click(cells[2]);
      await user.tab();

      expect(screen.getByRole('button', {name: 'after'})).toHaveFocus();
    });

    it('moves between reachable cells with arrow keys and Home/End', async () => {
      const user = userEvent.setup();
      render(<ControlledPinInput initialValue="12" label="Code" />);
      const cells = getCells();

      await user.click(cells[2]);
      await user.keyboard('{ArrowLeft}');
      expect(cells[1]).toHaveFocus();

      await user.keyboard('{Home}');
      expect(cells[0]).toHaveFocus();

      await user.keyboard('{End}');
      expect(cells[2]).toHaveFocus();

      // The first empty cell is the last reachable one; focus does not loop.
      await user.keyboard('{ArrowRight}');
      expect(cells[2]).toHaveFocus();
    });
  });

  it('fires onFocus and onBlur only at the group boundary', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    const onFocus = vi.fn();
    render(
      <>
        <ControlledPinInput
          initialValue="12"
          label="Code"
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <button type="button">after</button>
      </>,
    );
    const cells = getCells();

    await user.click(cells[0]);
    expect(onFocus).toHaveBeenCalledTimes(1);

    await user.click(cells[2]);
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).not.toHaveBeenCalled();

    await user.tab();
    expect(screen.getByRole('button', {name: 'after'})).toHaveFocus();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  describe('Backspace', () => {
    it('clears a filled cell in place so retyping corrects that digit', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<PinInputProps['onChange']>();
      render(
        <ControlledPinInput
          initialValue="123"
          label="Code"
          onChange={onChange}
        />,
      );
      const cells = getCells();
      cells[2].focus();

      await user.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith('12', null);
      expect(cells[2]).toHaveFocus();

      await user.keyboard('9');

      expect(onChange).toHaveBeenLastCalledWith('129', expect.any(Object));
      expect(cells.map(cell => cell.value).slice(0, 3)).toEqual([
        '1',
        '2',
        '9',
      ]);
    });

    it('clears the previous cell when the current cell is empty', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<PinInputProps['onChange']>();
      render(
        <ControlledPinInput
          initialValue="123"
          label="Code"
          onChange={onChange}
        />,
      );
      const cells = getCells();
      cells[3].focus();

      await user.keyboard('{Backspace}');

      expect(onChange).toHaveBeenCalledWith('12', null);
      expect(cells[2]).toHaveFocus();
    });

    it('stays at the first-cell boundary', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<PinInputProps['onChange']>();
      render(
        <ControlledPinInput
          initialValue="1"
          label="Code"
          onChange={onChange}
        />,
      );
      const firstCell = getCells()[0];
      firstCell.focus();

      await user.keyboard('{Backspace}{Backspace}');

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('', null);
      expect(firstCell).toHaveFocus();
    });

    it('does not delete during composition or for key code 229', () => {
      const onChange = vi.fn<PinInputProps['onChange']>();
      render(<PinInput label="Code" onChange={onChange} value="12" />);
      const cells = getCells();

      fireEvent.keyDown(cells[1], {isComposing: true, key: 'Backspace'});
      fireEvent.keyDown(cells[1], {key: 'Backspace', keyCode: 229});

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('paste', () => {
    it('filters, distributes, completes once, and focuses the final cell', () => {
      const onChange = vi.fn<PinInputProps['onChange']>();
      const onComplete = vi.fn();
      render(
        <ControlledPinInput
          initialValue="12"
          label="Code"
          onChange={onChange}
          onComplete={onComplete}
        />,
      );
      const cells = getCells();

      fireEvent.paste(cells[2], {
        clipboardData: {getData: () => '3a4-56789'},
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('123456', null);
      expect(onComplete).toHaveBeenCalledWith('123456');
      expect(cells[5]).toHaveFocus();
    });

    it('replaces from a middle cell without completing an already complete code', () => {
      const onChange = vi.fn<PinInputProps['onChange']>();
      const onComplete = vi.fn();
      render(
        <ControlledPinInput
          initialValue="ABCDEF"
          label="Code"
          onChange={onChange}
          onComplete={onComplete}
          type="alphanumeric"
        />,
      );
      const cells = getCells('Character');

      fireEvent.paste(cells[2], {
        clipboardData: {getData: () => '9z!'},
      });

      expect(onChange).toHaveBeenCalledExactlyOnceWith('AB9zEF', null);
      expect(onComplete).not.toHaveBeenCalled();
      expect(cells[5]).toHaveFocus();
    });
  });

  describe('completion', () => {
    it('calls onComplete after onChange when typing completes the code', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn<PinInputProps['onChange']>();
      const onComplete = vi.fn();
      render(
        <ControlledPinInput
          initialValue="123"
          label="Code"
          length={4}
          onChange={onChange}
          onComplete={onComplete}
        />,
      );

      await user.click(getCells()[3]);
      await user.keyboard('4');

      expect(onComplete).toHaveBeenCalledWith('1234');
      expect(onChange.mock.invocationCallOrder[0]).toBeLessThan(
        onComplete.mock.invocationCallOrder[0],
      );
    });

    it('completes once when the parent does not echo onChange synchronously', () => {
      const onComplete = vi.fn();
      // A static value simulates a parent that debounces or transitions its
      // onChange echo: displayedValue stays stale across commits.
      render(
        <PinInput
          label="Code"
          onChange={noop}
          onComplete={onComplete}
          value="12345"
        />,
      );
      const cells = getCells();

      fireEvent.change(cells[5], {target: {value: '6'}});
      fireEvent.change(cells[5], {target: {value: '7'}});

      expect(onComplete).toHaveBeenCalledExactlyOnceWith('123456');
    });

    it('does not complete on mount, an incomplete edit, or complete replacement', () => {
      const onComplete = vi.fn();
      const {rerender} = render(
        <PinInput
          label="Code"
          length={4}
          onChange={noop}
          onComplete={onComplete}
          value="1234"
        />,
      );

      expect(onComplete).not.toHaveBeenCalled();
      fireEvent.change(getCells()[1], {target: {value: '9'}});
      expect(onComplete).not.toHaveBeenCalled();

      rerender(
        <PinInput
          label="Code"
          length={4}
          onChange={noop}
          onComplete={onComplete}
          value="12"
        />,
      );
      fireEvent.change(getCells()[1], {target: {value: '8'}});
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  it('uses password inputs when hasMask is true', () => {
    render(<PinInput hasMask label="PIN" onChange={noop} value="12" />);

    for (const cell of getCells()) {
      expect(cell).toHaveAttribute('type', 'password');
    }
  });

  it('autofocuses the first empty cell or the final cell when complete', () => {
    const {rerender} = render(
      <PinInput hasAutoFocus label="Code" onChange={noop} value="12" />,
    );
    expect(getCells()[2]).toHaveFocus();

    rerender(
      <PinInput
        hasAutoFocus
        key="complete"
        label="Code"
        onChange={noop}
        value="123456"
      />,
    );
    expect(getCells()[5]).toHaveFocus();
  });

  describe('forms', () => {
    it('submits exactly one joined value and caps incoming content', () => {
      const {container} = render(
        <form data-testid="form">
          <PinInput
            htmlName="otp"
            label="Code"
            length={4}
            onChange={noop}
            value="123456"
          />
        </form>,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- exact hidden input count is the form-submission contract
      expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(
        1,
      );
      for (const cell of getCells()) {
        expect(cell).not.toHaveAttribute('name');
      }
      expect(
        Array.from(new FormData(screen.getByTestId('form')).entries()),
      ).toEqual([['otp', '1234']]);
    });

    it('omits a disabled value and applies disabled and required to every cell', () => {
      const {rerender} = render(
        <form data-testid="form">
          <PinInput
            htmlName="otp"
            isDisabled
            label="Code"
            onChange={noop}
            value="123"
          />
        </form>,
      );

      expect(
        Array.from(new FormData(screen.getByTestId('form')).entries()),
      ).toEqual([]);
      for (const cell of getCells()) {
        expect(cell).toBeDisabled();
      }

      rerender(<PinInput isRequired label="Code" onChange={noop} value="" />);
      for (const cell of getCells()) {
        // Necessity is announced per cell via aria-required only; native
        // required would anchor constraint-validation bubbles to unnamed
        // one-character cells while the hidden input submits the value.
        // eslint-disable-next-line jest-dom-ya/prefer-required -- asserts the native attribute specifically; toBeRequired also matches the aria-required the cell must keep
        expect(cell).not.toHaveAttribute('required');
        expect(cell).toHaveAttribute('aria-required', 'true');
      }
    });
  });

  describe('field accessibility', () => {
    it('names the group and cells and links description and error status', () => {
      render(
        <PinInput
          description="Sent to your phone"
          label="Verification code"
          onChange={noop}
          status={{message: 'Incorrect code', type: 'error'}}
          value=""
        />,
      );

      const group = screen.getByRole('group', {name: 'Verification code'});
      expect(group).toHaveAccessibleDescription(
        'Sent to your phone Incorrect code',
      );
      // aria-invalid is unsupported on role=group; the focusable cells carry
      // it so screen readers announce the error state on focus.
      expect(group).not.toHaveAttribute('aria-invalid');
      for (const cell of getCells()) {
        expect(cell).toHaveAttribute('aria-invalid', 'true');
      }
      expect(screen.getByLabelText('Digit 1 of 6')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toHaveTextContent('Incorrect code');
    });

    it('supports hidden labels, label metadata, and necessity indicators', () => {
      render(
        <PinInput
          isLabelHidden
          isRequired
          label="Secure code"
          labelIcon={LockKeyhole}
          labelTooltip="Use the code from your authenticator"
          onChange={noop}
          value=""
        />,
      );

      expect(
        screen.getByRole('group', {name: /^Secure codeRequired/}),
      ).toBeInTheDocument();
      expect(screen.getByText('Required')).toBeInTheDocument();
      expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
        'Use the code from your authenticator',
      );
    });

    it('places className, style, data-testid, and ref on the intended elements', () => {
      const ref = vi.fn<(element: HTMLDivElement | null) => void>();
      const {container} = render(
        <PinInput
          className="custom-field"
          data-testid="pin"
          label="Code"
          onChange={noop}
          ref={ref}
          style={{maxWidth: 300}}
          value=""
        />,
      );

      const wrapper = screen.getByTestId('pin');
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- verifying Field-root prop placement
      const field = container.querySelector('.custom-field');
      expect(field).toHaveStyle({maxWidth: '300px'});
      expect(field).toHaveClass(css(pinInputRecipe.raw({size: 'md'}).root));
      expect(field).toContainElement(wrapper);
      expect(wrapper).not.toHaveClass('custom-field');
      expect(ref).toHaveBeenCalledWith(field);
    });

    it.each(['sm', 'md', 'lg'] as const)(
      'applies shared and cell recipe classes for size %s',
      size => {
        render(
          <PinInput
            data-testid="pin"
            label="Code"
            onChange={noop}
            size={size}
            value=""
          />,
        );

        expect(screen.getByTestId('pin')).toHaveClass(
          getWrapperClassName({size}),
        );
        expect(getCells()[0]).toHaveClass(pinInputRecipe({size}).cell ?? '');
      },
    );

    it('applies local status and disabled recipe classes', () => {
      render(
        <PinInput
          data-testid="pin"
          isDisabled
          label="Code"
          onChange={noop}
          status={{type: 'warning'}}
          value=""
        />,
      );

      expect(screen.getByTestId('pin')).toHaveClass(
        getWrapperClassName({isDisabled: true, status: 'warning'}),
      );
    });
  });

  describe('inside an InputGroup', () => {
    it('renders a directly nested, independently named wrapper', () => {
      render(
        <InputGroup label="Authentication">
          <InputGroupText>OTP</InputGroupText>
          <PinInput
            data-testid="pin"
            label="Verification code"
            onChange={noop}
            value=""
          />
        </InputGroup>,
      );

      const group = screen.getByRole('group', {name: 'Authentication'});
      const pin = screen.getByRole('group', {name: 'Verification code'});
      expect(pin).toHaveAttribute('aria-label', 'Verification code');
      // eslint-disable-next-line testing-library/no-node-access -- direct-child structure is the InputGroup contract
      expect(Array.from(group.children)).toContain(pin);
      expect(pin).toBe(screen.getByTestId('pin'));
    });

    it('inherits disabled state and group size over the component size', () => {
      render(
        <InputGroup isDisabled label="Authentication" size="lg">
          <PinInput
            data-testid="pin"
            label="Code"
            onChange={noop}
            size="sm"
            value=""
          />
        </InputGroup>,
      );

      expect(screen.getByTestId('pin')).toHaveClass(
        getWrapperClassName({size: 'lg', isDisabled: true}),
      );
      expect(getCells()[0]).toHaveClass(
        pinInputRecipe({size: 'lg'}).cell ?? '',
      );
      for (const cell of getCells()) {
        expect(cell).toBeDisabled();
      }
    });

    it('inherits visual status without local invalid state or icon', () => {
      render(
        <InputGroup
          label="Authentication"
          status={{message: 'Group error', type: 'error'}}>
          <PinInput data-testid="pin" label="Code" onChange={noop} value="" />
        </InputGroup>,
      );

      const pin = screen.getByTestId('pin');
      expect(pin).toHaveClass(getWrapperClassName({status: 'error'}));
      expect(pin).not.toHaveAttribute('aria-invalid');
      for (const cell of getCells()) {
        expect(cell).not.toHaveAttribute('aria-invalid');
      }
      // eslint-disable-next-line testing-library/no-node-access -- a group-inherited status must not add a child icon
      expect(pin.querySelector('svg')).toBeNull();
    });

    it('forwards className, style, and ref to the bare wrapper', () => {
      const ref = vi.fn<(element: HTMLDivElement | null) => void>();
      render(
        <InputGroup label="Authentication">
          <PinInput
            className="custom-wrapper"
            label="Code"
            onChange={noop}
            ref={ref}
            style={{maxWidth: 250}}
            value=""
          />
        </InputGroup>,
      );

      const pin = screen.getByRole('group', {name: 'Code'});
      expect(pin).toHaveClass('custom-wrapper');
      expect(pin).toHaveClass(getWrapperClassName({size: 'md'}));
      expect(pin).toHaveStyle({maxWidth: '250px'});
      expect(ref).toHaveBeenCalledWith(pin);
    });
  });
});
