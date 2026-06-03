import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, ChevronRight, Shield, Star, User} from 'lucide-react';
import {Badge} from '../Badge';
import {Icon} from '../Icon';
import {List} from './List';
import {ListItem} from './ListItem';

const meta: Meta<typeof List> = {
  title: 'Components/List',
  component: List,
  argTypes: {
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
        endContent={<Badge color="warning" label="Required" />}
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

export const Disc: Story = {
  args: {listStyle: 'disc'},
  render: args => (
    <List {...args}>
      <ListItem label="Apples" />
      <ListItem label="Bananas" />
      <ListItem label="Cherries" />
    </List>
  ),
};

export const Circle: Story = {
  args: {listStyle: 'circle'},
  render: args => (
    <List {...args}>
      <ListItem label="Apples" />
      <ListItem label="Bananas" />
      <ListItem label="Cherries" />
    </List>
  ),
};

export const Clickable: Story = {
  render: () => (
    <List hasDividers header="Actions">
      <ListItem
        label="Edit profile"
        onClick={() => {}}
        startContent={<Icon icon={User} size="sm" />}
      />
      <ListItem
        label="Notifications"
        onClick={() => {}}
        startContent={<Icon icon={Bell} size="sm" />}
      />
      <ListItem
        label="Security"
        onClick={() => {}}
        startContent={<Icon icon={Shield} size="sm" />}
      />
    </List>
  ),
};

export const Links: Story = {
  render: () => (
    <List hasDividers>
      <ListItem
        endContent={<Icon icon={ChevronRight} size="sm" />}
        href="/profile"
        label="Profile"
      />
      <ListItem
        endContent={<Icon icon={ChevronRight} size="sm" />}
        href="/settings"
        label="Settings"
      />
      <ListItem
        endContent={<Icon icon={ChevronRight} size="sm" />}
        href="https://example.com"
        label="External docs"
        rel="noopener noreferrer"
        target="_blank"
      />
    </List>
  ),
};

export const Disabled: Story = {
  render: () => (
    <List hasDividers>
      <ListItem label="Active item" onClick={() => {}} />
      <ListItem isDisabled label="Disabled item" onClick={() => {}} />
      <ListItem label="Another active item" onClick={() => {}} />
    </List>
  ),
};

export const Selected: Story = {
  render: () => (
    <List hasDividers>
      <ListItem label="Home" onClick={() => {}} />
      <ListItem isSelected label="Dashboard" onClick={() => {}} />
      <ListItem label="Settings" onClick={() => {}} />
    </List>
  ),
};

export const OrderedWithStart: Story = {
  args: {listStyle: 'decimal'},
  render: args => (
    <List {...args} header="Continued steps" start={4}>
      <ListItem label="Deploy to staging" />
      <ListItem label="Run integration tests" />
      <ListItem label="Deploy to production" />
    </List>
  ),
};

export const MixedContent: Story = {
  render: () => (
    <List hasDividers>
      <ListItem
        description="Manage notification preferences"
        endContent={<Badge color="info" label="3 new" />}
        label="Notifications"
        startContent={<Icon color="accent" icon={Bell} size="sm" />}
      />
      <ListItem label="Simple item" />
      <ListItem
        description="View and manage saved items"
        label="Favorites"
        startContent={<Icon color="warning" icon={Star} size="sm" />}
      />
      <ListItem
        endContent={<Icon icon={ChevronRight} size="sm" />}
        label="With end content only"
      />
    </List>
  ),
};

export const LongContent: Story = {
  render: () => (
    <div style={{maxWidth: 400}}>
      <List hasDividers>
        <ListItem
          description="This is a very long description that should demonstrate how the component handles text overflow when the content exceeds the available width of the container"
          label="A very long label that might need to be truncated when it exceeds the available space"
        />
        <ListItem label="Short item" />
        <ListItem
          description="Another long description to show consistent behavior"
          label="Medium length label for comparison"
        />
      </List>
    </div>
  ),
};
