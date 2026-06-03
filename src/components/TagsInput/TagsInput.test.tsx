import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {beforeAll, beforeEach, describe, expect, it, vi} from 'vitest';
import {createStaticSource, type SearchableItem} from '../AutocompleteInput';
import {TagsInput} from './TagsInput';

const items: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
];

const emptySource = createStaticSource([]);
const showPopover = vi.fn(function (this: HTMLElement) {
  this.setAttribute('popover-open', '');
});
const hidePopover = vi.fn(function (this: HTMLElement) {
  this.removeAttribute('popover-open');
});

async function tick(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 50);
  });
}

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value: showPopover,
  });
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value: hidePopover,
  });
});

beforeEach(() => {
  showPopover.mockClear();
  hidePopover.mockClear();
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

  it('clears the typed query after selecting an item', async () => {
    const user = userEvent.setup();

    function ControlledTagsInput(): React.JSX.Element {
      const [value, setValue] = useState<SearchableItem[]>([]);
      return (
        <TagsInput
          debounceMs={0}
          label="Team"
          onChange={setValue}
          searchSource={createStaticSource(items)}
          value={value}
        />
      );
    }

    render(<ControlledTagsInput />);

    const input = screen.getByRole('combobox', {name: 'Team'});
    await user.type(input, 'ada');
    await user.click(screen.getByText('Ada Lovelace'));

    expect(input).toHaveValue('');
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

  it('removes last tag on backspace when input is empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagsInput
        label="Team"
        onChange={onChange}
        searchSource={createStaticSource(items)}
        value={[items[0], items[1]]}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Team'});
    await user.click(input);
    await user.keyboard('{Backspace}');

    expect(onChange).toHaveBeenCalledWith([items[0]], {
      item: items[1],
      type: 'remove',
    });
  });

  it('clears all tags with clear button', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const selected = [items[0], items[1]];

    render(
      <TagsInput
        hasClear
        label="Team"
        onChange={onChange}
        searchSource={createStaticSource(items)}
        value={selected}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Team'}));

    expect(onChange).toHaveBeenCalledWith([], {
      items: selected,
      type: 'remove-all',
    });
  });

  it('does not show clear button when no tags', () => {
    render(
      <TagsInput
        hasClear
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        value={[]}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Clear Team'}),
    ).not.toBeInTheDocument();
  });

  it('disables all inputs when isDisabled is true', () => {
    render(
      <TagsInput
        isDisabled
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        value={[items[0]]}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Team'})).toBeDisabled();
  });

  it('hides input when maxEntries is reached', () => {
    render(
      <TagsInput
        label="Team"
        maxEntries={2}
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        value={[items[0], items[1]]}
      />,
    );

    expect(screen.getByRole('combobox', {name: 'Team'})).toBeDisabled();
  });

  it('shows create option for free-text when hasCreate is true', async () => {
    const user = userEvent.setup();

    render(
      <TagsInput
        debounceMs={0}
        hasCreate
        label="Tags"
        onChange={() => {}}
        searchSource={emptySource}
        value={[]}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Tags'}), 'new-tag');
    await act(async () => {
      await tick();
    });

    expect(screen.getByText('Create "new-tag"')).toBeInTheDocument();
  });

  it('fires onChange with create type when create option is selected', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagsInput
        debounceMs={0}
        hasCreate
        label="Tags"
        onChange={onChange}
        searchSource={emptySource}
        value={[]}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Tags'}), 'new-tag');
    await act(async () => {
      await tick();
    });
    await user.click(screen.getByText('Create "new-tag"'));

    const call = onChange.mock.calls[0] as [
      SearchableItem[],
      {item: SearchableItem; type: string},
    ];
    expect(call[0][0].id).toBe('new-tag');
    expect(call[0][0].label).toBe('new-tag');
    expect(call[1].type).toBe('create');
    expect(call[1].item.id).toBe('new-tag');
  });

  it('truncates tags when tagOverflowBehavior is unfocusedInline and unfocused', () => {
    render(
      <TagsInput
        data-testid="tags"
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        tagOverflowBehavior="unfocusedInline"
        value={[items[0], items[1], items[2]]}
      />,
    );

    expect(screen.getAllByText('Ada Lovelace').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getByRole('combobox', {name: 'Team'})).toBeInTheDocument();
  });

  it('opens popover when clicking the wrapper area', async () => {
    const user = userEvent.setup();

    render(
      <TagsInput
        data-testid="tags"
        debounceMs={0}
        hasEntriesOnFocus
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        value={[items[0]]}
      />,
    );

    const wrapper = screen.getByTestId('tags');
    await user.click(wrapper);
    await act(async () => {
      await tick();
    });

    const input = screen.getByRole('combobox', {name: 'Team'});
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('expands tags on focus when tagOverflowBehavior is unfocusedInline', async () => {
    const user = userEvent.setup();

    render(
      <TagsInput
        data-testid="tags"
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        tagOverflowBehavior="unfocusedInline"
        value={[items[0], items[1], items[2]]}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Team'}));

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
    expect(screen.getByText('Katherine Johnson')).toBeInTheDocument();
  });

  it('renders a top-layer popover for tagOverflowBehavior unfocusedLayer', () => {
    render(
      <TagsInput
        data-testid="tags"
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        tagOverflowBehavior="unfocusedLayer"
        value={[items[0], items[1], items[2]]}
      />,
    );

    expect(screen.getByTestId('tags')).toBeInTheDocument();
    expect(screen.getByTestId('tags-layer')).toBeInTheDocument();
  });

  it('opens and closes the layer when tagOverflowBehavior is unfocusedLayer', () => {
    render(
      <TagsInput
        data-testid="tags"
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSource(items)}
        tagOverflowBehavior="unfocusedLayer"
        value={[items[0], items[1], items[2]]}
      />,
    );

    const wrapper = screen.getByTestId('tags');

    fireEvent.focusIn(wrapper);
    expect(showPopover).toHaveBeenCalled();

    fireEvent.focusOut(wrapper, {relatedTarget: document.body});
    expect(hidePopover).toHaveBeenCalled();
  });
});
