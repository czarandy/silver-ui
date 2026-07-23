import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {
  createStaticSearchSource,
  type SearchableItem,
} from 'components/AutocompleteInput';
import {inputRecipe, inputStyles} from 'components/Field/inputStyles';
import {InputGroup} from 'components/InputGroup';
import {InputGroupText} from 'components/InputGroup/InputGroupText';
import {TagsInput} from 'components/TagsInput/TagsInput';
import {SizeContext} from 'internal/SizeContext';
import {
  assertNonNull,
  createResizeObserverStub,
  stubTokenizedGapComputedStyle,
} from 'internal/testHelpers';

const items: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
];

const emptySource = createStaticSearchSource<SearchableItem>([]);
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
  globalThis.ResizeObserver = createResizeObserverStub().ResizeObserverStub;
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
  it('inherits the ambient size', () => {
    render(
      <SizeContext value="lg">
        <TagsInput
          data-testid="tags"
          label="People"
          onChange={() => {}}
          searchSource={createStaticSearchSource(items)}
          value={[]}
        />
      </SizeContext>,
    );

    expect(screen.getByTestId('tags')).toHaveClass(inputRecipe({size: 'lg'}));
  });

  it('submits each selected item ID with htmlName', () => {
    render(
      <form data-testid="form">
        <TagsInput
          htmlName="team"
          label="Team"
          onChange={() => {}}
          searchSource={emptySource}
          value={[items[0], items[2]]}
        />
        <TagsInput
          htmlName="disabled"
          isDisabled
          label="Disabled"
          onChange={() => {}}
          searchSource={emptySource}
          value={[items[1]]}
        />
      </form>,
    );

    const formData = new FormData(screen.getByTestId('form'));
    expect(formData.getAll('team')).toEqual(['ada', 'katherine']);
    expect(formData.has('disabled')).toBe(false);
  });

  it('adds a selected item', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagsInput
        debounceMs={0}
        label="Team"
        onChange={onChange}
        searchSource={createStaticSearchSource(items)}
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
          searchSource={createStaticSearchSource(items)}
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
        searchSource={createStaticSearchSource(items)}
        value={[items[0]]}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Remove Ada Lovelace'}));

    expect(onChange).toHaveBeenCalledWith([], {
      item: items[0],
      type: 'remove',
    });
  });

  // Several controls inside TagsInput carry `role="status"` (Button hosts one
  // for its loading state), so these assert on the announced text itself and
  // check that it landed in a polite live region.
  describe('screen reader announcements', () => {
    it('announces a removed tag', async () => {
      const user = userEvent.setup();

      render(
        <TagsInput
          label="Team"
          onChange={vi.fn()}
          searchSource={createStaticSearchSource(items)}
          value={[items[0]]}
        />,
      );

      await user.click(
        screen.getByRole('button', {name: 'Remove Ada Lovelace'}),
      );

      await waitFor(() => {
        expect(screen.getByText('Removed Ada Lovelace')).toHaveAttribute(
          'aria-live',
          'polite',
        );
      });
    });

    it('announces an added tag', async () => {
      const user = userEvent.setup();

      render(
        <TagsInput
          debounceMs={0}
          label="Team"
          onChange={vi.fn()}
          searchSource={createStaticSearchSource(items)}
          value={[]}
        />,
      );

      await user.type(screen.getByRole('combobox', {name: 'Team'}), 'ada');
      await user.click(screen.getByText('Ada Lovelace'));

      await waitFor(() => {
        expect(screen.getByText('Added Ada Lovelace')).toHaveAttribute(
          'aria-live',
          'polite',
        );
      });
    });

    it('announces clearing every tag', async () => {
      const user = userEvent.setup();

      render(
        <TagsInput
          hasClear
          label="Team"
          onChange={vi.fn()}
          searchSource={createStaticSearchSource(items)}
          value={[items[0], items[1]]}
        />,
      );

      await user.click(screen.getByRole('button', {name: 'Clear Team'}));

      await waitFor(() => {
        expect(screen.getByText('Cleared all tags')).toHaveAttribute(
          'aria-live',
          'polite',
        );
      });
    });
  });

  it('uses tighter vertical padding for selected tags in the small size', () => {
    render(
      <TagsInput
        data-testid="tags"
        label="Team"
        onChange={() => {}}
        searchSource={emptySource}
        size="sm"
        value={[items[0]]}
      />,
    );

    expect(screen.getByTestId('tags')).toHaveClass('silver-pt_0px');
    expect(screen.getByTestId('tags')).toHaveClass('silver-pb_0.5');
  });

  it('removes last tag on backspace when input is empty', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagsInput
        label="Team"
        onChange={onChange}
        searchSource={createStaticSearchSource(items)}
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
        searchSource={createStaticSearchSource(items)}
        value={selected}
      />,
    );

    const clearButton = screen.getByRole('button', {name: 'Clear Team'});
    expect(clearButton).toHaveClass(inputStyles.clearButton);
    await user.click(clearButton);

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
        searchSource={createStaticSearchSource(items)}
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
        searchSource={createStaticSearchSource(items)}
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
        searchSource={createStaticSearchSource(items)}
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

  it('uses createItem to build the committed item when provided', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TagsInput
        createItem={rawValue => ({
          id: `custom-${rawValue}`,
          label: rawValue.toUpperCase(),
        })}
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
    expect(call[0][0].id).toBe('custom-new-tag');
    expect(call[0][0].label).toBe('NEW-TAG');
    expect(call[1].type).toBe('create');
  });

  describe('unfocusedInline truncation measurement', () => {
    const TAG_WIDTH = 60;
    const INDICATOR_WIDTH = 40;
    // Chosen so the real 4px token gap (gap={1}) decides the outcome: two
    // 60px tags plus the reserved 40px indicator need 160px at gap 0 (fits)
    // but 168px at 4px gaps (overflows) — a shim resolving gap to 0 would
    // wrongly keep two tags visible.
    const WRAPPER_WIDTH = 164;

    // A tag token's text is exactly its label (the remove button is
    // icon-only), so exact text equality identifies the measured wrappers
    // without touching real layout.
    function truncationWidthFor(element: HTMLElement): number {
      const text = element.textContent;
      if (/^\+\d+ more$/.test(text)) {
        return INDICATOR_WIDTH;
      }
      if (items.some(item => text === item.label)) {
        return TAG_WIDTH;
      }
      return 0;
    }

    beforeEach(() => {
      stubTokenizedGapComputedStyle();
      vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(
        function (this: HTMLElement) {
          return truncationWidthFor(this);
        },
      );
      vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(
        function (this: HTMLElement) {
          return this.dataset.testid === 'tags' ? WRAPPER_WIDTH : 0;
        },
      );
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    function renderTruncated(): void {
      render(
        <TagsInput
          data-testid="tags"
          label="Team"
          onChange={() => {}}
          searchSource={createStaticSearchSource(items)}
          tagOverflowBehavior="unfocusedInline"
          value={[items[0], items[1], items[2]]}
        />,
      );
    }

    // The OverflowList inside TagsInput has no test id; its visible row is
    // the sibling after the inert measurement row.
    function getVisibleRow(): HTMLElement {
      const wrapper = screen.getByTestId('tags');
      // eslint-disable-next-line testing-library/no-node-access -- locate OverflowList's rows structurally; they carry no test ids
      const measureRow = assertNonNull(wrapper.querySelector('[inert]'));
      // eslint-disable-next-line testing-library/no-node-access -- see above
      return assertNonNull(measureRow.nextElementSibling) as HTMLElement;
    }

    it('collapses tags that exceed the wrapper width into "+N more"', () => {
      renderTruncated();

      // 164px wrapper, 60px tags, 4px token gap (gap={1}), 40px indicator:
      // one tag fits alongside the reserved indicator, two collapse.
      const visibleRow = getVisibleRow();
      expect(within(visibleRow).getByText('Ada Lovelace')).toBeInTheDocument();
      expect(within(visibleRow).getByText('+2 more')).toBeInTheDocument();
      expect(
        within(visibleRow).queryByText('Grace Hopper'),
      ).not.toBeInTheDocument();
      expect(
        within(visibleRow).queryByText('Katherine Johnson'),
      ).not.toBeInTheDocument();
    });

    it('expands the collapsed tags on focus', async () => {
      const user = userEvent.setup();
      renderTruncated();

      expect(within(getVisibleRow()).getByText('+2 more')).toBeInTheDocument();

      await user.click(screen.getByRole('combobox', {name: 'Team'}));

      // Focus leaves truncation mode entirely: every tag renders once and
      // no overflow indicator remains.
      expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
      expect(screen.getByText('Grace Hopper')).toBeInTheDocument();
      expect(screen.getByText('Katherine Johnson')).toBeInTheDocument();
      expect(screen.queryByText(/^\+\d+ more$/)).not.toBeInTheDocument();
    });
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
        searchSource={createStaticSearchSource(items)}
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

  it('renders a top-layer popover for tagOverflowBehavior unfocusedLayer', () => {
    render(
      <TagsInput
        data-testid="tags"
        label="Team"
        onChange={() => {}}
        searchSource={createStaticSearchSource(items)}
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
        searchSource={createStaticSearchSource(items)}
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

  it('re-bootstraps results after selecting an item with hasEntriesOnFocus', async () => {
    const user = userEvent.setup();
    const source = createStaticSearchSource(items);

    function Controlled(): React.JSX.Element {
      const [value, setValue] = useState<SearchableItem[]>([]);
      return (
        <TagsInput
          debounceMs={0}
          hasEntriesOnFocus
          label="Team"
          onChange={setValue}
          searchSource={source}
          value={value}
        />
      );
    }

    render(<Controlled />);

    const input = screen.getByRole('combobox', {name: 'Team'});
    await user.click(input);
    await act(async () => {
      await tick();
    });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();

    await user.click(screen.getByText('Ada Lovelace'));
    await act(async () => {
      await tick();
    });

    expect(input).toHaveAttribute('aria-expanded', 'true');
    const options = screen.getAllByRole('option', {hidden: true});
    const optionLabels = options.map(o => o.textContent);
    expect(optionLabels).not.toContain('Ada Lovelace');
    expect(optionLabels).toContain('Grace Hopper');
    expect(optionLabels).toContain('Katherine Johnson');
  });

  describe('inside an InputGroup', () => {
    const noop = () => {};

    it('names the input via aria-label rather than a field label', () => {
      render(
        <InputGroup label="Recipients">
          <TagsInput
            isLabelHidden
            label="People"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={[]}
          />
        </InputGroup>,
      );

      const input = screen.getByRole('combobox', {name: 'People'});
      expect(input).toHaveAttribute('aria-label', 'People');
      // eslint-disable-next-line testing-library/no-node-access -- the group renders the field label, so no <label> is tied to the input
      expect(input.closest('label')).toBeNull();
    });

    it('is disabled when the group is disabled even if its own isDisabled is false', () => {
      render(
        <InputGroup isDisabled label="Recipients">
          <TagsInput
            isLabelHidden
            label="People"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={[]}
          />
        </InputGroup>,
      );

      expect(screen.getByRole('combobox', {name: 'People'})).toBeDisabled();
    });

    it('hides the clear button when the group is disabled', () => {
      render(
        <InputGroup isDisabled label="Recipients">
          <TagsInput
            hasClear
            isLabelHidden
            label="People"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={[items[0]]}
          />
        </InputGroup>,
      );

      expect(
        screen.queryByRole('button', {name: 'Clear People'}),
      ).not.toBeInTheDocument();
    });

    it('inherits the group size', () => {
      render(
        <InputGroup label="Recipients" size="lg">
          <TagsInput
            data-testid="tags"
            isLabelHidden
            label="People"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            size="sm"
            value={[]}
          />
        </InputGroup>,
      );

      expect(screen.getByTestId('tags')).toHaveClass(inputRecipe({size: 'lg'}));
    });

    it('applies the group status type to the input wrapper', () => {
      render(
        <InputGroup label="Recipients" status={{message: 'Bad', type: 'error'}}>
          <TagsInput
            data-testid="tags"
            isLabelHidden
            label="People"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={[]}
          />
        </InputGroup>,
      );

      expect(screen.getByTestId('tags')).toHaveClass(
        inputRecipe({status: 'error'}),
      );
      expect(
        screen.getByRole('combobox', {name: 'People'}),
      ).not.toHaveAttribute('aria-invalid');
    });

    it('forwards className, style and ref to the wrapper instead of a field', () => {
      const ref = vi.fn<(element: HTMLDivElement | null) => void>();
      const {container} = render(
        <InputGroup label="Recipients">
          <TagsInput
            className="custom-wrapper"
            isLabelHidden
            label="People"
            onChange={noop}
            ref={ref}
            searchSource={createStaticSearchSource(items)}
            style={{maxWidth: 200}}
            value={[]}
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
      // There is no Field in a group, so the ref retargets to the wrapper.
      expect(ref).toHaveBeenCalledWith(wrapper);
    });

    it('keeps its own tag group nested inside the input group', () => {
      render(
        <InputGroup label="Recipients">
          <TagsInput
            data-testid="tags"
            isLabelHidden
            label="People"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            value={[]}
          />
        </InputGroup>,
      );

      // TagsInput's wrapper is itself a role="group" naming the tag
      // collection, so grouping it nests two groups. Both must stay
      // addressable by their own accessible names.
      const group = screen.getByRole('group', {name: 'Recipients'});
      const tagGroup = screen.getByRole('group', {name: 'People'});
      expect(group).toContainElement(tagGroup);
      expect(tagGroup).toBe(screen.getByTestId('tags'));
      // The tag group must be a *direct* child of the input group -- if a Field
      // root were still rendered in between, the group's border and radius
      // rules would land on the field instead of the control.
      // eslint-disable-next-line testing-library/no-node-access -- direct-child position is exactly what this pins
      expect(Array.from(group.children)).toContain(tagGroup);
    });

    it('makes the collapsed placeholder the group item in layer mode', () => {
      render(
        <InputGroup label="Recipients">
          <InputGroupText>To</InputGroupText>
          <TagsInput
            className="custom-wrapper"
            isLabelHidden
            label="People"
            onChange={noop}
            searchSource={createStaticSearchSource(items)}
            tagOverflowBehavior="unfocusedLayer"
            value={[items[0]]}
          />
        </InputGroup>,
      );

      const group = screen.getByRole('group', {name: 'Recipients'});
      /* eslint-disable testing-library/no-node-access -- asserting the group's
         own child structure is the point: in layer mode the in-flow
         placeholder, not the wrapper, must be the styled group item. */
      const children = Array.from(group.children);
      const items_ = children.filter(child => !child.hasAttribute('popover'));
      // The addon and the collapsed placeholder are the only in-flow items;
      // the layer popover holding the real wrapper must not count as one.
      expect(items_).toHaveLength(2);
      expect(items_[1]).toHaveClass('custom-wrapper');
      expect(children.some(child => child.hasAttribute('popover'))).toBe(true);
      /* eslint-enable testing-library/no-node-access */
    });
  });
});
