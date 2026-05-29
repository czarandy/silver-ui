import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {VStack} from '../Stack';
import {Switch} from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    description: 'Receive product updates and account alerts.',
    isSelected: true,
    label: 'Notifications',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function SwitchStory(args: React.ComponentProps<typeof Switch>) {
  const [isSelected, setIsSelected] = useState(args.isSelected);
  return <Switch {...args} isSelected={isSelected} onChange={setIsSelected} />;
}

export const Default: Story = {
  render: args => <SwitchStory {...args} />,
};
export const States: Story = {
  render: () => (
    <VStack gap={4}>
      <Switch isSelected={false} label="Off" />
      <Switch isSelected label="On" />
      <Switch isDisabled isSelected={false} label="Disabled" />
      <Switch isLoading isSelected label="Loading" />
    </VStack>
  ),
};
export const Error: Story = {
  args: {status: {message: 'This setting is required.', type: 'error'}},
  render: args => <SwitchStory {...args} />,
};
