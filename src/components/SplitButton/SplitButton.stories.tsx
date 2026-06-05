import type {Meta, StoryObj} from '@storybook/react-vite';
import {Archive, Copy, Edit, Save, Trash2} from 'lucide-react';
import {DropdownMenuItem} from '../DropdownMenu';
import {SplitButton} from './SplitButton';

const meta: Meta<typeof SplitButton> = {
  title: 'Components/SplitButton',
  component: SplitButton,
  args: {
    label: 'Save',
    variant: 'primary',
    size: 'md',
    items: [
      {icon: Copy, label: 'Save a copy'},
      {icon: Edit, label: 'Save as draft'},
      {type: 'divider'},
      {icon: Archive, label: 'Save and archive'},
    ],
  },
  argTypes: {
    variant: {
      control: {type: 'select'},
      options: ['primary', 'secondary', 'ghost', 'destructive'],
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

export const DataDriven: Story = {};

export const Compound: Story = {
  args: {items: undefined},
  render: args => (
    <SplitButton {...args}>
      <DropdownMenuItem icon={Copy} label="Save a copy" />
      <DropdownMenuItem icon={Edit} label="Save as draft" />
      <DropdownMenuItem icon={Archive} label="Save and archive" />
    </SplitButton>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <SplitButton
        items={[{icon: Edit, label: 'Edit'}]}
        label="Secondary"
        variant="secondary"
      />
      <SplitButton
        items={[{icon: Edit, label: 'Edit'}]}
        label="Primary"
        variant="primary"
      />
      <SplitButton
        items={[{icon: Trash2, label: 'Delete all'}]}
        label="Delete"
        variant="destructive"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
      <SplitButton
        items={[{icon: Edit, label: 'Edit'}]}
        label="Small"
        size="sm"
      />
      <SplitButton
        items={[{icon: Edit, label: 'Edit'}]}
        label="Medium"
        size="md"
      />
      <SplitButton
        items={[{icon: Edit, label: 'Edit'}]}
        label="Large"
        size="lg"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {isDisabled: true},
};

export const WithIconPrimary: Story = {
  args: {icon: Save},
};

export const LoadingPrimary: Story = {
  args: {isLoading: true},
};
