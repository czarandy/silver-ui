import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {RadioList} from './RadioList';
import {RadioListItem} from './RadioListItem';

function RadioListStory(args: React.ComponentProps<typeof RadioList>) {
  const [value, setValue] = useState(args.value);

  return (
    <RadioList {...args} onChange={setValue} value={value}>
      <RadioListItem
        description="Best for detailed updates."
        label="Email"
        value="email"
      />
      <RadioListItem label="SMS" value="sms" />
      <RadioListItem label="Push" value="push" />
    </RadioList>
  );
}

const meta: Meta<typeof RadioList> = {
  title: 'Components/RadioList',
  component: RadioList,
  args: {
    label: 'Notification preference',
    description: 'Choose one delivery channel.',
    value: 'email',
  },
  render: args => <RadioListStory {...args} />,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Horizontal: Story = {args: {orientation: 'horizontal'}};
export const Error: Story = {
  args: {status: {message: 'Select a notification preference.', type: 'error'}},
};
