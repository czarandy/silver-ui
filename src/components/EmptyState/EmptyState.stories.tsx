import type {Meta, StoryObj} from '@storybook/react-vite';
import {Inbox} from 'lucide-react';
import {Button} from '../Button';
import {EmptyState} from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  args: {
    description: 'Create a project to start tracking work.',
    icon: <Inbox />,
    title: 'No projects',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: {actions: <Button label="Create project" variant="primary" />},
};
export const Compact: Story = {
  args: {isCompact: true},
};
