import type {Meta, StoryObj} from '@storybook/react-vite';
import {Users} from 'lucide-react';
import {useMemo, useState} from 'react';
import {createStaticSource, type SearchableItem} from '../Combobox';
import {TagsInput, type TagsInputProps} from './TagsInput';

const people: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
];

const meta = {
  title: 'Components/TagsInput',
  component: TagsInput,
  args: {label: 'Team', placeholder: 'Search people'},
} satisfies Meta<TagsInputProps>;

export default meta;
type Story = StoryObj<TagsInputProps>;

function TagsInputStory(args: React.ComponentProps<typeof TagsInput>) {
  const [value, setValue] = useState<SearchableItem[]>([people[0]]);
  const source = useMemo(() => createStaticSource(people), []);
  return (
    <TagsInput
      {...args}
      debounceMs={0}
      hasEntriesOnFocus
      onChange={setValue}
      searchSource={source}
      startIcon={Users}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args: TagsInputProps) => <TagsInputStory {...args} />,
};
export const Creatable: Story = {
  args: {hasCreate: true, value: []},
  render: (args: TagsInputProps) => <TagsInputStory {...args} />,
};
