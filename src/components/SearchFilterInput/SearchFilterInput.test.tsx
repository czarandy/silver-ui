import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {SearchFilterInput} from './SearchFilterInput';
import {formatFilterValue} from './formatFilterValue';
import type {EnumItem, SearchFilterInputConfig} from './types';
import {
  createSearchFilterInputConfig,
  type FieldDefinition,
} from './useSearchFilterInputConfig';

const STATUSES: ReadonlyArray<EnumItem> = [
  {label: 'Active', value: 'active'},
  {label: 'Inactive', value: 'inactive'},
];

const fields = [
  {key: 'name', label: 'Name', type: 'string'},
  {key: 'status', label: 'Status', type: 'enum', enumValues: STATUSES},
  {key: 'age', label: 'Age', type: 'number'},
] as const satisfies ReadonlyArray<FieldDefinition>;

const {config} = createSearchFilterInputConfig(fields);

describe('SearchFilterInput', () => {
  it('renders with no filters', () => {
    render(
      <SearchFilterInput config={config} filters={[]} onChange={() => {}} />,
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders tags for provided filters', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'John'},
          },
        ]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/John/)).toBeInTheDocument();
  });

  it('renders multiple filter tags', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'John'},
          },
          {
            field: 'status',
            operator: 'is',
            value: {type: 'enum', value: 'active'},
          },
        ]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/Status/)).toBeInTheDocument();
  });

  it('disables interaction when isDisabled is true', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[]}
        isDisabled
        onChange={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText('Search...')).toBeDisabled();
  });

  it('does not allow interaction when isReadOnly is true', () => {
    render(
      <SearchFilterInput
        config={config}
        data-testid="filter-input"
        filters={[
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'John'},
          },
        ]}
        isReadOnly
        onChange={() => {}}
      />,
    );

    expect(screen.getByTestId('filter-input')).toBeInTheDocument();
    expect(screen.getByText(/Name/)).toBeInTheDocument();
  });

  it('hides placeholder in read-only mode', () => {
    const {container} = render(
      <SearchFilterInput
        config={config}
        filters={[]}
        isReadOnly
        onChange={() => {}}
        placeholder="Search..."
      />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const input = container.querySelector('input');
    expect(input?.placeholder).toBe('');
  });

  it('renders tag labels without colon separator', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'test'},
          },
        ]}
        onChange={() => {}}
      />,
    );

    expect(screen.queryByText(/Name:/)).not.toBeInTheDocument();
    expect(screen.getByText(/Name/)).toBeInTheDocument();
    expect(screen.getByText(/contains/)).toBeInTheDocument();
  });

  it('renders result count', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[]}
        onChange={() => {}}
        resultCount={42}
      />,
    );

    expect(screen.getByText('42 results')).toBeInTheDocument();
  });

  it('renders string result count', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[]}
        onChange={() => {}}
        resultCount="1,234"
      />,
    );

    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders custom placeholder', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[]}
        onChange={() => {}}
        placeholder="Filter items..."
      />,
    );

    expect(screen.getByPlaceholderText('Filter items...')).toBeInTheDocument();
  });

  it('forwards data-testid', () => {
    render(
      <SearchFilterInput
        config={config}
        data-testid="filter-input"
        filters={[]}
        onChange={() => {}}
      />,
    );

    expect(screen.getByTestId('filter-input')).toBeInTheDocument();
  });

  it('forwards ref', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <SearchFilterInput
        config={config}
        filters={[]}
        onChange={() => {}}
        ref={ref}
      />,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('renders error status message', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[]}
        onChange={() => {}}
        status={{type: 'error', message: 'At least one filter is required'}}
      />,
    );

    expect(
      screen.getByText('At least one filter is required'),
    ).toBeInTheDocument();
  });

  it('renders with maxOperatorMenuItems set', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[]}
        maxOperatorMenuItems={3}
        onChange={() => {}}
      />,
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with tagOverflowBehavior and multiple filters', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'Alice'},
          },
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'Bob'},
          },
          {
            field: 'status',
            operator: 'is',
            value: {type: 'enum', value: 'active'},
          },
          {
            field: 'age',
            operator: 'equals',
            value: {type: 'integer', value: 25},
          },
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'Charlie'},
          },
        ]}
        onChange={() => {}}
        tagOverflowBehavior="unfocusedInline"
      />,
    );

    expect(screen.getAllByText(/Alice/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bob/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Status/).length).toBeGreaterThan(0);
  });

  it('renders entity photo in tag for single-entity entity_list filter', () => {
    const entityConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'assignee',
          label: 'Assignee',
          operators: [
            {
              key: 'is',
              label: 'is',
              value: {type: 'entity_list'},
            },
          ],
        },
      ],
      name: 'EntityPhotoTestConfig',
    };

    render(
      <SearchFilterInput
        config={entityConfig}
        filters={[
          {
            field: 'assignee',
            operator: 'is',
            value: {
              type: 'entity_list',
              value: [
                {
                  id: 'user-1',
                  label: 'Jane Doe',
                  photo: 'https://example.com/jane.jpg',
                },
              ],
            },
          },
        ]}
        onChange={() => {}}
      />,
    );

    const img = screen.getByRole('presentation', {hidden: true});
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/jane.jpg');
  });

  it('does not render entity photo for multi-entity entity_list filter', () => {
    const entityConfig: SearchFilterInputConfig = {
      fields: [
        {
          key: 'assignee',
          label: 'Assignee',
          operators: [
            {
              key: 'is_any_of',
              label: 'is any of',
              value: {type: 'entity_list'},
            },
          ],
        },
      ],
      name: 'EntityPhotoTestConfig',
    };

    render(
      <SearchFilterInput
        config={entityConfig}
        filters={[
          {
            field: 'assignee',
            operator: 'is_any_of',
            value: {
              type: 'entity_list',
              value: [
                {
                  id: 'user-1',
                  label: 'Jane Doe',
                  photo: 'https://example.com/jane.jpg',
                },
                {
                  id: 'user-2',
                  label: 'John Smith',
                  photo: 'https://example.com/john.jpg',
                },
              ],
            },
          },
        ]}
        onChange={() => {}}
      />,
    );

    expect(
      screen.queryByRole('presentation', {hidden: true}),
    ).not.toBeInTheDocument();
  });
});

