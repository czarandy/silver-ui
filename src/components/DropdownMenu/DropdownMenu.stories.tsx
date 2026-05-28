import type {Meta, StoryObj} from '@storybook/react-vite';
import {Archive, Edit, Trash2} from 'lucide-react';
import {DropdownMenu} from './DropdownMenu';
import {DropdownMenuItem} from './DropdownMenuItem';

const meta: Meta<typeof DropdownMenu> = {
  title: 'Components/DropdownMenu',
  component: DropdownMenu,
  args: {button: {label: 'Actions'}},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const DataDriven: Story = {
  args: {
    items: [
      {icon: <Edit />, label: 'Edit'},
      {icon: <Archive />, label: 'Archive'},
      {type: 'divider'},
      {icon: <Trash2 />, label: 'Delete'},
    ],
  },
};
export const Compound: Story = {
  render: args => (
    <DropdownMenu {...args}>
      <DropdownMenuItem icon={<Edit />} label="Edit" />
      <DropdownMenuItem icon={<Archive />} label="Archive" />
      <DropdownMenuItem icon={<Trash2 />} label="Delete" />
    </DropdownMenu>
  ),
};
