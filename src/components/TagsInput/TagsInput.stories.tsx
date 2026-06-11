import type {Meta, StoryObj} from '@storybook/react-vite';
import {Users} from 'lucide-react';
import {useMemo, useState} from 'react';
import {
  createStaticSearchSource,
  type SearchableItem,
  type SearchSource,
} from '../AutocompleteInput';
import {TagsInput, type TagsInputProps} from './TagsInput';

const people: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
  {id: 'margaret', label: 'Margaret Hamilton'},
  {id: 'hedy', label: 'Hedy Lamarr'},
];

function createAsyncSource<T extends SearchableItem>(
  items: T[],
  delayMs = 700,
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

function TagsInputStory(
  args: React.ComponentProps<typeof TagsInput>,
): React.JSX.Element {
  const [value, setValue] = useState<SearchableItem[]>([people[0]]);
  const source = useMemo(() => createStaticSearchSource(people), []);
  return (
    <TagsInput
      {...args}
      debounceMs={0}
      hasEntriesOnFocus
      onChange={(items, change) => {
        setValue(items);
        args.onChange(items, change);
      }}
      searchSource={source}
      startIcon={Users}
      value={value}
    />
  );
}

function EmptyTagsInputStory(
  args: React.ComponentProps<typeof TagsInput>,
): React.JSX.Element {
  const [value, setValue] = useState<SearchableItem[]>([]);
  const source = useMemo(() => createStaticSearchSource(people), []);
  return (
    <TagsInput
      {...args}
      debounceMs={0}
      hasEntriesOnFocus
      onChange={(items, change) => {
        setValue(items);
        args.onChange(items, change);
      }}
      searchSource={source}
      startIcon={Users}
      value={value}
    />
  );
}

const meta = {
  title: 'Components/TagsInput',
  component: TagsInput,
  args: {label: 'Team', onChange: () => {}, placeholder: 'Search people'},
  render: (args: TagsInputProps): React.JSX.Element => (
    <TagsInputStory {...args} />
  ),
} satisfies Meta<TagsInputProps>;

export default meta;
type Story = StoryObj<TagsInputProps>;

export const Default: Story = {};

export const Empty: Story = {
  render: (args: TagsInputProps): React.JSX.Element => (
    <EmptyTagsInputStory {...args} />
  ),
};

export const Creatable: Story = {
  args: {hasCreate: true},
};

export const WithClear: Story = {
  args: {hasClear: true},
};

function AsyncSearchStory(
  args: React.ComponentProps<typeof TagsInput>,
): React.JSX.Element {
  const [value, setValue] = useState<SearchableItem[]>([]);
  const source = useMemo(() => createAsyncSource(people), []);
  return (
    <TagsInput
      {...args}
      debounceMs={0}
      onChange={(items, change) => {
        setValue(items);
        args.onChange(items, change);
      }}
      searchSource={source}
      startIcon={Users}
      value={value}
    />
  );
}

export const AsyncSearch: Story = {
  render: (args: TagsInputProps): React.JSX.Element => (
    <AsyncSearchStory {...args} />
  ),
};

export const MaxEntries: Story = {
  args: {maxEntries: 2},
};

export const Disabled: Story = {
  args: {isDisabled: true},
};

// `hasClear` is set to show that read-only suppresses the clear button (and
// typing) without applying the disabled opacity.
export const ReadOnly: Story = {
  args: {hasClear: true, isReadOnly: true},
};

export const Small: Story = {
  args: {size: 'sm'},
};

export const Large: Story = {
  args: {size: 'lg'},
};

export const Required: Story = {
  args: {isRequired: true},
};

export const Error: Story = {
  args: {
    status: {message: 'At least one team member is required.', type: 'error'},
  },
};

export const Warning: Story = {
  args: {
    status: {message: 'This team has limited capacity.', type: 'warning'},
  },
};

function OverflowInlineStory(
  args: React.ComponentProps<typeof TagsInput>,
): React.JSX.Element {
  const [val, setVal] = useState<SearchableItem[]>(people.slice(0, 4));
  const source = useMemo(() => createStaticSearchSource(people), []);
  return (
    <div style={{maxWidth: 400}}>
      <TagsInput
        {...args}
        debounceMs={0}
        hasEntriesOnFocus
        onChange={(items, change) => {
          setVal(items);
          args.onChange(items, change);
        }}
        searchSource={source}
        tagOverflowBehavior="unfocusedInline"
        value={val}
      />
    </div>
  );
}

export const OverflowInline: Story = {
  render: (args: TagsInputProps): React.JSX.Element => (
    <OverflowInlineStory {...args} />
  ),
};

function OverflowBehaviorsStory(
  args: React.ComponentProps<typeof TagsInput>,
): React.JSX.Element {
  const [inlineValue, setInlineValue] = useState<SearchableItem[]>(
    people.slice(0, 5),
  );
  const [popoverValue, setPopoverValue] = useState<SearchableItem[]>(
    people.slice(0, 5),
  );
  const source = useMemo(() => createStaticSearchSource(people), []);

  return (
    <div
      style={{
        display: 'grid',
        gap: 24,
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        maxWidth: 720,
      }}>
      <TagsInput
        {...args}
        debounceMs={0}
        hasEntriesOnFocus
        label="Inline overflow"
        onChange={(items, change) => {
          setInlineValue(items);
          args.onChange(items, change);
        }}
        searchSource={source}
        startIcon={Users}
        tagOverflowBehavior="unfocusedInline"
        value={inlineValue}
      />
      <TagsInput
        {...args}
        debounceMs={0}
        hasEntriesOnFocus
        label="Popover overflow"
        onChange={(items, change) => {
          setPopoverValue(items);
          args.onChange(items, change);
        }}
        searchSource={source}
        startIcon={Users}
        tagOverflowBehavior="unfocusedLayer"
        value={popoverValue}
      />
    </div>
  );
}

export const OverflowBehaviors: Story = {
  render: (args: TagsInputProps): React.JSX.Element => (
    <OverflowBehaviorsStory {...args} />
  ),
};