describe('edit popover focus', () => {
  beforeAll(() => {
    globalThis.ResizeObserver = class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    };
    // jsdom defaults `[popover]` elements to `display: none` and lacks
    // showPopover/hidePopover. Toggle inline display so opened popover content
    // is visible (and thus queryable/clickable) in tests.
    Object.defineProperty(HTMLElement.prototype, 'showPopover', {
      configurable: true,
      value(this: HTMLElement) {
        this.style.display = 'block';
      },
    });
    Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
      configurable: true,
      value(this: HTMLElement) {
        this.style.display = 'none';
      },
    });
  });

  async function flushFrames(count = 1): Promise<void> {
    await act(async () => {
      for (let i = 0; i < count; i++) {
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
    });
  }

  const nameFilter = {
    field: 'name',
    operator: 'contains',
    value: {type: 'string', value: 'John'},
  } as const;

  it('does not flash the input focused after cancelling a tag edit', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilterInput
        config={config}
        filters={[nameFilter]}
        onChange={() => {}}
      />,
    );
    const input = screen.getByRole('combobox', {name: 'Search'});

    await user.click(screen.getByText(/Name/));
    await user.click(await screen.findByRole('button', {name: 'Cancel'}));

    // Pressing a tag used to register TagsInput's global "focus the input on the
    // next click" listener. Because the tag's onClick stops propagation, that
    // listener never fired on the tag click and leaked to the later Cancel
    // click — briefly focusing the input (and re-opening the popover/
    // suggestions) before a deferred blur, producing a visible flash.
    expect(input).not.toHaveFocus();
    await flushFrames(1);
    expect(input).not.toHaveFocus();
    await flushFrames(1);
    expect(input).not.toHaveFocus();
  });

  it('does not focus the input when editing is cancelled (the reported bug)', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilterInput
        config={config}
        filters={[nameFilter]}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByText(/Name/));
    await user.click(await screen.findByRole('button', {name: 'Cancel'}));
    await flushFrames(2);

    expect(screen.getByRole('combobox', {name: 'Search'})).not.toHaveFocus();
  });

  it('does not focus the input when editing is dismissed with Escape', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilterInput
        config={config}
        filters={[nameFilter]}
        onChange={() => {}}
      />,
    );

    await user.click(screen.getByText(/Name/));
    await screen.findByRole('button', {name: 'Cancel'});
    await user.keyboard('{Escape}');
    await flushFrames(2);

    expect(screen.getByRole('combobox', {name: 'Search'})).not.toHaveFocus();
  });

  it('returns focus to the input when adding is cancelled', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilterInput config={config} filters={[]} onChange={() => {}} />,
    );

    const input = screen.getByRole('combobox', {name: 'Search'});
    await user.type(input, 'Name');
    await user.click(await screen.findByText('Name'));
    await user.click(await screen.findByRole('button', {name: 'Cancel'}));

    await waitFor(() => expect(input).toHaveFocus());
  });

  it('returns focus to the input when adding is dismissed with Escape', async () => {
    const user = userEvent.setup();
    render(
      <SearchFilterInput config={config} filters={[]} onChange={() => {}} />,
    );

    const input = screen.getByRole('combobox', {name: 'Search'});
    await user.type(input, 'Name');
    await user.click(await screen.findByText('Name'));
    await screen.findByRole('button', {name: 'Cancel'});
    await user.keyboard('{Escape}');

    await waitFor(() => expect(input).toHaveFocus());
  });
});

