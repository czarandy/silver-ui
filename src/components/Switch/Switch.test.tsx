import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Switch} from './Switch';

describe('Switch', () => {
  it('calls onChange with the next checked value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Switch isSelected={false} label="Notifications" onChange={onChange} />,
    );

    await user.click(screen.getByRole('switch', {name: 'Notifications'}));
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('renders controlled checked state', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const [isSelected, setIsSelected] = useState(false);
      return (
        <Switch
          isSelected={isSelected}
          label="Notifications"
          onChange={setIsSelected}
        />
      );
    }

    render(<Fixture />);
    await user.click(screen.getByRole('switch', {name: 'Notifications'}));
    expect(screen.getByRole('switch', {name: 'Notifications'})).toBeChecked();
  });

  it('applies disabled and loading states', () => {
    render(
      <Switch
        isDisabled
        isLoading
        isSelected
        label="Notifications"
        onChange={() => {}}
      />,
    );

    expect(screen.getByRole('switch', {name: 'Notifications'})).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Loading');
  });
});
