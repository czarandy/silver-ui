import {act, render, screen, waitFor, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it} from 'vitest';
import {Button} from 'components/Button';
import {TimeInput} from 'components/TimeInput/TimeInput';
import {Temporal} from 'internal/temporal';

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
  it('focuses the selected hour and restores the trigger on Escape keeping the selection', async () => {
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
    expect(screen.getByLabelText<HTMLInputElement>('Start').value).toBe(
      '09:30',
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(screen.getByLabelText<HTMLInputElement>('Start').value).toBe(
      '09:30',
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
    ).toHaveTextContent('30');
    await user.click(screen.getByRole('button', {name: 'Done'}));
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(
      screen.queryByRole('listbox', {name: 'Hours'}),
    ).not.toBeInTheDocument();
  });
});

describe('TimeInput selected option styling', () => {
  it.each(['light', 'dark'])(
    'matches primary button hover colors in %s mode',
    async theme => {
      document.documentElement.dataset.theme = theme;
      try {
        render(
          <>
            <Example />
            <Button label="Primary reference" variant="primary" />
          </>,
        );
        const reference = screen.getByRole('button', {
          name: 'Primary reference',
        });
        // Panda's data-hover selector applies the same styles as pointer hover.
        reference.setAttribute('data-hover', '');
        await Promise.all(
          reference.getAnimations().map(async animation => animation.finished),
        );
        const expectedBackground = getComputedStyle(reference).backgroundColor;
        const expectedColor = getComputedStyle(reference).color;
        const user = userEvent.setup();
        await user.click(screen.getByRole('button', {name: 'Choose Start'}));
        const selected = within(
          screen.getByRole('listbox', {name: 'Minutes'}),
        ).getByRole('option', {selected: true});
        selected.setAttribute('data-hover', '');
        expect(getComputedStyle(selected).backgroundColor).toBe(
          expectedBackground,
        );
        expect(getComputedStyle(selected).color).toBe(expectedColor);
      } finally {
        delete document.documentElement.dataset.theme;
      }
    },
  );
});
