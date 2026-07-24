import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';
import {CopyButton} from 'components/CopyButton/CopyButton';
import {HStack} from 'components/Stack';

const meta = {
  title: 'Components/CopyButton',
  component: CopyButton,
  args: {
    onCopy: fn(),
    value: 'sk_live_51ABC123',
  },
} satisfies Meta<typeof CopyButton>;

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {};

export const LazyValue: Story = {
  args: {
    value: () => 'value resolved when clicked',
  },
};

export const CustomLabels: Story = {
  args: {
    copiedLabel: 'API key copied',
    copyLabel: 'Copy API key',
    errorMessage: 'Could not copy API key',
  },
};

export const States: Story = {
  render: args => (
    <HStack gap={3}>
      <CopyButton {...args} />
      <CopyButton {...args} isDisabled />
    </HStack>
  ),
};
