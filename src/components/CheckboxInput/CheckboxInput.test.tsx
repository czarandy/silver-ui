import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxInput} from './CheckboxInput';

describe('CheckboxInput', () => {
  it('calls onChange with checked state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CheckboxInput label="Accept" onChange={onChange} value={false} />);

    await user.click(screen.getByRole('checkbox', {name: 'Accept'}));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('supports indeterminate state', () => {
    render(
      <CheckboxInput label="Mixed" onChange={() => {}} value="indeterminate" />,
    );

    expect(screen.getByRole('checkbox', {name: 'Mixed'})).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });

  it('disables the input when isDisabled is true', () => {
    const onChange = vi.fn();

    render(
      <CheckboxInput
        isDisabled
        label="Accept"
        onChange={onChange}
        value={false}
      />,
    );

    expect(screen.getByRole('checkbox', {name: 'Accept'})).toBeDisabled();
  });

  it('does not block changes when isLoading is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CheckboxInput
        isLoading
        label="Accept"
        onChange={onChange}
        value={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {name: 'Accept'});
    expect(checkbox).toBeEnabled();
    expect(checkbox).toHaveAttribute('aria-busy', 'true');

    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('blocks changes when isReadOnly is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CheckboxInput
        isReadOnly
        label="Accept"
        onChange={onChange}
        value={false}
      />,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Accept'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('sets aria-invalid and renders error message', () => {
    render(
      <CheckboxInput
        label="Accept"
        onChange={() => {}}
        status={{message: 'Required field', type: 'error'}}
        value={false}
      />,
    );

    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('renders description with aria-describedby', () => {
    render(
      <CheckboxInput
        description="We will send updates"
        label="Subscribe"
        onChange={() => {}}
        value={false}
      />,
    );

    expect(screen.getByText('We will send updates')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby');
  });

  it('forwards ref to the input element', () => {
    const ref = vi.fn<(el: HTMLInputElement | null) => void>();

    render(
      <CheckboxInput
        label="Accept"
        onChange={() => {}}
        ref={ref}
        value={false}
      />,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });
});
