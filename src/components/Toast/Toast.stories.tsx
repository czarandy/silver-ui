import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {HStack} from '../Stack';
import {Toast} from './Toast';
import {ToastViewport} from './ToastViewport';
import {useToast} from './useToast';

const meta: Meta<typeof Toast> = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    autoHideDuration: 5000,
    body: 'Saved successfully',
    isAutoHide: false,
    type: 'info',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function HookStory() {
  const toast = useToast();

  return (
    <HStack gap={2}>
      <Button
        label="Show toast"
        onClick={() => toast({body: 'Saved successfully'})}
      />
      <Button
        label="Show error"
        onClick={() => toast({body: 'Unable to save', type: 'error'})}
        variant="destructive"
      />
    </HStack>
  );
}

export const Default: Story = {
  render: args => <Toast {...args} onDismiss={() => {}} />,
};
export const Error: Story = {
  args: {body: 'Unable to save', type: 'error'},
  render: args => <Toast {...args} onDismiss={() => {}} />,
};
export const Success: Story = {
  args: {body: 'Saved successfully', type: 'success'},
  render: args => <Toast {...args} onDismiss={() => {}} />,
};
export const Warning: Story = {
  args: {body: 'Storage almost full', type: 'warning'},
  render: args => <Toast {...args} onDismiss={() => {}} />,
};
export const WithViewport: Story = {
  render: () => (
    <ToastViewport isTopLayer={false}>
      <HookStory />
    </ToastViewport>
  ),
};
