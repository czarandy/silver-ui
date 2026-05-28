import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Select} from './Select';
import {SelectOption} from './SelectOption';

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

describe('Select', () => {
  it('selects an option', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        label="Fruit"
        onChange={onChange}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Fruit'}));
    await user.click(screen.getByText('Banana'));
    expect(onChange).toHaveBeenCalledWith('Banana');
  });

  it('clears the selected value', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Select
        hasClear
        label="Fruit"
        onChange={onChange}
        options={['Apple', 'Banana']}
        value="Apple"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Fruit'}));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('supports custom option rendering', () => {
    render(
      <Select
        hasSearch
        isDefaultOpen
        label="User"
        options={[{label: 'Ada Lovelace', value: 'ada'}]}
        value="ada">
        {option => (
          <SelectOption
            description="Engineer"
            label={option.label ?? option.value}
          />
        )}
      </Select>,
    );

    expect(screen.getByText('Engineer')).toBeInTheDocument();
    expect(
      screen.getByRole('searchbox', {hidden: true, name: 'Search User'}),
    ).toBeInTheDocument();
  });
});
