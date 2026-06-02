import type {Meta, StoryObj} from '@storybook/react-vite';
import {User} from 'lucide-react';
import {useState} from 'react';
import {Select, type SelectProps} from './Select';
import {SelectOption} from './SelectOption';

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Assignee',
    options: [
      {label: 'Ada Lovelace', value: 'ada'},
      {label: 'Grace Hopper', value: 'grace'},
      {label: 'Katherine Johnson', value: 'katherine'},
    ],
    placeholder: 'Select a person',
  },
} satisfies Meta<SelectProps>;

export default meta;
type Story = StoryObj<SelectProps>;

function SelectStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>('ada');
  return <Select {...args} hasClear onChange={setValue} value={value} />;
}

export const Default: Story = {
  render: (args: SelectProps) => <SelectStory {...args} />,
};
export const Searchable: Story = {
  args: {hasSearch: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};
export const CustomOptions: Story = {
  render: (args: SelectProps) => (
    <Select {...args} hasSearch value="ada">
      {option => (
        <SelectOption
          description={`${option.value}@example.com`}
          icon={User}
          label={option.label ?? option.value}
        />
      )}
    </Select>
  ),
};
