import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {PasswordInput} from './PasswordInput';

describe('PasswordInput', () => {
  const noop = () => {};

  it('renders as a password input by default', () => {
    render(<PasswordInput label="Password" onChange={noop} value="" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'type',
      'password',
    );
  });

  it('toggles visibility when the show/hide button is clicked', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" onChange={noop} value="secret" />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', {name: 'Show password'}));
    expect(input).toHaveAttribute('type', 'text');

    await user.click(screen.getByRole('button', {name: 'Hide password'}));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('calls onChange with typed values', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PasswordInput label="Password" onChange={onChange} value="" />);

    await user.type(screen.getByLabelText('Password'), 'a');
    expect(onChange).toHaveBeenCalledWith('a', expect.anything());
  });

  it('disables the toggle button when the input is disabled', () => {
    render(
      <PasswordInput isDisabled label="Password" onChange={noop} value="" />,
    );
    expect(screen.getByRole('button', {name: 'Show password'})).toBeDisabled();
  });

  it('forwards ref to the input element', () => {
    const ref = vi.fn<(el: HTMLInputElement | null) => void>();
    render(
      <PasswordInput label="Password" onChange={noop} ref={ref} value="" />,
    );
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('renders error status with aria-invalid', () => {
    render(
      <PasswordInput
        label="Password"
        onChange={noop}
        status={{message: 'Password is required', type: 'error'}}
        value=""
      />,
    );

    expect(screen.getByLabelText('Password')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('toggles via keyboard', async () => {
    const user = userEvent.setup();
    render(<PasswordInput label="Password" onChange={noop} value="secret" />);

    const input = screen.getByLabelText('Password');
    const toggle = screen.getByRole('button', {name: 'Show password'});

    await user.tab();
    await user.tab();
    expect(toggle).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(input).toHaveAttribute('type', 'text');

    await user.keyboard(' ');
    expect(input).toHaveAttribute('type', 'password');
  });
});
