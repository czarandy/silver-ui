import type {Meta, StoryObj} from '@storybook/react-vite';
import {Calendar, CircleCheck, Eye, User} from 'lucide-react';
import {MetadataList} from './MetadataList';
import {MetadataListItem} from './MetadataListItem';

const meta: Meta<typeof MetadataList> = {
  title: 'Components/MetadataList',
  component: MetadataList,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Repository',
    children: (
      <>
        <MetadataListItem icon={CircleCheck} label="Status">
          Active
        </MetadataListItem>
        <MetadataListItem icon={User} label="Owner">
          Design systems
        </MetadataListItem>
        <MetadataListItem icon={Calendar} label="Created">
          May 27, 2026
        </MetadataListItem>
        <MetadataListItem icon={Eye} label="Visibility">
          Internal
        </MetadataListItem>
      </>
    ),
  },
};

export const LabelsOnTop: Story = {
  args: {
    title: 'Repository',
    labelPosition: 'top',
    children: (
      <>
        <MetadataListItem label="Status">Active</MetadataListItem>
        <MetadataListItem label="Owner">Design systems</MetadataListItem>
        <MetadataListItem label="Created">May 27, 2026</MetadataListItem>
        <MetadataListItem label="Visibility">Internal</MetadataListItem>
      </>
    ),
  },
};

export const LabelsOnTopWithIcons: Story = {
  args: {
    title: 'Repository',
    labelPosition: 'top',
    children: (
      <>
        <MetadataListItem icon={CircleCheck} label="Status">
          Active
        </MetadataListItem>
        <MetadataListItem icon={User} label="Owner">
          Design systems
        </MetadataListItem>
        <MetadataListItem icon={Calendar} label="Created">
          May 27, 2026
        </MetadataListItem>
        <MetadataListItem icon={Eye} label="Visibility">
          Internal
        </MetadataListItem>
      </>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    children: (
      <>
        <MetadataListItem label="Status">Active</MetadataListItem>
        <MetadataListItem label="Owner">Design systems</MetadataListItem>
        <MetadataListItem label="Created">May 27, 2026</MetadataListItem>
      </>
    ),
  },
};
