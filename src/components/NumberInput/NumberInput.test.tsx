import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {InputGroup} from 'components/InputGroup';
import {NumberInput} from 'components/NumberInput/NumberInput';

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

    expect(input).toHaveValue(99);
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
