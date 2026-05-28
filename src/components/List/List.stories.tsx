import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, ChevronRight, Shield} from 'lucide-react';
import {Badge} from '../Badge';
import {Icon} from '../Icon';
import {List} from './List';
import {ListItem} from './ListItem';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  argTypes: {
    density: {
      control: {type: 'select'},
      options: ['compact', 'balanced', 'spacious'],
    },
    hasDividers: {control: 'boolean'},
    listStyle: {
      control: {type: 'select'},
      options: ['none', 'disc', 'decimal', 'circle'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <List {...args} header="Settings">
      <ListItem
        description="Manage notification preferences"
        endContent={<Icon icon={ChevronRight} size="sm" />}
        label="Notifications"
        startContent={<Icon color="accent" icon={Bell} size="sm" />}
      />
      <ListItem
        description="Control account security"
        endContent={<Badge label="Required" variant="warning" />}
        label="Security"
        startContent={<Icon color="success" icon={Shield} size="sm" />}
      />
    </List>
  ),
};

export const WithDividers: Story = {
  args: {hasDividers: true},
  render: args => (
    <List {...args}>
      <ListItem label="First item" />
      <ListItem label="Second item" />
      <ListItem label="Third item" />
    </List>
  ),
};

export const Ordered: Story = {
  args: {listStyle: 'decimal'},
  render: args => (
    <List {...args} header="Setup steps">
      <ListItem label="Create project" />
      <ListItem label="Invite teammates" />
      <ListItem label="Configure billing" />
    </List>
  ),
};
