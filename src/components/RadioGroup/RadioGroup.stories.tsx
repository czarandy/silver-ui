import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {RadioGroup, type RadioGroupProps} from './RadioGroup';
import {RadioGroupItem} from './RadioGroupItem';

function RadioGroupStory(args: React.ComponentProps<typeof RadioGroup>) {
  const [value, setValue] = useState(args.value);

  return (
    <RadioGroup {...args} onChange={setValue} value={value}>
      <RadioGroupItem
        description="Best for detailed updates."
        label="Email"
        value="email"
      />
      <RadioGroupItem label="SMS" value="sms" />
      <RadioGroupItem label="Push" value="push" />
    </RadioGroup>
  );
}

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  args: {
    label: 'Notification preference',
    description: 'Choose one delivery channel.',
    value: 'email',
  },
  render: (args: RadioGroupProps) => <RadioGroupStory {...args} />,
} satisfies Meta<RadioGroupProps>;

export default meta;
type Story = StoryObj<RadioGroupProps>;

export const Default: Story = {};
export const Horizontal: Story = {args: {orientation: 'horizontal'}};
export const Error: Story = {
  args: {status: {message: 'Select a notification preference.', type: 'error'}},
};
