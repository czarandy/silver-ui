import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Archive,
  Bold,
  Copy,
  Edit,
  Italic,
  Scissors,
  Trash2,
  Underline,
} from 'lucide-react';
import {Button} from '../Button';
import {DropdownMenu} from '../DropdownMenu';
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

export const MixedVariants: Story = {
  render: args => (
    <ButtonGroup {...args}>
      <Button label="Save draft" variant="secondary" />
      <Button label="Discard" variant="destructive" />
    </ButtonGroup>
  ),
};

export const DisabledVertical: Story = {
  args: {
    isDisabled: true,
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

export const LinkButtons: Story = {
  render: args => (
    <ButtonGroup {...args}>
      <Button href="/home" label="Home" />
      <Button href="/about" label="About" />
      <Button href="/contact" label="Contact" />
    </ButtonGroup>
  ),
};

export const LargeGroup: Story = {
  render: args => (
    <ButtonGroup {...args} label="Pagination">
      <Button label="First" />
      <Button label="Prev" />
      <Button label="1" />
      <Button label="2" />
      <Button label="3" />
      <Button label="Next" />
      <Button label="Last" />
    </ButtonGroup>
  ),
};

export const WithDropdownMenu: Story = {
  args: {
    label: 'Document actions',
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button icon={Copy} label="Copy" />
      <Button icon={Scissors} label="Cut" />
      <DropdownMenu
        button={{label: 'More'}}
        items={[
          {icon: Edit, label: 'Rename'},
          {icon: Archive, label: 'Archive'},
          {type: 'divider'},
          {icon: Trash2, label: 'Delete'},
        ]}
      />
    </ButtonGroup>
  ),
};

export const VerticalIconOnly: Story = {
  args: {
    orientation: 'vertical',
    label: 'Formatting toolbar',
  },
  render: args => (
    <ButtonGroup {...args}>
      <Button icon={Bold} isIconOnly label="Bold" />
      <Button icon={Italic} isIconOnly label="Italic" />
      <Button icon={Underline} isIconOnly label="Underline" />
    </ButtonGroup>
  ),
};
