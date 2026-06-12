/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {
  SearchFilterInput,
  useSearchFilterInputConfig,
  type SearchFilterInputComponents,
  type SearchFilterInputEditorProps,
  type SearchFilterInputFilter,
  type SearchFilterInputProps,
  type SearchFilterInputTagProps,
} from 'components/SearchFilterInput/index';
import type {EnumItem} from 'components/SearchFilterInput/types';

const meta = {
  title: 'Components/SearchFilterInput',
  component: SearchFilterInput,
} satisfies Meta<SearchFilterInputProps>;

export default meta;
type Story = StoryObj<SearchFilterInputProps>;

const STATUSES: ReadonlyArray<EnumItem> = [
  {label: 'Active', value: 'active'},
  {label: 'Inactive', value: 'inactive'},
  {label: 'Pending', value: 'pending'},
];

const PRIORITIES: ReadonlyArray<EnumItem> = [
  {label: 'Low', value: 'low'},
  {label: 'Medium', value: 'medium'},
  {label: 'High', value: 'high'},
  {label: 'Critical', value: 'critical'},
];

const basicFields = [
  {key: 'name', label: 'Name', type: 'string'},
  {key: 'status', label: 'Status', type: 'enum', enumValues: STATUSES},
  {key: 'age', label: 'Age', type: 'number'},
] as const;

export const Default: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <SearchFilterInput
        config={config}
        filters={filters}
        onChange={next => setFilters(next)}
      />
    );
  },
};

export const WithPrePopulated: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([
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
    ]);
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <SearchFilterInput
        config={config}
        filters={filters}
        onChange={next => setFilters(next)}
      />
    );
  },
};

export const AllFieldTypes: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const {config} = useSearchFilterInputConfig([
      {key: 'name', label: 'Name', type: 'string'},
      {key: 'tags', label: 'Tags', type: 'string_list'},
      {key: 'count', label: 'Count', type: 'number'},
      {key: 'active', label: 'Active', type: 'boolean'},
      {key: 'created', label: 'Created', type: 'date'},
      {key: 'status', label: 'Status', type: 'enum', enumValues: STATUSES},
      {
        key: 'priority',
        label: 'Priority',
        type: 'enum_list',
        enumValues: PRIORITIES,
      },
    ] as const);

    return (
      <SearchFilterInput
        config={config}
        filters={filters}
        onChange={next => setFilters(next)}
      />
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [smFilters, setSmFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const [mdFilters, setMdFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const [lgFilters, setLgFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <SearchFilterInput
          config={config}
          filters={smFilters}
          label="Small"
          onChange={next => setSmFilters(next)}
          placeholder="Small..."
          size="sm"
        />
        <SearchFilterInput
          config={config}
          filters={mdFilters}
          label="Medium"
          onChange={next => setMdFilters(next)}
          placeholder="Medium..."
          size="md"
        />
        <SearchFilterInput
          config={config}
          filters={lgFilters}
          label="Large"
          onChange={next => setLgFilters(next)}
          placeholder="Large..."
          size="lg"
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => {
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <SearchFilterInput
        config={config}
        filters={[
          {
            field: 'name',
            operator: 'contains',
            value: {type: 'string', value: 'John'},
          },
        ]}
        isDisabled
        onChange={() => {}}
      />
    );
  },
};

export const ReadOnly: Story = {
  render: () => {
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
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
        isReadOnly
        onChange={() => {}}
      />
    );
  },
};

export const WithResultCount: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <SearchFilterInput
        config={config}
        filters={filters}
        onChange={next => setFilters(next)}
        resultCount={42}
      />
    );
  },
};

export const WithVisibleLabel: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <SearchFilterInput
        config={config}
        filters={filters}
        isLabelHidden={false}
        label="Filter users"
        onChange={next => setFilters(next)}
      />
    );
  },
};

export const WithErrorStatus: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([]);
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <SearchFilterInput
        config={config}
        filters={filters}
        onChange={next => setFilters(next)}
        status={{type: 'error', message: 'At least one filter is required'}}
      />
    );
  },
};

