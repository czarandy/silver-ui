import type {Meta, StoryObj} from '@storybook/react-vite';
import {AlignCenter, AlignLeft, AlignRight} from 'lucide-react';
import {Button} from '../Button';
import {ButtonGroup} from './ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  args: {
    label: 'Text alignment',
    size: 'md',
  },
  argTypes: {
    orientation: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
    isDisabled: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: args => (
    <ButtonGroup {...args}>
      <Button icon={AlignLeft} isIconOnly label="Align left" />
      <Button icon={AlignCenter} isIconOnly label="Align center" />
      <Button icon={AlignRight} isIconOnly label="Align right" />
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button label="Copy" />
      <Button label="Paste" />
      <Button label="Delete" variant="destructive" />
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <ButtonGroup label="Small actions" size="sm">
        <Button label="One" />
        <Button label="Two" />
      </ButtonGroup>
      <ButtonGroup label="Medium actions" size="md">
        <Button label="One" />
        <Button label="Two" />
      </ButtonGroup>
      <ButtonGroup label="Large actions" size="lg">
        <Button label="One" />
        <Button label="Two" />
      </ButtonGroup>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button label="Approve" />
      <Button label="Reject" />
    </ButtonGroup>
  ),
};
