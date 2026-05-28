import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {MultiSelect} from './MultiSelect';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.setAttribute('popover-open', '');
    },
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value(this: HTMLElement) {
      this.removeAttribute('popover-open');
    },
  });
});

describe('MultiSelect', () => {
  it('toggles an option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email']}
        value={['Name']}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Columns'}));
    await user.click(screen.getByText('Email'));

    expect(onChange).toHaveBeenCalledWith(['Name', 'Email']);
  });

  it('clears all selected options', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        hasClear
        label="Columns"
        onChange={onChange}
        options={['Name', 'Email']}
        value={['Name']}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Columns'}));

    expect(onChange).toHaveBeenCalledWith([]);
  });
});