export const WithManyFilters: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([
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
        field: 'status',
        operator: 'is',
        value: {type: 'enum', value: 'pending'},
      },
      {
        field: 'age',
        operator: 'equals',
        value: {type: 'integer', value: 30},
      },
      {
        field: 'name',
        operator: 'contains',
        value: {type: 'string', value: 'Charlie'},
      },
    ]);
    const {config} = useSearchFilterInputConfig(basicFields);

    return (
      <div style={{maxWidth: 600}}>
        <SearchFilterInput
          config={config}
          filters={filters}
          onChange={next => setFilters(next)}
          tagOverflowBehavior="unfocusedInline"
        />
      </div>
    );
  },
};

const STATUS_COLORS: Record<string, string> = {
  active: '#16a34a',
  inactive: '#6b7280',
  pending: '#d97706',
};

/**
 * Custom tag renderer for enum filters: a colored status pill instead of the
 * default tag.
 */
function StatusBadgeTag({
  filter,
  onClick,
  onRemove,
}: SearchFilterInputTagProps): React.JSX.Element {
  const value = filter.value.type === 'enum' ? filter.value.value : '';
  const label = STATUSES.find(status => status.value === value)?.label ?? value;
  const color = STATUS_COLORS[value] ?? '#6b7280';
  return (
    <span
      style={{
        alignItems: 'center',
        background: `${color}1a`,
        border: `1px solid ${color}`,
        borderRadius: 999,
        display: 'inline-flex',
        gap: 6,
        padding: '2px 8px',
      }}>
      <span
        style={{background: color, borderRadius: 999, height: 8, width: 8}}
      />
      <button
        onClick={onClick}
        style={{
          background: 'none',
          border: 'none',
          color,
          cursor: 'pointer',
          font: 'inherit',
        }}
        type="button">
        {label}
      </button>
      {onRemove != null ? (
        <button
          aria-label="Remove status filter"
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            color,
            cursor: 'pointer',
            fontSize: 14,
          }}
          type="button">
          ×
        </button>
      ) : null}
    </span>
  );
}

/**
 * Custom editor for enum filters: replaces the whole edit popover with a simple
 * one-click status picker that commits via onSave.
 */
function StatusPickerEditor({
  filter,
  onCancel,
  onSave,
}: SearchFilterInputEditorProps): React.JSX.Element {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        minWidth: 180,
        padding: 12,
      }}>
      <strong>Pick a status</strong>
      {STATUSES.map(status => (
        <button
          key={status.value}
          onClick={() => {
            if (filter.operator != null) {
              onSave({
                field: filter.field,
                operator: filter.operator,
                value: {type: 'enum', value: status.value},
              });
            }
          }}
          type="button">
          {status.label}
        </button>
      ))}
      <button onClick={onCancel} type="button">
        Cancel
      </button>
    </div>
  );
}

export const WithCustomComponents: Story = {
  render: () => {
    const [filters, setFilters] = useState<
      ReadonlyArray<SearchFilterInputFilter>
    >([
      {
        field: 'status',
        operator: 'is',
        value: {type: 'enum', value: 'active'},
      },
    ]);
    const {config} = useSearchFilterInputConfig(basicFields);

    // Override the tag and editor for the `enum` value type only; all other
    // field types keep the default rendering. Click the pill to open the custom
    // editor.
    const components: SearchFilterInputComponents = {
      enum: {Editor: StatusPickerEditor, Tag: StatusBadgeTag},
    };

    return (
      <SearchFilterInput
        components={components}
        config={config}
        filters={filters}
        onChange={next => setFilters(next)}
      />
    );
  },
};

export const WithTimezone: Story = {
  render: () => {
    const {config} = useSearchFilterInputConfig([
      {key: 'created', label: 'Created', type: 'date'},
    ] as const);

    // A single fixed instant (2026-01-15 12:00 UTC). Each input below renders
    // the same filter with a different timezoneID, so the tag's formatted
    // date/time differs per zone.
    const unixSeconds = Math.floor(
      Temporal.Instant.from('2026-01-15T12:00:00Z').epochMilliseconds / 1000,
    );
    const filters: ReadonlyArray<SearchFilterInputFilter> = [
      {
        field: 'created',
        operator: 'after',
        value: {type: 'date_absolute', unixSeconds},
      },
    ];
    const timezones = [
      'America/Los_Angeles',
      'America/New_York',
      'Europe/London',
      'Asia/Tokyo',
    ];

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        {timezones.map(timezone => (
          <SearchFilterInput
            config={config}
            filters={filters}
            isLabelHidden={false}
            key={timezone}
            label={timezone}
            onChange={() => {}}
            timezoneID={timezone}
          />
        ))}
      </div>
    );
  },
};
