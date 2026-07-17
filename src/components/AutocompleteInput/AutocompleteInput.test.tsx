import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Search, User} from 'lucide-react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {AutocompleteInput} from 'components/AutocompleteInput/AutocompleteInput';
import {AutocompleteInputItem} from 'components/AutocompleteInput/AutocompleteInputItem';
import {BaseAutocompleteInput} from 'components/AutocompleteInput/BaseAutocompleteInput';
import {
  createStaticSearchSource,
  type SearchableItem,
  type SearchSource,
} from 'components/AutocompleteInput/types';
import {inputRecipe} from 'components/Field/inputStyles';
import {InputGroup} from 'components/InputGroup';
import {InputGroupText} from 'components/InputGroup/InputGroupText';
import {assertNonNull} from 'internal/testHelpers';

const items: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
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

afterEach(() => {
  vi.useRealTimers();
});

describe('AutocompleteInput', () => {
  it('selects a searched item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={onChange}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'gr');
    await user.click(screen.getByText('Grace Hopper'));

    expect(onChange).toHaveBeenCalledWith(items[1]);
  });

  it('closes the menu after selecting an item', async () => {
    const user = userEvent.setup();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    await user.type(input, 'gr');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByText('Grace Hopper'));

    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the menu after selecting an item with hasEntriesOnFocus', async () => {
    const user = userEvent.setup();

    render(
      <AutocompleteInput
        debounceMs={0}
        hasEntriesOnFocus
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    await user.type(input, 'gr');
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByText('Grace Hopper'));

    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('clears the selected item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AutocompleteInput
        label="Assignee"
        onChange={onChange}
        searchSource={createStaticSearchSource(items)}
        value={items[0]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Clear Assignee'}));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  // jsdom has no layout engine, so the right-alignment is asserted structurally:
  // the tag sits in a slot that absorbs the free space, pushing the clear button
  // to the trailing edge. It must not rely on an auto margin, which a consumer
  // reset (`* {margin: 0}`) in a layer after Panda's `utilities` would zero out.
  it('right-aligns the clear button without relying on an auto margin', () => {
    render(
      <AutocompleteInput
        data-testid="assignee"
        label="Assignee"
        onChange={vi.fn()}
        searchSource={createStaticSearchSource(items)}
        value={items[0]}
      />,
    );

    const wrapper = screen.getByTestId('assignee');
    const clearButton = screen.getByRole('button', {name: 'Clear Assignee'});

    expect(clearButton).not.toHaveClass('silver-ms_auto');

    // eslint-disable-next-line testing-library/no-node-access -- verifying the tag slot grows to push the clear button to the trailing edge
    const tagSlot = assertNonNull(wrapper.firstElementChild);
    expect(tagSlot).toHaveClass('silver-flex_1');
    expect(tagSlot).toHaveTextContent('Ada Lovelace');

    expect(wrapper).toContainElement(clearButton);
    expect(
      tagSlot.compareDocumentPosition(clearButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('clicking the tag enters edit mode with the label text in the input', async () => {
    const user = userEvent.setup();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={items[0]}
      />,
    );

    // A tag should be visible for the selected value.
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();

    // Click the tag to enter edit mode.
    await user.click(screen.getByText('Ada Lovelace'));

    // The input should now be visible with the label text pre-filled.
    const input = screen.getByRole<HTMLInputElement>('combobox', {
      name: 'Assignee',
    });
    await waitFor(() => {
      expect(input).toHaveValue('Ada Lovelace');
    });
    // Cursor should be at the end of the text.
    expect(input.selectionStart).toBe('Ada Lovelace'.length);
    expect(input.selectionEnd).toBe('Ada Lovelace'.length);
  });

  it('shows search results after clicking the tag to edit', async () => {
    const user = userEvent.setup();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={items[0]}
      />,
    );

    await user.click(screen.getByText('Ada Lovelace'));

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('clicking the wrapper area enters edit mode when a value is selected', async () => {
    const user = userEvent.setup();

    render(
      <AutocompleteInput
        data-testid="wrapper"
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={items[0]}
      />,
    );

    // Click the wrapper div (not the tag itself).
    await user.click(screen.getByTestId('wrapper'));

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    await waitFor(() => {
      expect(input).toHaveValue('Ada Lovelace');
    });
  });

  it('navigates results with the keyboard and closes with Escape', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={onChange}
        onOpenChange={onOpenChange}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    await user.type(input, 'a');

    expect(
      screen.getByRole('listbox', {hidden: true, name: 'Search results'}),
    ).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowDown}');
    await user.keyboard('{ArrowUp}');
    await user.keyboard('{Enter}');

    expect(onChange).toHaveBeenCalledWith(items[1]);

    await user.type(input, 'a');
    await user.keyboard('{Escape}');
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not select or close results while composing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={onChange}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    await user.type(input, 'a');
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    const activeDescendant = input.getAttribute('aria-activedescendant');

    fireEvent.keyDown(input, {isComposing: true, key: 'ArrowDown'});
    expect(input).toHaveAttribute('aria-activedescendant', activeDescendant);

    fireEvent.keyDown(input, {isComposing: true, key: 'Enter'});
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(input, {isComposing: true, key: 'Escape'});
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('scrolls the highlighted result into view during keyboard navigation', async () => {
    const user = userEvent.setup();
    const manyItems: SearchableItem[] = Array.from(
      {length: 30},
      (_, index) => ({id: `person-${index}`, label: `Person ${index}`}),
    );
    const scrolled: HTMLElement[] = [];
    const scrollSpy = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(function scrollIntoView(this: HTMLElement) {
        scrolled.push(this);
      });

    try {
      render(
        <AutocompleteInput
          debounceMs={0}
          label="Assignee"
          maxMenuItems={30}
          onChange={() => {}}
          searchSource={createStaticSearchSource(manyItems)}
          value={null}
        />,
      );

      const input = screen.getByRole('combobox', {name: 'Assignee'});
      await user.type(input, 'Person');

      // Arrow well past the visible fold.
      for (let index = 0; index < 15; index++) {
        await user.keyboard('{ArrowDown}');
      }

      const activeId = assertNonNull(
        input.getAttribute('aria-activedescendant'),
      );
      // eslint-disable-next-line testing-library/no-node-access -- verifying the active option element was scrolled into view
      const activeOption = document.getElementById(activeId);
      expect(scrolled).toContain(activeOption);
      expect(scrollSpy).toHaveBeenCalledWith({block: 'nearest'});
    } finally {
      scrollSpy.mockRestore();
    }
  });

  it('keeps focus on the input during arrow navigation and moves focus out on Tab', async () => {
    const user = userEvent.setup();

    render(
      <>
        <AutocompleteInput
          debounceMs={0}
          label="Assignee"
          onChange={() => {}}
          searchSource={createStaticSearchSource(items)}
          value={null}
        />
        <button type="button">Next field</button>
      </>,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    await user.type(input, 'a');

    const options = await screen.findAllByRole('option', {hidden: true});
    expect(options.length).toBeGreaterThan(0);

    // Arrow keys move the highlight via aria-activedescendant, not DOM focus:
    // focus stays on the input and the active option is referenced by id.
    await user.keyboard('{ArrowDown}');
    expect(input).toHaveFocus();
    expect(options.map(option => option.id)).toContain(
      input.getAttribute('aria-activedescendant'),
    );

    // Options are never in the tab sequence.
    for (const option of options) {
      expect(option).toHaveAttribute('tabindex', '-1');
    }

    // Tab leaves the combobox for the next control instead of entering the
    // listbox popover.
    await user.tab();
    expect(screen.getByRole('button', {name: 'Next field'})).toHaveFocus();
    expect(input).not.toHaveFocus();
  });

  it('debounces search calls', async () => {
    vi.useFakeTimers();
    const search = vi.fn(() => []);
    const source: SearchSource = {
      bootstrap: vi.fn(() => []),
      search,
    };

    render(
      <AutocompleteInput
        debounceMs={300}
        label="Assignee"
        onChange={() => {}}
        searchSource={source}
        value={null}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    fireEvent.change(input, {target: {value: 'a'}});
    fireEvent.change(input, {target: {value: 'ad'}});
    fireEvent.change(input, {target: {value: 'ada'}});

    expect(search).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(search).toHaveBeenCalledTimes(1);
    expect(search).toHaveBeenCalledWith('ada');
  });

  it('shows loading and async search results', async () => {
    const user = userEvent.setup();
    let resolveSearch: (value: SearchableItem[]) => void = () => {};
    const search = vi.fn(
      async () =>
        new Promise<SearchableItem[]>(resolve => {
          resolveSearch = resolve;
        }),
    );
    const source: SearchSource = {
      bootstrap: () => [],
      search,
    };

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        searchSource={source}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'gr');
    expect(screen.getByRole('status', {name: 'Loading'})).toBeInTheDocument();

    act(() => {
      resolveSearch([items[1]]);
    });

    expect(await screen.findByText('Grace Hopper')).toBeInTheDocument();
  });

  it('shows error text when search fails', async () => {
    const user = userEvent.setup();
    let rejectSearch: (error: Error) => void = () => {};
    const source: SearchSource = {
      bootstrap: () => [],
      search: async () =>
        new Promise<SearchableItem[]>((_, reject) => {
          rejectSearch = reject;
        }),
    };

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        searchSource={source}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'gr');

    act(() => {
      rejectSearch(new Error('Network error'));
    });

    expect(await screen.findByText('Something went wrong')).toBeInTheDocument();
  });

  it('shows custom error text when search fails', async () => {
    const user = userEvent.setup();
    let rejectSearch: (error: Error) => void = () => {};
    const source: SearchSource = {
      bootstrap: () => [],
      search: async () =>
        new Promise<SearchableItem[]>((_, reject) => {
          rejectSearch = reject;
        }),
    };

    render(
      <AutocompleteInput
        debounceMs={0}
        errorText="Search unavailable"
        label="Assignee"
        onChange={() => {}}
        searchSource={source}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'gr');

    act(() => {
      rejectSearch(new Error('Network error'));
    });

    expect(await screen.findByText('Search unavailable')).toBeInTheDocument();
  });

  it('does not open or search when disabled', async () => {
    const user = userEvent.setup();
    const source = {
      bootstrap: vi.fn(() => items),
      search: vi.fn(() => items),
    };

    render(
      <AutocompleteInput
        debounceMs={0}
        isDisabled
        label="Assignee"
        onChange={() => {}}
        searchSource={source}
        value={null}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});
    expect(input).toBeDisabled();

    await user.click(input);
    await user.keyboard('a');

    expect(source.bootstrap).not.toHaveBeenCalled();
    expect(source.search).not.toHaveBeenCalled();
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows entries on focus', async () => {
    const user = userEvent.setup();
    render(
      <AutocompleteInput
        debounceMs={0}
        hasEntriesOnFocus
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Assignee'}));

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
  });

  it('keeps menu open when clicking the input while results are shown', async () => {
    const user = userEvent.setup();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    const input = screen.getByRole('combobox', {name: 'Assignee'});

    // Type to open the menu with results.
    await user.type(input, 'a');

    await waitFor(() => {
      expect(input).toHaveAttribute('aria-expanded', 'true');
    });

    // Click the input again (e.g. to reposition cursor). The menu must
    // stay open — the popover's light-dismiss must not close it.
    await user.click(input);

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('opens menu on focus when hasEntriesOnFocus is true', async () => {
    const onOpenChange = vi.fn();

    render(
      <AutocompleteInput
        debounceMs={0}
        hasEntriesOnFocus
        label="Assignee"
        onChange={() => {}}
        onOpenChange={onOpenChange}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    fireEvent.focus(screen.getByRole('combobox', {name: 'Assignee'}));

    await act(async () => {
      await Promise.resolve();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders custom empty text for empty results', async () => {
    const user = userEvent.setup();
    render(
      <AutocompleteInput
        debounceMs={0}
        emptySearchResultsText="No matching people"
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'zzz');

    expect(screen.getByText('No matching people')).toBeInTheDocument();
  });

  it('limits the number of rendered menu items', async () => {
    const user = userEvent.setup();
    render(
      <AutocompleteInput
        debounceMs={0}
        hasEntriesOnFocus
        label="Assignee"
        maxMenuItems={1}
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    await user.click(screen.getByRole('combobox', {name: 'Assignee'}));

    expect(screen.getAllByRole('option', {hidden: true})).toHaveLength(1);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.queryByText('Grace Hopper')).not.toBeInTheDocument();
  });

  it('calls onQueryChange and onOpenChange', async () => {
    const user = userEvent.setup();
    const onQueryChange = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        onOpenChange={onOpenChange}
        onQueryChange={onQueryChange}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'gr');

    expect(onQueryChange).toHaveBeenLastCalledWith('gr');
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('renders custom items and a start icon', async () => {
    const user = userEvent.setup();
    const {container} = render(
      <AutocompleteInput
        debounceMs={0}
        label="Assignee"
        onChange={() => {}}
        renderItem={item => (
          <AutocompleteInputItem
            description="Engineer"
            icon={User}
            item={item}
          />
        )}
        searchSource={createStaticSearchSource(items)}
        startIcon={Search}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox', {name: 'Assignee'}), 'gr');

    expect(screen.getByText('Engineer')).toBeInTheDocument();
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- lucide icons are decorative SVGs
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders validation status and hides clear button when hasClear is false', () => {
    render(
      <AutocompleteInput
        hasClear={false}
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        status={{message: 'Select an assignee', type: 'error'}}
        value={items[0]}
      />,
    );

    expect(screen.getByText('Select an assignee')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Clear Assignee'}),
    ).not.toBeInTheDocument();
  });

  it('sets aria-required on the combobox when isRequired is true', () => {
    render(
      <AutocompleteInput
        debounceMs={0}
        isRequired
        label="Assignee"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    expect(screen.getByRole('combobox', {name: /Assignee/})).toBeRequired();
  });
});

describe('BaseAutocompleteInput', () => {
  it('can be used directly', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onQueryChange = vi.fn();

    render(
      <BaseAutocompleteInput
        debounceMs={0}
        onChange={onChange}
        onQueryChange={onQueryChange}
        query=""
        searchSource={createStaticSearchSource(items)}
        value={null}
      />,
    );

    await user.type(screen.getByRole('combobox'), 'ada');
    await user.click(screen.getByText('Ada Lovelace'));

    expect(onChange).toHaveBeenCalledWith(items[0]);
  });
});

describe('AutocompleteInputItem', () => {
  it('renders label, description, icon, and passthrough props', () => {
    const ref = vi.fn();
    const {container} = render(
      <AutocompleteInputItem
        className="custom-item"
        data-testid="item"
        description="Mathematician"
        icon={User}
        item={items[0]}
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const item = screen.getByTestId('item');
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Mathematician')).toBeInTheDocument();
    expect(item).toHaveClass('custom-item');
    expect(item).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(item);
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- lucide icons are decorative SVGs
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom item element content', () => {
    render(
      <AutocompleteInputItem
        item={{
          element: <span data-testid="custom-element">Custom</span>,
          id: 'custom',
          label: 'Custom',
        }}
      />,
    );

    expect(screen.getByTestId('custom-element')).toBeInTheDocument();
  });
});

describe('createStaticSearchSource', () => {
  it('searches item keywords', () => {
    const source = createStaticSearchSource(items, {
      getKeywords: item => (item.id === 'ada' ? ['analytical engine'] : []),
    });

    expect(source.search('engine')).toEqual([items[0]]);
  });

  describe('inside an InputGroup', () => {
    const noop = () => {};

    it('exposes the label via aria-label rather than a field label', () => {
      render(
        <InputGroup label="Assignee">
          <AutocompleteInput
            isLabelHidden
            label="Person"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={null}
          />
        </InputGroup>,
      );

      const input = screen.getByRole('combobox', {name: 'Person'});
      expect(input).toHaveAttribute('aria-label', 'Person');
      // eslint-disable-next-line testing-library/no-node-access -- the group renders the field label, so no <label> is tied to the input
      expect(input.closest('label')).toBeNull();
    });

    it('is disabled when the group is disabled even if its own isDisabled is false', () => {
      render(
        <InputGroup isDisabled label="Assignee">
          <AutocompleteInput
            isLabelHidden
            label="Person"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={null}
          />
        </InputGroup>,
      );

      expect(screen.getByRole('combobox', {name: 'Person'})).toBeDisabled();
    });

    it('hides the clear button when the group is disabled', () => {
      render(
        <InputGroup isDisabled label="Assignee">
          <AutocompleteInput
            isLabelHidden
            label="Person"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={items[0]}
          />
        </InputGroup>,
      );

      expect(
        screen.queryByRole('button', {name: 'Clear Person'}),
      ).not.toBeInTheDocument();
    });

    it('inherits the group size', () => {
      render(
        <InputGroup label="Assignee" size="lg">
          <AutocompleteInput
            data-testid="ac"
            isLabelHidden
            label="Person"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            size="sm"
            value={null}
          />
        </InputGroup>,
      );

      expect(screen.getByTestId('ac')).toHaveClass(inputRecipe({size: 'lg'}));
    });

    it('applies the group status type to the input wrapper', () => {
      render(
        <InputGroup label="Assignee" status={{message: 'Bad', type: 'error'}}>
          <AutocompleteInput
            data-testid="ac"
            isLabelHidden
            label="Person"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={null}
          />
        </InputGroup>,
      );

      expect(screen.getByTestId('ac')).toHaveClass(
        inputRecipe({status: 'error'}),
      );
      // Group status styling must not flag the field as invalid.
      expect(
        screen.getByRole('combobox', {name: 'Person'}),
      ).not.toHaveAttribute('aria-invalid');
    });

    it('forwards className, style and ref to the wrapper instead of a field', () => {
      const ref = vi.fn<(element: HTMLDivElement | null) => void>();
      const {container} = render(
        <InputGroup label="Assignee">
          <AutocompleteInput
            className="custom-wrapper"
            isLabelHidden
            label="Person"
            onChange={noop}
            ref={ref}
            searchSource={createStaticSearchSource(items)}
            style={{maxWidth: 200}}
            value={null}
          />
        </InputGroup>,
      );

      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      const wrapper = container.querySelector('.custom-wrapper');
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveStyle({maxWidth: '200px'});
      expect(wrapper).toContainElement(screen.getByRole('combobox'));
      // It must be the input wrapper itself, not a Field root around it.
      expect(wrapper).toHaveClass(inputRecipe({size: 'md'}));
      // There is no Field in a group, so the ref retargets to the wrapper
      // rather than being silently dropped.
      expect(ref).toHaveBeenCalledWith(wrapper);
    });

    it('keeps its menu nested inside the wrapper, not as a group item', () => {
      render(
        <InputGroup label="Assignee">
          <InputGroupText>@</InputGroupText>
          <AutocompleteInput
            data-testid="ac"
            isLabelHidden
            label="Person"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={null}
          />
        </InputGroup>,
      );

      // Unlike Select, this menu renders nested inside the wrapper, so the
      // group only ever sees the addon and the wrapper as children.
      // eslint-disable-next-line testing-library/no-node-access -- asserting the group's own child structure is the point of this test
      const children = Array.from(screen.getByRole('group').children);
      expect(children).toHaveLength(2);
      expect(children[1]).toBe(screen.getByTestId('ac'));
    });
  });
});
