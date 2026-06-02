import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {VStack} from '../Stack';
import {Switch, type SwitchProps} from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    description: 'Receive product updates and account alerts.',
    isSelected: true,
    label: 'Notifications',
  },
} satisfies Meta<SwitchProps>;

export default meta;
type Story = StoryObj<SwitchProps>;

function SwitchStory(args: React.ComponentProps<typeof Switch>) {
  const [isSelected, setIsSelected] = useState(args.isSelected);
  return <Switch {...args} isSelected={isSelected} onChange={setIsSelected} />;
}

export const Default: Story = {
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};
export const States: Story = {
  render: () => (
    <VStack gap={4}>
      <Switch isSelected={false} label="Off" onChange={() => {}} />
      <Switch isSelected label="On" onChange={() => {}} />
      <Switch
        isDisabled
        isSelected={false}
        label="Disabled"
        onChange={() => {}}
      />
      <Switch isLoading isSelected label="Loading" onChange={() => {}} />
    </VStack>
  ),
};
export const Error: Story = {
  args: {status: {message: 'This setting is required.', type: 'error'}},
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};
