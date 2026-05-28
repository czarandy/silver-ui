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

    function Example() {
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
});
