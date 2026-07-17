import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, ShieldCheck} from 'lucide-react';
import {useState} from 'react';
import {VStack} from 'components/Stack';
import {Switch, type SwitchProps} from 'components/Switch/Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    description: 'Receive product updates and account alerts.',
    htmlName: 'notifications',
    isSelected: true,
    label: 'Notifications',
  },
} satisfies Meta<SwitchProps>;

export default meta;
type Story = StoryObj<SwitchProps>;

function SwitchStory(args: React.ComponentProps<typeof Switch>) {
  const [isSelected, setIsSelected] = useState(args.isSelected);
  const onChange = args.onChange as SwitchProps['onChange'] | undefined;
  return (
    <Switch
      {...args}
      isSelected={isSelected}
      onChange={(nextIsSelected, event) => {
        setIsSelected(nextIsSelected);
        onChange?.(nextIsSelected, event);
      }}
    />
  );
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
      <Switch
        isDisabled
        isLoading
        isSelected
        label="Disabled loading"
        onChange={() => {}}
      />
      <Switch
        isLoading
        isSelected={false}
        label="Loading off"
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

export const LabelStart: Story = {
  args: {
    labelPosition: 'start',
    label: 'Sync automatically',
  },
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};

export const Spread: Story = {
  args: {
    label: 'Require approval',
    labelPosition: 'start',
    labelSpacing: 'spread',
    style: {width: 360},
  },
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};

export const HiddenLabel: Story = {
  args: {
    description: undefined,
    isLabelHidden: true,
    label: 'Enable notifications',
  },
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};

export const LabelIcon: Story = {
  args: {
    label: 'Security alerts',
    labelIcon: ShieldCheck,
  },
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};

export const LabelTooltip: Story = {
  args: {
    label: 'Marketing emails',
    labelTooltip: 'Used for product announcements and lifecycle emails.',
  },
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};

export const Necessity: Story = {
  render: () => (
    <VStack gap={4}>
      <Switch
        isRequired
        isSelected
        label="Required setting"
        onChange={() => {}}
      />
      <Switch
        isOptional
        isSelected={false}
        label="Optional setting"
        onChange={() => {}}
      />
    </VStack>
  ),
};

export const Description: Story = {
  render: () => (
    <VStack gap={4}>
      <Switch isSelected label="Compact setting" onChange={() => {}} />
      <Switch
        description="This longer description explains when the setting applies and wraps onto multiple lines in constrained layouts."
        isSelected
        label="Detailed setting"
        onChange={() => {}}
        style={{maxWidth: 360}}
      />
    </VStack>
  ),
};

export const Warning: Story = {
  args: {
    labelIcon: Bell,
    status: {
      message: 'Notification delivery may be delayed.',
      type: 'warning',
    },
  },
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};

export const Success: Story = {
  args: {
    status: {
      message: 'This setting is active and healthy.',
      type: 'success',
    },
  },
  render: (args: SwitchProps) => <SwitchStory {...args} />,
};
