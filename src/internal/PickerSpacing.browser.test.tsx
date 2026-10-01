import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it} from 'vitest';
import {DateInput} from 'components/DateInput';
import {DateRangeInput} from 'components/DateRangeInput';
import {TimeInput} from 'components/TimeInput';

describe('Picker popover spacing', () => {
  it.each(['time', 'date', 'range'] as const)(
    'separates the %s popover from the field border',
    async kind => {
      const user = userEvent.setup();
      render(
        kind === 'time' ? (
          <TimeInput label="Value" onChange={() => {}} value={null} />
        ) : kind === 'date' ? (
          <DateInput label="Value" onChange={() => {}} value={null} />
        ) : (
          <DateRangeInput label="Value" onChange={() => {}} value={null} />
        ),
      );
      const input = screen.getByLabelText('Value');
      // The field's border wrapper has no semantic role; measure its real layout.
      // eslint-disable-next-line testing-library/no-node-access
      const field = input.parentElement;
      expect(field).toBeInTheDocument();
      await user.click(
        kind === 'range'
          ? input
          : screen.getByRole('button', {name: 'Choose Value'}),
      );
      const dialog = screen.getByRole('dialog', {name: 'Choose Value'});
      await waitFor(() => {
        const gap =
          dialog.getBoundingClientRect().top -
          (field?.getBoundingClientRect().bottom ?? 0);
        expect(gap).toBeCloseTo(kind === 'range' ? 8 : 4, 0);
      });
    },
  );
});
