import {Temporal} from '@js-temporal/polyfill';
import {act, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it} from 'vitest';
import {TimeInput} from 'components/TimeInput/TimeInput';

function Example(): React.JSX.Element {
  const [value, setValue] = useState<Temporal.PlainTime | null>(
    Temporal.PlainTime.from('09:00'),
  );
  return (
    <TimeInput label="Start" onChange={setValue} step={900} value={value} />
  );
}

// Native popover focus restoration can synchronously focus its trigger during
// hidePopover(). Exercise this in Chromium to catch competing tooltip layers.
describe('TimeInput native popover', () => {
  it('focuses the selected hour and restores the trigger on Escape without committing', async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole('button', {name: 'Choose Start'});
    await user.click(trigger);
    const hours = within(screen.getByRole('listbox', {name: 'Hours'}));
    await waitFor(() =>
      expect(hours.getByRole('option', {selected: true})).toHaveFocus(),
    );
    const minutes = within(screen.getByRole('listbox', {name: 'Minutes'}));
    await user.click(minutes.getByRole('option', {name: '15'}));
    await user.keyboard('{ArrowDown}');
    expect(minutes.getByRole('option', {selected: true})).toHaveTextContent(
      '30',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.getByLabelText<HTMLInputElement>('Start').value).toBe(
      '09:00',
    );
    await act(async () => {
      await new Promise(resolve => requestAnimationFrame(resolve));
    });
    await user.click(trigger);
    expect(
      within(screen.getByRole('listbox', {name: 'Minutes'})).getByRole(
        'option',
        {selected: true},
      ),
    ).toHaveTextContent('00');
    await user.click(screen.getByRole('button', {name: 'Done'}));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(
      screen.queryByRole('listbox', {name: 'Hours'}),
    ).not.toBeInTheDocument();
  });
});
