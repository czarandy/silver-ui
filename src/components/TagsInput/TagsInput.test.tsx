import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {createStaticSource, type SearchableItem} from '../Combobox';
import {TagsInput} from './TagsInput';

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

describe('TagsInput', () => {
  it('adds a selected item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagsInput
        debounceMs={0}
        label="Team"
        onChange={onChange}
        searchSource={createStaticSource(items)}
        value={[]}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Team'}), 'ada');
    await user.click(screen.getByText('Ada Lovelace'));

    expect(onChange).toHaveBeenCalledWith([items[0]], {
      item: items[0],
      type: 'add',
    });
  });

  it('removes a selected tag', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagsInput
        label="Team"
        onChange={onChange}
        searchSource={createStaticSource(items)}
        value={[items[0]]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Remove Ada Lovelace'}));

    expect(onChange).toHaveBeenCalledWith([], {
      item: items[0],
      type: 'remove',
    });
  });
});
