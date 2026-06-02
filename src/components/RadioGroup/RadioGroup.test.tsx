import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {RadioGroup} from './RadioGroup';
import {RadioGroupItem} from './RadioGroupItem';

describe('RadioGroup', () => {
  it('calls onChange with the selected item value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <RadioGroup
        label="Notification preference"
        onChange={onChange}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem label="SMS" value="sms" />
      </RadioGroup>,
    );

    await user.click(screen.getByRole('radio', {name: 'SMS'}));

    expect(onChange).toHaveBeenCalledWith('sms');
  });

  it('renders controlled checked state', async () => {
    const user = userEvent.setup();

    function Example(): React.JSX.Element {
      const [value, setValue] = useState('email');
      return (
        <RadioGroup
          label="Notification preference"
          onChange={setValue}
          value={value}>
          <RadioGroupItem label="Email" value="email" />
          <RadioGroupItem label="SMS" value="sms" />
        </RadioGroup>
      );
    }

    render(<Example />);

    await user.click(screen.getByRole('radio', {name: 'SMS'}));

    expect(screen.getByRole('radio', {name: 'Email'})).not.toBeChecked();
    expect(screen.getByRole('radio', {name: 'SMS'})).toBeChecked();
  });

  it('applies disabled state from the group', () => {
    render(
      <RadioGroup
        isDisabled
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', {name: 'Email'})).toBeDisabled();
  });

  it('disables a single item independently', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem label="Email" value="email" />
        <RadioGroupItem isDisabled label="SMS" value="sms" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radio', {name: 'Email'})).toBeEnabled();
    expect(screen.getByRole('radio', {name: 'SMS'})).toBeDisabled();
  });

  it('sets aria-invalid and renders error message', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        status={{type: 'error', message: 'Selection required'}}
        value="">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    const group = screen.getByRole('radiogroup');
    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('sets aria-required on the radiogroup and inputs', () => {
    render(
      <RadioGroup
        isRequired
        label="Notification preference"
        onChange={() => {}}
        value="">
        <RadioGroupItem label="Email" value="email" />
      </RadioGroup>,
    );

    expect(screen.getByRole('radiogroup')).toBeRequired();
    expect(screen.getByRole('radio', {name: 'Email'})).toBeRequired();
  });

  it('renders item description with aria-describedby', () => {
    render(
      <RadioGroup
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioGroupItem
          description="We will send to your primary address"
          label="Email"
          value="email"
        />
      </RadioGroup>,
    );

    expect(
      screen.getByText('We will send to your primary address'),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', {name: 'Email'})).toHaveAttribute(
      'aria-describedby',
    );
  });

  it('throws when RadioGroupItem is used outside RadioGroup', () => {
    expect(() =>
      render(<RadioGroupItem label="Orphan" value="orphan" />),
    ).toThrow('RadioGroupItem must be used within a RadioGroup');
  });
});
