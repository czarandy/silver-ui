import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {RadioList} from './RadioList';
import {RadioListItem} from './RadioListItem';

describe('RadioList', () => {
  it('calls onChange with the selected item value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <RadioList
        label="Notification preference"
        onChange={onChange}
        value="email">
        <RadioListItem label="Email" value="email" />
        <RadioListItem label="SMS" value="sms" />
      </RadioList>,
    );

    await user.click(screen.getByRole('radio', {name: 'SMS'}));

    expect(onChange).toHaveBeenCalledWith('sms');
  });

  it('renders controlled checked state', async () => {
    const user = userEvent.setup();

    function Example() {
      const [value, setValue] = useState('email');
      return (
        <RadioList
          label="Notification preference"
          onChange={setValue}
          value={value}>
          <RadioListItem label="Email" value="email" />
          <RadioListItem label="SMS" value="sms" />
        </RadioList>
      );
    }

    render(<Example />);

    await user.click(screen.getByRole('radio', {name: 'SMS'}));

    expect(screen.getByRole('radio', {name: 'Email'})).not.toBeChecked();
    expect(screen.getByRole('radio', {name: 'SMS'})).toBeChecked();
  });

  it('applies disabled state from the group', () => {
    render(
      <RadioList
        isDisabled
        label="Notification preference"
        onChange={() => {}}
        value="email">
        <RadioListItem label="Email" value="email" />
      </RadioList>,
    );

    expect(screen.getByRole('radio', {name: 'Email'})).toBeDisabled();
  });
});
