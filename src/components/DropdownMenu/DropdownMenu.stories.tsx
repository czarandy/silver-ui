import type {Meta, StoryObj} from '@storybook/react-vite';
import {Archive, Edit, Inbox, MoreVertical, Trash2} from 'lucide-react';
import {DropdownMenu} from 'components/DropdownMenu/DropdownMenu';
import {DropdownMenuItem} from 'components/DropdownMenu/DropdownMenuItem';
import {Icon} from 'components/Icon';
import {Kbd} from 'components/Kbd';

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
      {icon: Edit, label: 'Edit'},
      {icon: Archive, label: 'Archive'},
      {type: 'divider'},
      {icon: Trash2, label: 'Delete'},
    ],
  },
};

export const Compound: Story = {
  render: (args): React.JSX.Element => (
    <DropdownMenu {...args}>
      <DropdownMenuItem icon={Edit} label="Edit" />
      <DropdownMenuItem icon={Archive} label="Archive" />
      <DropdownMenuItem icon={Trash2} label="Delete" />
    </DropdownMenu>
  ),
};

export const WithDescriptions: Story = {
  args: {
    items: [
      {description: 'Modify this item', icon: Edit, label: 'Edit'},
      {description: 'Move to archive', icon: Archive, label: 'Archive'},
      {type: 'divider'},
      {description: 'Permanently remove', icon: Trash2, label: 'Delete'},
    ],
  },
};

export const WithTooltips: Story = {
  args: {
    items: [
      {
        icon: Edit,
        label: 'Edit',
        tooltip: 'Change the item title and details.',
      },
      {
        icon: Archive,
        label: 'Archive',
        tooltip: 'Move the item out of active lists without deleting it.',
      },
      {type: 'divider'},
      {
        icon: Trash2,
        label: 'Delete',
        tooltip: 'Permanently remove the item.',
      },
    ],
  },
};

export const WithShortcuts: Story = {
  render: (args): React.JSX.Element => (
    <DropdownMenu {...args}>
      <DropdownMenuItem
        endContent={<Kbd keys="mod+e" />}
        icon={Edit}
        label="Edit"
      />
      <DropdownMenuItem
        endContent={<Kbd keys="mod+shift+a" />}
        icon={Archive}
        label="Archive"
      />
      <DropdownMenuItem
        endContent={<Kbd keys="backspace" />}
        icon={Trash2}
        label="Delete"
      />
    </DropdownMenu>
  ),
};

export const WithDisabledItems: Story = {
  args: {
    items: [
      {icon: Edit, label: 'Edit'},
      {icon: Archive, isDisabled: true, label: 'Archive'},
      {type: 'divider'},
      {icon: Trash2, isDisabled: true, label: 'Delete'},
    ],
  },
};

export const Sections: Story = {
  args: {
    items: [
      {
        items: [
          {icon: Edit, label: 'Edit'},
          {icon: Archive, label: 'Archive'},
        ],
        title: 'Actions',
        type: 'section',
      },
      {
        items: [{icon: Trash2, label: 'Delete'}],
        title: 'Danger',
        type: 'section',
      },
    ],
  },
};

export const IconOnlyTrigger: Story = {
  args: {
    button: {icon: MoreVertical, isIconOnly: true, label: 'More actions'},
    items: [
      {icon: Edit, label: 'Edit'},
      {icon: Archive, label: 'Archive'},
      {type: 'divider'},
      {icon: Trash2, label: 'Delete'},
    ],
  },
};

export const SizeVariants: Story = {
  render: (): React.JSX.Element => (
    <div style={{display: 'flex', gap: '1rem'}}>
      <DropdownMenu
        button={{label: 'Small', size: 'sm'}}
        items={[
          {icon: Edit, label: 'Edit'},
          {icon: Archive, label: 'Archive'},
          {type: 'divider'},
          {icon: Trash2, label: 'Delete'},
        ]}
      />
      <DropdownMenu
        button={{label: 'Medium'}}
        items={[
          {icon: Edit, label: 'Edit'},
          {icon: Archive, label: 'Archive'},
          {type: 'divider'},
          {icon: Trash2, label: 'Delete'},
        ]}
      />
      <DropdownMenu
        button={{label: 'Large', size: 'lg'}}
        items={[
          {icon: Edit, label: 'Edit'},
          {icon: Archive, label: 'Archive'},
          {type: 'divider'},
          {icon: Trash2, label: 'Delete'},
        ]}
      />
    </div>
  ),
};

export const GhostTrigger: Story = {
  args: {
    button: {label: 'Actions', variant: 'ghost'},
    items: [
      {icon: Edit, label: 'Edit'},
      {icon: Archive, label: 'Archive'},
    ],
  },
};

export const TriggerWithEndContent: Story = {
  args: {
    button: {
      endContent: <Icon icon={Inbox} />,
      label: 'Inbox',
      variant: 'secondary',
    },
    items: [
      {icon: Edit, label: 'Edit'},
      {icon: Archive, label: 'Archive'},
      {type: 'divider'},
      {icon: Trash2, label: 'Delete'},
    ],
  },
};
