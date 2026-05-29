import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from '../Button';
import {HStack, VStack} from '../Stack';
import {Heading, Text} from '../Text';
import {Dialog} from './Dialog';
import {useDialog} from './useDialog';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    maxHeight: {control: 'text'},
    purpose: {
      control: {type: 'select'},
      options: ['info', 'form', 'required'],
    },
    variant: {
      control: {type: 'select'},
      options: ['standard', 'fullscreen'],
    },
    width: {control: 'text'},
  },
  args: {
    label: 'Confirm changes',
    maxHeight: '75vh',
    purpose: 'info',
    variant: 'standard',
    width: 420,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function DefaultDialogStory(args: React.ComponentProps<typeof Dialog>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open dialog" onClick={() => setIsOpen(true)} />
      <Dialog {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={2}>Confirm changes</Heading>
            <Text as="p" color="secondary">
              Review the updates before applying them to this workspace.
            </Text>
          </VStack>
          <HStack gap={2} justify="end">
            <Button label="Cancel" onClick={() => setIsOpen(false)} />
            <Button
              label="Apply"
              onClick={() => setIsOpen(false)}
              variant="primary"
            />
          </HStack>
        </VStack>
      </Dialog>
    </>
  );
}

export const Default: Story = {
  render: args => <DefaultDialogStory {...args} />,
};

function RequiredDialogStory(args: React.ComponentProps<typeof Dialog>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open required dialog" onClick={() => setIsOpen(true)} />
      <Dialog {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={2}>Required action</Heading>
            <Text as="p" color="secondary">
              This dialog can only be closed from an explicit action.
            </Text>
          </VStack>
          <HStack justify="end">
            <Button
              label="Acknowledge"
              onClick={() => setIsOpen(false)}
              variant="primary"
            />
          </HStack>
        </VStack>
      </Dialog>
    </>
  );
}

export const Required: Story = {
  args: {
    label: 'Required action',
    purpose: 'required',
  },
  render: args => <RequiredDialogStory {...args} />,
};

function ImperativeDialogStory() {
  const dialog = useDialog({label: 'Generated report', width: 480});

  return (
    <>
      <Button
        label="Show report"
        onClick={() =>
          dialog.show(
            <VStack gap={4}>
              <VStack gap={1}>
                <Heading level={2}>Generated report</Heading>
                <Text as="p" color="secondary">
                  The report is ready for review.
                </Text>
              </VStack>
              <HStack justify="end">
                <Button label="Done" onClick={dialog.hide} variant="primary" />
              </HStack>
            </VStack>,
          )
        }
      />
      {dialog.element}
    </>
  );
}

export const Imperative: Story = {
  render: () => <ImperativeDialogStory />,
};
