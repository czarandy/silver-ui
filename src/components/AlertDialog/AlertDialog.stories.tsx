import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from '../Button';
import {AlertDialog} from './AlertDialog';
import {useAlertDialog} from './useAlertDialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
  args: {
    actionLabel: 'Delete',
    description: 'This action cannot be undone.',
    title: 'Delete item?',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledStory(args: React.ComponentProps<typeof AlertDialog>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open alert dialog" onClick={() => setIsOpen(true)} />
      <AlertDialog
        {...args}
        isOpen={isOpen}
        onAction={() => setIsOpen(false)}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

function ImperativeStory() {
  const alert = useAlertDialog();

  return (
    <>
      <Button
        label="Open imperative alert"
        onClick={() =>
          alert.show({
            actionLabel: 'Archive',
            actionVariant: 'primary',
            description: 'Archived projects can be restored later.',
            onAction: alert.hide,
            title: 'Archive project?',
          })
        }
      />
      {alert.element}
    </>
  );
}

export const Default: Story = {
  render: args => <ControlledStory {...args} />,
};
export const LoadingAction: Story = {
  args: {isActionLoading: true},
  render: args => <ControlledStory {...args} />,
};
export const Imperative: Story = {
  render: () => <ImperativeStory />,
};