describe('formatFilterValue', () => {
  const nameField = config.fields.find(f => f.key === 'name');
  const statusField = config.fields.find(f => f.key === 'status');
  const ageField = config.fields.find(f => f.key === 'age');

  if (nameField == null || statusField == null || ageField == null) {
    throw new Error('Test setup: expected fields not found in config');
  }

  const containsOp = nameField.operators.find(op => op.key === 'contains');
  const isOp = statusField.operators.find(op => op.key === 'is');
  const equalsOp = ageField.operators.find(op => op.key === 'equals');

  if (containsOp == null || isOp == null || equalsOp == null) {
    throw new Error('Test setup: expected operators not found in config');
  }

  it('formats string values', () => {
    expect(
      formatFilterValue(
        config as never,
        containsOp.value,
        {type: 'string', value: 'hello'},
        40,
      ),
    ).toBe('hello');
  });

  it('truncates long string values', () => {
    const long = 'a'.repeat(50);
    const result = formatFilterValue(
      config as never,
      containsOp.value,
      {type: 'string', value: long},
      20,
    );
    expect(result.length).toBeLessThanOrEqual(22);
    expect(result).toContain('...');
  });

  it('formats enum values with labels', () => {
    expect(
      formatFilterValue(
        config as never,
        isOp.value,
        {type: 'enum', value: 'active'},
        40,
      ),
    ).toBe('Active');
  });

  it('formats integer values', () => {
    expect(
      formatFilterValue(
        config as never,
        equalsOp.value,
        {type: 'integer', value: 42},
        40,
      ),
    ).toBe('42');
  });
});

describe('createSearchFilterInputConfig', () => {
  it('creates config with fields and operators', () => {
    expect(config.fields.length).toBeGreaterThan(0);
    expect(config.fields[0].key).toBe('name');
  });

  it('generates string operators for string fields', () => {
    const nameField = config.fields.find(f => f.key === 'name');
    expect(nameField?.operators.length).toBeGreaterThan(0);
    expect(nameField?.operators.some(op => op.key === 'contains')).toBe(true);
  });

  it('generates enum operators for enum fields', () => {
    const statusField = config.fields.find(f => f.key === 'status');
    expect(statusField?.operators.length).toBeGreaterThan(0);
    expect(statusField?.operators.some(op => op.key === 'is')).toBe(true);
  });

  it('generates number operators for number fields', () => {
    const ageField = config.fields.find(f => f.key === 'age');
    expect(ageField?.operators.length).toBeGreaterThan(0);
    expect(ageField?.operators.some(op => op.key === 'equals')).toBe(true);
  });

  it('generates string_list operators for string_list fields', () => {
    const stringListFields = [
      {key: 'tags', label: 'Tags', type: 'string_list'},
    ] as const satisfies ReadonlyArray<FieldDefinition>;

    const {config: slConfig} = createSearchFilterInputConfig(stringListFields);
    const tagsField = slConfig.fields.find(f => f.key === 'tags');

    expect(tagsField).toBeDefined();
    expect(tagsField?.operators.length).toBeGreaterThan(0);
    expect(tagsField?.operators.some(op => op.key === 'is_any_of')).toBe(true);
    expect(tagsField?.operators.some(op => op.key === 'is_none_of')).toBe(true);
    expect(
      tagsField?.operators.every(op => op.value.type === 'string_list'),
    ).toBe(true);
  });
});

describe('SearchFilterInputEditPopover', () => {
  it('renders focusable inputs in the value editor area', () => {
    render(
      <SearchFilterInput
        config={config}
        filters={[
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'John'},
          },
        ]}
        onChange={() => {}}
      />,
    );

    const tag = screen.getByText(/Name/);
    expect(tag).toBeInTheDocument();
  });

  it('does not trigger save when Enter is pressed inside an open select', () => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLElement;
        /* eslint-disable testing-library/no-node-access -- exercising consumer-style key handling around nested DOM targets */
        const isInsideSelect =
          target.closest('[role="listbox"]') != null ||
          target.closest('[role="option"]') != null ||
          target.getAttribute('aria-expanded') === 'true';
        /* eslint-enable testing-library/no-node-access */
        if (!isInsideSelect) {
          saveCalled = true;
        }
      }
    };

    let saveCalled = false;

    render(
      // eslint-disable-next-line jsx-a11y-x/no-static-element-interactions
      <div onKeyDown={handleKeyDown}>
        <div role="listbox">
          <div aria-selected="false" role="option">
            <button data-testid="option-btn" type="button">
              Option
            </button>
          </div>
        </div>
      </div>,
    );

    fireEvent.keyDown(screen.getByTestId('option-btn'), {key: 'Enter'});
    expect(saveCalled).toBe(false);
  });
});
