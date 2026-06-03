import type {Meta, StoryObj} from '@storybook/react-vite';
import {Inbox} from 'lucide-react';
import {Button} from '../Button';
import {HStack} from '../Stack';
import {EmptyState} from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
  },
  args: {
    description: 'Create a project to start tracking work.',
    illustration: <Inbox />,
    title: 'No projects',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  args: {description: undefined},
};

export const NoIllustration: Story = {
  args: {illustration: undefined},
};

export const WithAction: Story = {
  args: {actions: <Button label="Create project" variant="primary" />},
};

export const MultipleActions: Story = {
  args: {
    actions: (
      <HStack gap={2}>
        <Button label="Create project" variant="primary" />
        <Button label="Import" variant="secondary" />
      </HStack>
    ),
  },
};

export const Compact: Story = {
  args: {isCompact: true},
};

export const CompactWithActions: Story = {
  args: {
    actions: (
      <HStack gap={2}>
        <Button label="Create project" variant="primary" />
        <Button label="Import" variant="secondary" />
      </HStack>
    ),
    isCompact: true,
  },
};

export const CustomHeadingLevel: Story = {
  args: {headingLevel: 2},
};
