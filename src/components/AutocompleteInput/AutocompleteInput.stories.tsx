/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {Search, User} from 'lucide-react';
import {useMemo, useState} from 'react';
import {
  AutocompleteInput,
  type AutocompleteInputProps,
} from './AutocompleteInput';
import {AutocompleteInputItem} from './AutocompleteInputItem';
import {BaseAutocompleteInput} from './BaseAutocompleteInput';
import {
  createStaticSource,
  type SearchableItem,
  type SearchSource,
} from './types';

const people: SearchableItem<{role: string}>[] = [
  {id: 'ada', label: 'Ada Lovelace', auxiliaryData: {role: 'Mathematician'}},
  {id: 'grace', label: 'Grace Hopper', auxiliaryData: {role: 'Engineer'}},
  {
    id: 'katherine',
    label: 'Katherine Johnson',
    auxiliaryData: {role: 'Physicist'},
  },
];

const manyPeople: SearchableItem<{role: string}>[] = [
  ...people,
  {
    id: 'alan',
    label: 'Alan Turing',
    auxiliaryData: {role: 'Computer scientist'},
  },
  {
    id: 'annie',
    label: 'Annie Easley',
    auxiliaryData: {role: 'Computer scientist'},
  },
  {
    id: 'dorothy',
    label: 'Dorothy Vaughan',
    auxiliaryData: {role: 'Mathematician'},
  },
  {id: 'hedy', label: 'Hedy Lamarr', auxiliaryData: {role: 'Inventor'}},
  {id: 'mary', label: 'Mary Jackson', auxiliaryData: {role: 'Engineer'}},
  {
    id: 'radia',
    label: 'Radia Perlman',
    auxiliaryData: {role: 'Computer scientist'},
  },
  {
    id: 'sister-mary',
    label: 'Sister Mary Kenneth Keller',
    auxiliaryData: {role: 'Computer scientist'},
  },
  {id: 'valerie', label: 'Valerie Thomas', auxiliaryData: {role: 'Inventor'}},
  {id: 'wang', label: 'Wang Zhenyi', auxiliaryData: {role: 'Astronomer'}},
];

function createAsyncSource<T extends SearchableItem>(
  items: T[],
  delayMs = 500,
): SearchSource<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return {
    bootstrap: () => items.slice(0, 5),
    cancel: () => {
      if (timeout != null) {
        clearTimeout(timeout);
      }
    },
    search: async query =>
      new Promise(resolve => {
        timeout = setTimeout(() => {
          const normalizedQuery = query.trim().toLowerCase();
          resolve(
            items.filter(item =>
              item.label.toLowerCase().includes(normalizedQuery),
            ),
          );
        }, delayMs);
      }),
  };
}

const meta = {
  title: 'Components/AutocompleteInput',
  component: AutocompleteInput,
  args: {label: 'Assignee', placeholder: 'Search people'},
} satisfies Meta<AutocompleteInputProps>;

export default meta;
type Story = StoryObj<AutocompleteInputProps>;

function AutocompleteInputStory(
  args: React.ComponentProps<typeof AutocompleteInput>,
) {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const source = useMemo(() => createStaticSource(people), []);
  return (
    <AutocompleteInput
      {...args}
      debounceMs={0}
      hasEntriesOnFocus
      onChange={setValue}
      searchSource={source}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args: AutocompleteInputProps) => (
    <AutocompleteInputStory {...args} />
  ),
};

function CustomItemsStory(
  args: React.ComponentProps<typeof AutocompleteInput>,
) {
  const [value, setValue] = useState<SearchableItem<{role: string}> | null>(
    null,
  );
  const source = useMemo(() => createStaticSource(people), []);
  return (
    <AutocompleteInput
      {...args}
      debounceMs={0}
      hasEntriesOnFocus
      onChange={setValue}
      renderItem={item => (
        <AutocompleteInputItem
          description={item.auxiliaryData?.role}
          icon={User}
          item={item}
        />
      )}
      searchSource={source}
      value={value}
    />
  );
}

export const CustomItems: Story = {
  render: (args: AutocompleteInputProps) => <CustomItemsStory {...args} />,
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: AutocompleteInputProps) => (
    <AutocompleteInputStory {...args} />
  ),
};

