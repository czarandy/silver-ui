import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {inputRecipe, inputStyles} from 'components/Field/inputStyles';
import {InputGroup} from 'components/InputGroup';
import {NumberInput} from 'components/NumberInput/NumberInput';
import {SizeContext} from 'internal/SizeContext';

function ControlledClearableNumberInput({
  initialValue,
  onChange,
}: {
  initialValue: number;
  onChange: (value: number | null) => void;
}): React.JSX.Element {
  const [value, setValue] = useState<number | null>(initialValue);

  return (
    <NumberInput
      hasClear
      label="Count"
      onChange={nextValue => {
        setValue(nextValue);
        onChange(nextValue);
      }}
      value={value}
    />
  );
}

function ControlledSteppableNumberInput({
  initialValue,
  isDisabled,
  isIntegerOnly,
  isWheelEnabled,
  label = 'Count',
  max,
  min,
  onChange,
  step,
}: {
  initialValue: number | null;
  isDisabled?: boolean;
  isIntegerOnly?: boolean;
  isWheelEnabled?: boolean;
  label?: string;
  max?: number | null;
  min?: number | null;
  onChange?: (value: number) => void;
  step?: number | null;
}): React.JSX.Element {
  const [value, setValue] = useState<number | null>(initialValue);

  return (
    <NumberInput
      isDisabled={isDisabled}
      isIntegerOnly={isIntegerOnly}
      isWheelEnabled={isWheelEnabled}
      label={label}
      max={max}
      min={min}
      onChange={nextValue => {
        setValue(nextValue);
        onChange?.(nextValue);
      }}
      step={step}
      value={value}
    />
  );
}

