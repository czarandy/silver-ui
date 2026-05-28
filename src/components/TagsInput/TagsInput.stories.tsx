import type {Meta, StoryObj} from '@storybook/react-vite';
import {Users} from 'lucide-react';
import {useMemo, useState} from 'react';
import {createStaticSource, type SearchableItem} from '../Combobox';
import {TagsInput} from './TagsInput';

const people: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
];

const meta: Meta<typeof TagsInput> = {
  title: 'Components/TagsInput',
  component: TagsInput,
  args: {label: 'Team', placeholder: 'Search people'},
};

export default meta;
type Story = StoryObj<typeof meta>;

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
      startIcon={<Users />}
      value={value}
    />
  );
}

export const Default: Story = {
  render: args => <TagsInputStory {...args} />,
};
export const Creatable: Story = {
  args: {hasCreate: true, value: []},
  render: args => <TagsInputStory {...args} />,
};
