/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from 'components/Button';
import {Popover} from 'components/Popover/Popover';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  argTypes: {
    alignment: {
      control: {type: 'select'},
      options: ['start', 'center', 'end'],
    },
    anchorRef: {control: false},
    placement: {
      control: {type: 'select'},
      options: ['above', 'below', 'start', 'end'],
    },
    isEnabled: {control: 'boolean'},
    label: {control: 'text'},
    width: {control: 'text'},
  },
  args: {
    label: 'Settings',
    placement: 'below',
    alignment: 'start',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const popoverContent = (
  <VStack gap={2}>
    <Text as="p">Notification settings</Text>
    <Button label="Save" size="sm" variant="primary" />
  </VStack>
);

export const Default: Story = {
  render: args => (
    <Popover {...args} content={popoverContent} padding={3}>
      <Button label="Open popover" />
    </Popover>
  ),
};

export const Placements: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 24,
        justifyItems: 'center',
        padding: '80px',
      }}>
      <Popover
        content={popoverContent}
        label="Above"
        padding={3}
        placement="above">
        <Button label="Above" />
      </Popover>
      <HStack gap={6}>
        <Popover
          content={popoverContent}
          label="Start"
          padding={3}
          placement="start">
          <Button label="Start" />
        </Popover>
        <Popover
          content={popoverContent}
          label="End"
          padding={3}
          placement="end">
          <Button label="End" />
        </Popover>
      </HStack>
      <Popover
        content={popoverContent}
        label="Below"
        padding={3}
        placement="below">
        <Button label="Below" />
      </Popover>
    </div>
  ),
};

export const Alignments: Story = {
  render: () => (
    <HStack gap={4} style={{padding: '40px'}}>
      <Popover
        alignment="start"
        content={popoverContent}
        label="Start"
        padding={3}
        placement="below">
        <Button label="Start" />
      </Popover>
      <Popover
        alignment="center"
        content={popoverContent}
        label="Center"
        padding={3}
        placement="below">
        <Button label="Center" />
      </Popover>
      <Popover
        alignment="end"
        content={popoverContent}
        label="End"
        padding={3}
        placement="below">
        <Button label="End" />
      </Popover>
    </HStack>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <HStack gap={2}>
        <Button
          label={isOpen ? 'Close externally' : 'Open externally'}
          onClick={() => setIsOpen(v => !v)}
          variant="secondary"
        />
        <Popover
          content={popoverContent}
          isOpen={isOpen}
          label="Controlled"
          onOpenChange={setIsOpen}
          padding={3}
          placement="below">
          <Button label="Trigger" />
        </Popover>
      </HStack>
    );
  },
};

export const Disabled: Story = {
  render: args => (
    <Popover {...args} content={popoverContent} isEnabled={false} padding={3}>
      <Button label="Disabled popover" />
    </Popover>
  ),
};

export const NoCloseButton: Story = {
  render: args => (
    <Popover
      {...args}
      content={popoverContent}
      hasCloseButton={false}
      padding={3}>
      <Button label="No close button" />
    </Popover>
  ),
};

export const MatchTriggerWidth: Story = {
  render: args => (
    <Popover
      {...args}
      content={<Text as="p">This popover matches the trigger width.</Text>}
      padding={3}>
      <Button label="Wide trigger button" />
    </Popover>
  ),
};

export const CustomWidth: Story = {
  args: {width: 280},
  render: args => (
    <Popover
      {...args}
      content={<Text as="p">A fixed-width popover for richer panels.</Text>}
      padding={3}>
      <Button label="Open fixed panel" />
    </Popover>
  ),
};

export const NestedPopovers: Story = {
  render: () => (
    <Popover
      content={
        <VStack gap={2}>
          <Text as="p">Outer popover content</Text>
          <Popover
            content={
              <VStack gap={2}>
                <Text as="p">Inner popover content</Text>
                <Button label="Apply" size="sm" variant="primary" />
              </VStack>
            }
            label="Inner settings"
            padding={3}>
            <Button label="Open inner popover" size="sm" />
          </Popover>
        </VStack>
      }
      label="Outer settings"
      padding={3}>
      <Button label="Open outer popover" />
    </Popover>
  ),
};