export const ValidationStatus: Story = {
  args: {
    status: {message: 'Choose an assignee before continuing.', type: 'error'},
  },
  render: (args: AutocompleteInputProps) => (
    <AutocompleteInputStory {...args} />
  ),
};

export const WithStartIcon: Story = {
  args: {startIcon: Search},
  render: (args: AutocompleteInputProps) => (
    <AutocompleteInputStory {...args} />
  ),
};

export const PreSelectedValue: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem<{role: string}> | null>(
      people[1],
    );
    const source = useMemo(() => createStaticSource(people), []);
    return (
      <AutocompleteInput
        {...args}
        debounceMs={0}
        hasEntriesOnFocus
        onChange={setValue}
        searchSource={source}
        value={value}
      />
    );
  },
};

export const WithoutClearButton: Story = {
  args: {hasClear: false},
  render: args => {
    const [value, setValue] = useState<SearchableItem<{role: string}> | null>(
      people[0],
    );
    const source = useMemo(() => createStaticSource(people), []);
    return (
      <AutocompleteInput
        {...args}
        debounceMs={0}
        onChange={setValue}
        searchSource={source}
        value={value}
      />
    );
  },
};

export const Sizes: Story = {
  render: args => {
    const source = useMemo(() => createStaticSource(people), []);
    const [small, setSmall] = useState<SearchableItem | null>(null);
    const [medium, setMedium] = useState<SearchableItem | null>(null);
    const [large, setLarge] = useState<SearchableItem | null>(null);
    return (
      <div style={{display: 'grid', gap: 16}}>
        <AutocompleteInput
          {...args}
          debounceMs={0}
          label="Small"
          onChange={setSmall}
          searchSource={source}
          size="sm"
          value={small}
        />
        <AutocompleteInput
          {...args}
          debounceMs={0}
          label="Medium"
          onChange={setMedium}
          searchSource={source}
          value={medium}
        />
        <AutocompleteInput
          {...args}
          debounceMs={0}
          label="Large"
          onChange={setLarge}
          searchSource={source}
          size="lg"
          value={large}
        />
      </div>
    );
  },
};

export const AsyncSearchSource: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    const source = useMemo(() => createAsyncSource(manyPeople), []);
    return (
      <AutocompleteInput
        {...args}
        debounceMs={200}
        onChange={setValue}
        searchSource={source}
        value={value}
      />
    );
  },
};

export const EmptySearchResults: Story = {
  args: {emptySearchResultsText: 'No people match your search.'},
  render: (args: AutocompleteInputProps) => (
    <AutocompleteInputStory {...args} />
  ),
};

export const WithDescriptionAndTooltip: Story = {
  args: {
    description: 'Search by name or role.',
    labelTooltip: 'Only active project members are shown.',
  },
  render: (args: AutocompleteInputProps) => (
    <AutocompleteInputStory {...args} />
  ),
};

export const BaseAutocompleteInputStandalone: Story = {
  render: () => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    const source = useMemo(() => createStaticSource(people), []);
    return (
      <BaseAutocompleteInput
        debounceMs={0}
        hasEntriesOnFocus
        onChange={setValue}
        placeholder="Search people"
        searchSource={source}
        value={value}
      />
    );
  },
};

export const LargeItemList: Story = {
  render: args => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    const source = useMemo(() => createStaticSource(manyPeople), []);
    return (
      <AutocompleteInput
        {...args}
        debounceMs={0}
        hasEntriesOnFocus
        maxMenuItems={12}
        onChange={setValue}
        searchSource={source}
        value={value}
      />
    );
  },
};

export const RequiredAndOptional: Story = {
  render: args => {
    const source = useMemo(() => createStaticSource(people), []);
    const [required, setRequired] = useState<SearchableItem | null>(null);
    const [optional, setOptional] = useState<SearchableItem | null>(null);
    return (
      <div style={{display: 'grid', gap: 16}}>
        <AutocompleteInput
          {...args}
          debounceMs={0}
          isRequired
          label="Required assignee"
          onChange={setRequired}
          searchSource={source}
          value={required}
        />
        <AutocompleteInput
          {...args}
          debounceMs={0}
          isOptional
          label="Optional reviewer"
          onChange={setOptional}
          searchSource={source}
          value={optional}
        />
      </div>
    );
  },
};
