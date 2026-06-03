/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import type {EnumItem} from './types';
import {
  SearchFilterInput,
  useSearchFilterInputConfig,
  type SearchFilterInputFilter,
  type SearchFilterInputProps,
} from './index';

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