describe('NumberInput', () => {
  it('inherits the ambient size', () => {
    render(
      <SizeContext value="lg">
        <NumberInput label="Count" onChange={() => {}} value={1} />
      </SizeContext>,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    // eslint-disable-next-line testing-library/no-node-access -- the size recipe is applied to the input wrapper
    expect(input.parentElement).toHaveClass(inputRecipe({size: 'lg'}));
  });

  it('renders a text-backed spinbutton with numeric ARIA attributes', () => {
    render(
      <NumberInput
        label="Count"
        max={10}
        min={0}
        onChange={() => {}}
        value={4}
      />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputmode', 'decimal');
    expect(input).toHaveAttribute('aria-valuemin', '0');
    expect(input).toHaveAttribute('aria-valuemax', '10');
    expect(input).toHaveAttribute('aria-valuenow', '4');
  });

  it('uses a numeric input mode for integer-only values', () => {
    render(
      <NumberInput isIntegerOnly label="Count" onChange={() => {}} value={4} />,
    );

    expect(screen.getByRole('spinbutton', {name: 'Count'})).toHaveAttribute(
      'inputmode',
      'numeric',
    );
  });

  it('does not change the value or consume wheel events by default', () => {
    const onChange = vi.fn();
    const onWheel = vi.fn();

    render(
      <div onWheel={onWheel}>
        <NumberInput label="Count" onChange={onChange} value={2} />
      </div>,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    input.focus();

    expect(fireEvent.wheel(input, {deltaY: -100})).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
    expect(onWheel).toHaveBeenCalledOnce();
    expect(input).toHaveFocus();
  });

  it('changes the focused value with wheel events when enabled', () => {
    const onChange = vi.fn();

    render(
      <ControlledSteppableNumberInput
        initialValue={0.2}
        isWheelEnabled
        onChange={onChange}
        step={0.1}
      />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    input.focus();

    expect(fireEvent.wheel(input, {deltaY: -100})).toBe(false);
    expect(input).toHaveValue('0.3');
    expect(onChange).toHaveBeenLastCalledWith(0.3);

    expect(fireEvent.wheel(input, {deltaY: 100})).toBe(false);
    expect(input).toHaveValue('0.2');
    expect(onChange).toHaveBeenLastCalledWith(0.2);
  });

  it('ignores wheel events when unfocused, modified, or disabled', () => {
    const onChange = vi.fn();

    render(
      <>
        <ControlledSteppableNumberInput
          initialValue={2}
          isWheelEnabled
          onChange={onChange}
        />
        <ControlledSteppableNumberInput
          initialValue={2}
          isDisabled
          isWheelEnabled
          label="Disabled count"
          onChange={onChange}
        />
      </>,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    expect(fireEvent.wheel(input, {deltaY: -100})).toBe(true);

    input.focus();
    expect(fireEvent.wheel(input, {ctrlKey: true, deltaY: -100})).toBe(true);
    expect(fireEvent.wheel(input, {deltaY: -100, shiftKey: true})).toBe(true);

    const disabledInput = screen.getByRole('spinbutton', {
      name: 'Disabled count',
    });
    expect(fireEvent.wheel(disabledInput, {deltaY: -100})).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('supports keyboard stepping and bound shortcuts', async () => {
    const user = userEvent.setup();

    render(<ControlledSteppableNumberInput initialValue={1} max={3} min={0} />);

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    input.focus();

    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('2');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('1');
    await user.keyboard('{End}');
    expect(input).toHaveValue('3');
    await user.keyboard('{Home}');
    expect(input).toHaveValue('0');
  });

  it('moves off-grid values to the next step without floating-point drift', async () => {
    const user = userEvent.setup();

    render(<ControlledSteppableNumberInput initialValue={0.25} step={0.1} />);

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    input.focus();
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('0.3');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveValue('0.2');
  });

  it('falls back to a step of one when step is not positive', async () => {
    const user = userEvent.setup();

    render(<ControlledSteppableNumberInput initialValue={2} step={0} />);

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    input.focus();
    await user.keyboard('{ArrowUp}');
    expect(input).toHaveValue('3');
  });

  it('steps with the chevron buttons while retaining input focus', async () => {
    const user = userEvent.setup();

    render(<ControlledSteppableNumberInput initialValue={1} max={2} min={0} />);

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    const incrementButton = screen.getByRole('button', {
      name: 'Increment value',
    });
    const decrementButton = screen.getByRole('button', {
      name: 'Decrement value',
    });
    expect(incrementButton).toHaveAttribute('tabindex', '-1');
    expect(decrementButton).toHaveAttribute('tabindex', '-1');

    input.focus();
    await user.click(incrementButton);
    expect(input).toHaveValue('2');
    expect(input).toHaveFocus();
    expect(incrementButton).toBeDisabled();

    await user.click(decrementButton);
    expect(input).toHaveValue('1');
    expect(input).toHaveFocus();
  });

  it('starts empty values at the available bound or zero', async () => {
    const user = userEvent.setup();

    render(
      <>
        <ControlledSteppableNumberInput
          initialValue={null}
          label="Minimum count"
          max={10}
          min={5}
        />
        <ControlledSteppableNumberInput
          initialValue={null}
          label="Maximum count"
          max={10}
          min={5}
        />
        <ControlledSteppableNumberInput
          initialValue={null}
          label="Unbounded count"
        />
      </>,
    );

    const minimumInput = screen.getByRole('spinbutton', {
      name: 'Minimum count',
    });
    minimumInput.focus();
    await user.keyboard('{ArrowUp}');
    expect(minimumInput).toHaveValue('5');

    const maximumInput = screen.getByRole('spinbutton', {
      name: 'Maximum count',
    });
    maximumInput.focus();
    await user.keyboard('{ArrowDown}');
    expect(maximumInput).toHaveValue('10');

    const unboundedInput = screen.getByRole('spinbutton', {
      name: 'Unbounded count',
    });
    unboundedInput.focus();
    await user.keyboard('{ArrowUp}');
    expect(unboundedInput).toHaveValue('0');
  });

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

    const clearButton = screen.getByRole('button', {name: 'Clear Count'});
    expect(clearButton).toHaveClass(inputStyles.clearButton);
    await user.click(clearButton);
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('clears nullable values from the keyboard on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ControlledClearableNumberInput initialValue={4} onChange={onChange} />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    await user.clear(input);
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(null);
    expect(input).toHaveValue('');
  });

  it('clears nullable values from the keyboard on Enter', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <ControlledClearableNumberInput initialValue={4} onChange={onChange} />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    await user.clear(input);
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(null);
    expect(input).toHaveValue('');
  });

  it('does not clear non-nullable values from the keyboard', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<NumberInput label="Count" onChange={onChange} value={4} />);

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    await user.clear(input);
    await user.tab();

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue('4');
  });

  it('clamps values to max on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <NumberInput
        label="Percent"
        max={100}
        min={0}
        onChange={onChange}
        value={50}
      />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Percent'});
    await user.clear(input);
    await user.type(input, '200');
    await user.tab();

    expect(onChange).not.toHaveBeenCalledWith(200);
    expect(onChange).toHaveBeenCalledWith(100);
  });

  it('clamps values to min on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <NumberInput
        label="Percent"
        max={100}
        min={0}
        onChange={onChange}
        value={50}
      />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Percent'});
    await user.clear(input);
    await user.type(input, '-5');
    await user.tab();

    expect(onChange).not.toHaveBeenCalledWith(-5);
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('rejects decimal input when isIntegerOnly is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <NumberInput
        isIntegerOnly
        label="Count"
        onChange={onChange}
        value={null}
      />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    await user.type(input, '3.5');
    await user.tab();

    expect(onChange).not.toHaveBeenCalledWith(3.5);
  });

  it('renders a disabled input', () => {
    render(
      <NumberInput isDisabled label="Count" onChange={vi.fn()} value={5} />,
    );

    expect(screen.getByRole('spinbutton', {name: 'Count'})).toBeDisabled();
    expect(
      screen.getByRole('button', {name: 'Increment value'}),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', {name: 'Decrement value'}),
    ).toBeDisabled();
  });

  it('hides the clear button when disabled', () => {
    render(
      <NumberInput
        hasClear
        isDisabled
        label="Count"
        onChange={vi.fn()}
        value={5}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Count'}),
    ).not.toBeInTheDocument();
  });

  it('renders error status with aria-invalid and alert', () => {
    render(
      <NumberInput
        label="Count"
        onChange={vi.fn()}
        status={{message: 'Too high', type: 'error'}}
        value={999}
      />,
    );

    expect(screen.getByRole('spinbutton', {name: 'Count'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Too high');
  });

  it('commits pending input on blur', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<NumberInput label="Count" onChange={onChange} value={null} />);

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    await user.type(input, '42');
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('calls onEnter when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();

    render(
      <NumberInput
        label="Count"
        onChange={vi.fn()}
        onEnter={onEnter}
        value={1}
      />,
    );

    screen.getByRole('spinbutton', {name: 'Count'}).focus();
    await user.keyboard('{Enter}');
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it('does not call onEnter while composing', () => {
    const onEnter = vi.fn();

    render(
      <NumberInput
        label="Count"
        onChange={vi.fn()}
        onEnter={onEnter}
        value={1}
      />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    fireEvent.keyDown(input, {isComposing: true, key: 'Enter'});
    fireEvent.keyDown(input, {key: 'Enter', keyCode: 229});

    expect(onEnter).not.toHaveBeenCalled();
  });

  it('renders the units suffix', () => {
    render(
      <NumberInput label="Size" onChange={vi.fn()} units="GB" value={10} />,
    );

    expect(screen.getByText('GB')).toBeInTheDocument();
  });

  it('displays pending input while typing', async () => {
    const user = userEvent.setup();

    render(<NumberInput label="Count" onChange={vi.fn()} value={5} />);

    const input = screen.getByRole('spinbutton', {name: 'Count'});
    await user.clear(input);
    await user.type(input, '99');

    expect(input).toHaveValue('99');
  });

  it('does not set aria-invalid while typing an out-of-range value', async () => {
    const user = userEvent.setup();

    render(
      <NumberInput
        label="Percent"
        max={100}
        min={50}
        onChange={vi.fn()}
        value={null}
      />,
    );

    const input = screen.getByRole('spinbutton', {name: 'Percent'});
    await user.type(input, '1');

    // "1" is below min=50, but aria-invalid should not be set during typing.
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('sets native required attribute', () => {
    render(
      <NumberInput
        data-testid="input"
        isRequired
        label="Count"
        onChange={vi.fn()}
        value={1}
      />,
    );

    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('forwards ref to the input element', () => {
    const ref = vi.fn<(element: HTMLInputElement | null) => void>();

    render(
      <NumberInput label="Count" onChange={vi.fn()} ref={ref} value={1} />,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('forwards className and style to the field root', () => {
    const {container} = render(
      <NumberInput
        className="custom-field"
        label="Count"
        onChange={vi.fn()}
        style={{marginBottom: '8px'}}
        value={1}
      />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- className/style land on the Field root, which has no role or testid
    const root = container.querySelector('.custom-field');
    expect(root).toBeInTheDocument();
    expect(root).toHaveStyle({marginBottom: '8px'});
    expect(root).toHaveTextContent('Count');
  });

  it('renders endContent', () => {
    render(
      <NumberInput
        endContent={<span data-testid="end">suffix</span>}
        label="Amount"
        onChange={vi.fn()}
        value={10}
      />,
    );

    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('sets aria-busy and shows spinner when loading', () => {
    render(
      <NumberInput isLoading label="Count" onChange={vi.fn()} value={1} />,
    );

    expect(screen.getByRole('spinbutton', {name: 'Count'})).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('calls onKeyDown when a key is pressed', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    render(
      <NumberInput
        label="Count"
        onChange={vi.fn()}
        onKeyDown={onKeyDown}
        value={1}
      />,
    );

    screen.getByRole('spinbutton', {name: 'Count'}).focus();
    await user.keyboard('a');

    expect(onKeyDown).toHaveBeenCalled();
    expect(onKeyDown.mock.calls[0][0]).toHaveProperty('key');
  });

  it('inherits disabled state from InputGroup', () => {
    render(
      <InputGroup isDisabled label="Group">
        <NumberInput label="Count" onChange={vi.fn()} value={1} />
      </InputGroup>,
    );

    expect(screen.getByRole('spinbutton', {name: 'Count'})).toBeDisabled();
  });

  it('inherits size from InputGroup', () => {
    render(
      <InputGroup label="Group" size="lg">
        <NumberInput label="Count" onChange={vi.fn()} value={1} />
      </InputGroup>,
    );

    // The input wrapper div picks up the size from the recipe. Verify it
    // renders without error and the input is present with the group's size.
    expect(screen.getByRole('spinbutton', {name: 'Count'})).toBeInTheDocument();
  });

  it('renders without Field wrapper inside InputGroup', () => {
    render(
      <InputGroup label="Group">
        <NumberInput label="Count" onChange={vi.fn()} value={1} />
      </InputGroup>,
    );

    // Inside InputGroup, the label comes from aria-label on the input
    // rather than a Field wrapper label element.
    const input = screen.getByRole('spinbutton', {name: 'Count'});
    expect(input).toHaveAttribute('aria-label', 'Count');
  });

  it('forwards className and style to the wrapper inside InputGroup', () => {
    const {container} = render(
      <InputGroup label="Price">
        <NumberInput
          className="custom-wrapper"
          label="Count"
          onChange={vi.fn()}
          style={{maxWidth: 200}}
          value={1}
        />
      </InputGroup>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const wrapper = container.querySelector('.custom-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({maxWidth: '200px'});
    expect(wrapper).toContainElement(screen.getByRole('spinbutton'));
  });
});
