import type {Meta, StoryObj} from '@storybook/react-vite';
import {Users} from 'lucide-react';
import {useMemo, useState} from 'react';
import {createStaticSource, type SearchableItem} from '../Combobox';
import {TagsInput, type TagsInputProps} from './TagsInput';

const people: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
  {id: 'margaret', label: 'Margaret Hamilton'},
  {id: 'hedy', label: 'Hedy Lamarr'},
];

function TagsInputStory(
  args: React.ComponentProps<typeof TagsInput>,
): React.JSX.Element {
  const [value, setValue] = useState<SearchableItem[]>([people[0]]);
  const source = useMemo(() => createStaticSource(people), []);
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
  const source = useMemo(() => createStaticSource(people), []);
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
  args: {label: 'Team', placeholder: 'Search people'},
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

export const MaxEntries: Story = {
  args: {maxEntries: 2},
};

export const Disabled: Story = {
  args: {isDisabled: true},
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
  const source = useMemo(() => createStaticSource(people), []);
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
