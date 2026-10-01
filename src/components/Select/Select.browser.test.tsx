import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {MultiSelect} from 'components/MultiSelect';
import {Select} from 'components/Select/Select';
import {Tooltip} from 'components/Tooltip';

// jsdom applies no stylesheet, so only a real browser can show that a disabled
// option still receives the pointer and that its tooltip opens on hover.
describe('disabled option tooltips', () => {
  it('shows a Select option tooltip on hover without selecting the option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Select
        label="Fruit"
        onChange={onChange}
        options={[
          {label: 'Apple', value: 'apple'},
          {
            isDisabled: true,
            label: 'Banana',
            tooltip: 'Out of season.',
            value: 'banana',
          },
        ]}
        value={null}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Fruit'}));
    const option = screen.getByRole('option', {name: 'Banana'});
    expect(getComputedStyle(option).pointerEvents).not.toBe('none');

    await user.hover(option);
    const tooltip = screen.getByText('Out of season.');
    await waitFor(() => expect(tooltip).toBeVisible());

    await user.click(option);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('listbox', {name: 'Fruit options'})).toBeVisible();
  });

  it('shows a tooltip rendered inside a disabled option by renderOption', async () => {
    const user = userEvent.setup();
    render(
      <Select
        label="Fruit"
        onChange={() => {}}
        options={[{isDisabled: true, label: 'Banana', value: 'banana'}]}
        renderOption={option => (
          <>
            {option.label}
            <Tooltip content="Out of season.">
              <span data-testid="reason">Why?</span>
            </Tooltip>
          </>
        )}
        value={null}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Fruit'}));
    await user.hover(screen.getByTestId('reason'));
    const tooltip = screen.getByText('Out of season.');
    await waitFor(() => expect(tooltip).toBeVisible());
  });

  it('shows a MultiSelect option tooltip on hover without selecting the option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={[
          {label: 'Name', value: 'name'},
          {
            isDisabled: true,
            label: 'Email',
            tooltip: 'Email cannot be hidden.',
            value: 'email',
          },
        ]}
        value={[]}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));
    const option = screen.getByRole('option', {name: 'Email'});
    expect(getComputedStyle(option).pointerEvents).not.toBe('none');

    await user.hover(option);
    const tooltip = screen.getByText('Email cannot be hidden.');
    await waitFor(() => expect(tooltip).toBeVisible());

    await user.click(option);
    expect(onChange).not.toHaveBeenCalled();
  });
});
