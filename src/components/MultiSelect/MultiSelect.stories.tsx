import type {Meta, StoryObj} from '@storybook/react-vite';
import {Columns3} from 'lucide-react';
import {useState} from 'react';
import {MultiSelect} from './MultiSelect';

const options = [
  {label: 'Name', value: 'name'},
  {label: 'Email', value: 'email'},
  {label: 'Role', value: 'role'},
  {label: 'Status', value: 'status'},
];

const meta: Meta<typeof MultiSelect> = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  args: {label: 'Columns', options, placeholder: 'Select columns'},
};

export default meta;
type Story = StoryObj<typeof meta>;

function MultiSelectStory(args: React.ComponentProps<typeof MultiSelect>) {
  const [value, setValue] = useState<string[]>(['name', 'email']);
  return (
    <MultiSelect
      {...args}
      hasClear
      onChange={setValue}
      startIcon={<Columns3 />}
      value={value}
    />
  );
}

export const Default: Story = {
  render: args => <MultiSelectStory {...args} />,
};
export const Searchable: Story = {
  args: {hasSearch: true},
  render: args => <MultiSelectStory {...args} />,
};
export const Badges: Story = {
  args: {triggerDisplay: 'badges'},
  render: args => <MultiSelectStory {...args} />,
};
export const SelectAll: Story = {
  args: {hasSelectAll: true},
  render: args => <MultiSelectStory {...args} />,
};
