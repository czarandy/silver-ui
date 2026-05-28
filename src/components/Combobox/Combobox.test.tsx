import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Combobox} from './Combobox';
import {createStaticSource, type SearchableItem} from './types';

const items: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
];

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

describe('Combobox', () => {
  it('selects a searched item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Combobox
        debounceMs={0}
        label="Assignee"
        onChange={onChange}
        searchSource={createStaticSource(items)}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'gr');
    await user.click(screen.getByText('Grace Hopper'));

    expect(onChange).toHaveBeenCalledWith(items[1]);
  });

  it('clears the selected item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <Combobox
        label="Assignee"
        onChange={onChange}
        searchSource={createStaticSource(items)}
        value={items[0]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Assignee'}));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
