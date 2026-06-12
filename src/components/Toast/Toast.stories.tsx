import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from 'components/Button';
import {HStack} from 'components/Stack';
import {Toast} from 'components/Toast/Toast';
import {ToastViewport} from 'components/Toast/ToastViewport';
import type {ToastPosition} from 'components/Toast/types';
import {useToast} from 'components/Toast/useToast';

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

function HookStory(): React.JSX.Element {
  const toast = useToast();

  return (
    <HStack gap={2}>
      <Button
        label="Info"
        onClick={() => toast({body: 'Saved successfully'})}
      />
      <Button
        label="Success"
        onClick={() => toast({body: 'Changes published', type: 'success'})}
      />
      <Button
        label="Warning"
        onClick={() => toast({body: 'Storage almost full', type: 'warning'})}
      />
      <Button
        label="Error"
        onClick={() => toast({body: 'Unable to save', type: 'error'})}
        variant="destructive"
      />
    </HStack>
  );
}

function AutoDismissStory(): React.JSX.Element {
  const toast = useToast();
  return (
    <Button
      label="Show auto-dismiss toast"
      onClick={() =>
        toast({
          body: 'This will disappear in 3 seconds',
          autoHideDuration: 3000,
        })
      }
    />
  );
}

function WithEndContentStory(): React.JSX.Element {
  const toast = useToast();
  return (
    <Button
      label="Show with action"
      onClick={() =>
        toast({
          body: 'Item deleted',
          endContent: <Button label="Undo" size="sm" variant="onSolid" />,
        })
      }
    />
  );
}

function PositionsStory(): React.JSX.Element {
  const [position, setPosition] = useState<ToastPosition>('bottomEnd');
  return (
    <ToastViewport position={position}>
      <PositionButtons onChangePosition={setPosition} position={position} />
    </ToastViewport>
  );
}

function PositionButtons({
  position,
  onChangePosition,
}: {
  onChangePosition: (p: ToastPosition) => void;
  position: ToastPosition;
}): React.JSX.Element {
  const toast = useToast();
  const positions: ToastPosition[] = [
    'topStart',
    'topEnd',
    'bottomStart',
    'bottomEnd',
  ];
  return (
    <HStack gap={2}>
      {positions.map(p => (
        <Button
          key={p}
          label={p}
          onClick={() => {
            onChangePosition(p);
            requestAnimationFrame(() => toast({body: `Position: ${p}`}));
          }}
          variant={p === position ? 'primary' : 'secondary'}
        />
      ))}
    </HStack>
  );
}

export const Default: Story = {
  render: (args): React.JSX.Element => <Toast {...args} onDismiss={() => {}} />,
};

export const Error: Story = {
  args: {body: 'Unable to save', type: 'error'},
  render: (args): React.JSX.Element => <Toast {...args} onDismiss={() => {}} />,
};

export const Success: Story = {
  args: {body: 'Saved successfully', type: 'success'},
  render: (args): React.JSX.Element => <Toast {...args} onDismiss={() => {}} />,
};

export const Warning: Story = {
  args: {body: 'Storage almost full', type: 'warning'},
  render: (args): React.JSX.Element => <Toast {...args} onDismiss={() => {}} />,
};

export const WithViewport: Story = {
  render: (): React.JSX.Element => (
    <ToastViewport>
      <HookStory />
    </ToastViewport>
  ),
};

export const AutoDismiss: Story = {
  render: (): React.JSX.Element => (
    <ToastViewport>
      <AutoDismissStory />
    </ToastViewport>
  ),
};

export const WithEndContent: Story = {
  render: (): React.JSX.Element => (
    <ToastViewport>
      <WithEndContentStory />
    </ToastViewport>
  ),
};

export const Positions: Story = {
  render: (): React.JSX.Element => <PositionsStory />,
};
