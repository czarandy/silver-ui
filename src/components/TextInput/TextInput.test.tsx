import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Search} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {TextInput} from './TextInput';

describe('TextInput', () => {
  const noop = () => {};

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

  it('renders a disabled input', () => {
    render(<TextInput isDisabled label="Name" onChange={noop} value="" />);

    expect(screen.getByRole('textbox', {name: 'Name'})).toBeDisabled();
  });

  it('sets aria-invalid when status is error', () => {
    render(
      <TextInput
        label="Email"
        onChange={noop}
        status={{message: 'Invalid', type: 'error'}}
        value=""
      />,
    );

    expect(screen.getByRole('textbox', {name: 'Email'})).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid');
  });

  it('links description to input via aria-describedby', () => {
    render(
      <TextInput
        description="Enter your full name"
        label="Name"
        onChange={noop}
        value=""
      />,
    );

    const input = screen.getByRole('textbox', {name: 'Name'});
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(screen.getByText('Enter your full name')).toHaveAttribute(
      'id',
      describedBy,
    );
  });

  it('calls onEnter when Enter is pressed', async () => {
    const user = userEvent.setup();
    const onEnter = vi.fn();

    render(
      <TextInput label="Search" onChange={noop} onEnter={onEnter} value="" />,
    );

    screen.getByRole('textbox', {name: 'Search'}).focus();
    await user.keyboard('{Enter}');
    expect(onEnter).toHaveBeenCalledOnce();
  });

  it('forwards onKeyDown events', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    render(
      <TextInput
        label="Input"
        onChange={noop}
        onKeyDown={onKeyDown}
        value=""
      />,
    );

    screen.getByRole('textbox', {name: 'Input'}).focus();
    await user.keyboard('a');
    expect(onKeyDown).toHaveBeenCalled();
  });

  it('sets aria-busy when loading', () => {
    render(<TextInput isLoading label="Search" onChange={noop} value="" />);

    expect(screen.getByRole('textbox', {name: 'Search'})).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });

  it('forwards ref to the input element', () => {
    const ref = vi.fn<(element: HTMLInputElement | null) => void>();

    render(<TextInput label="Name" onChange={noop} ref={ref} value="" />);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('applies the type prop', () => {
    render(
      <TextInput
        data-testid="input"
        label="Password"
        onChange={noop}
        type="password"
        value=""
      />,
    );

    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');
  });

  it('renders placeholder text', () => {
    render(
      <TextInput
        label="Name"
        onChange={noop}
        placeholder="John Doe"
        value=""
      />,
    );

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
  });

  it('does not show clear button when value is empty', () => {
    render(<TextInput hasClear label="Name" onChange={noop} value="" />);

    expect(
      screen.queryByRole('button', {name: 'Clear Name'}),
    ).not.toBeInTheDocument();
  });

  it('does not show clear button when disabled', () => {
    render(
      <TextInput
        hasClear
        isDisabled
        label="Name"
        onChange={noop}
        value="Ada"
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Name'}),
    ).not.toBeInTheDocument();
  });

  it('renders a start icon', () => {
    render(
      <TextInput
        data-testid="input"
        label="Search"
        onChange={noop}
        startIcon={Search}
        value=""
      />,
    );

    // eslint-disable-next-line testing-library/no-node-access -- verifying decorative svg in wrapper
    expect(
      screen.getByTestId('input').parentElement?.querySelector('svg'),
    ).toBeInTheDocument();
  });

  it('renders endContent', () => {
    render(
      <TextInput
        endContent={<span data-testid="end">suffix</span>}
        label="Amount"
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByTestId('end')).toBeInTheDocument();
  });

  it('sets native required attribute', () => {
    render(
      <TextInput
        data-testid="input"
        isRequired
        label="Name"
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('applies data-testid to the input', () => {
    render(
      <TextInput
        data-testid="my-input"
        label="Name"
        onChange={noop}
        value=""
      />,
    );

    expect(screen.getByTestId('my-input')).toBeInTheDocument();
  });
});
