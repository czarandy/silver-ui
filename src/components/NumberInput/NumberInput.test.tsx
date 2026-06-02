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

  it('rejects values outside min/max on blur', async () => {
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
});
