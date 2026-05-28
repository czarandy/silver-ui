import type {Meta, StoryObj} from '@storybook/react-vite';
import {Calendar, CircleCheck} from 'lucide-react';
import {MetadataList} from './MetadataList';
import {MetadataListItem} from './MetadataListItem';

const meta: Meta<typeof MetadataList> = {
  title: 'Components/MetadataList',
  component: MetadataList,
  args: {
    title: 'Repository',
    children: (
      <>
        <MetadataListItem icon={<CircleCheck />} label="Status">
          Active
        </MetadataListItem>
        <MetadataListItem label="Owner">Design systems</MetadataListItem>
        <MetadataListItem icon={<Calendar />} label="Created">
          May 27, 2026
        </MetadataListItem>
        <MetadataListItem label="Visibility">Internal</MetadataListItem>
      </>
    ),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const MultiColumn: Story = {args: {columns: 'multi'}};
export const Horizontal: Story = {args: {orientation: 'horizontal'}};
