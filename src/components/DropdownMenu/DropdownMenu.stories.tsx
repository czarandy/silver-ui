import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  Archive,
  Edit,
  MoreVertical,
  Trash2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {useState} from 'react';
import {Divider} from 'components/Divider';
import {DropdownMenu} from 'components/DropdownMenu/DropdownMenu';
import {DropdownMenuItem} from 'components/DropdownMenu/DropdownMenuItem';
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

function KeepOpenOnSelectStory(
  args: React.ComponentProps<typeof DropdownMenu>,
): React.JSX.Element {
  const [zoom, setZoom] = useState(100);

  return (
    <DropdownMenu {...args} button={{label: `Zoom ${zoom}%`}}>
      <DropdownMenuItem
        hasCloseOnSelect={false}
        icon={ZoomIn}
        label="Zoom in"
        onClick={() => setZoom(current => Math.min(current + 10, 200))}
      />
      <DropdownMenuItem
        hasCloseOnSelect={false}
        icon={ZoomOut}
        label="Zoom out"
        onClick={() => setZoom(current => Math.max(current - 10, 50))}
      />
      <DropdownMenuItem label="Reset" onClick={() => setZoom(100)} />
    </DropdownMenu>
  );
}

export const KeepOpenOnSelect: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Items with `hasCloseOnSelect={false}` run `onClick` and leave the menu open with focus on the item, so users can repeat an action, such as zooming, without reopening the menu. Other items, like "Reset" here, still close the menu.',
      },
    },
  },
  render: (args): React.JSX.Element => <KeepOpenOnSelectStory {...args} />,
};

const syncOptions = [
  {label: 'Only busy times', value: 'busy'},
  {label: 'Full event details', value: 'full'},
] as const;

function CheckableItemsStory(
  args: React.ComponentProps<typeof DropdownMenu>,
): React.JSX.Element {
  const [isBookingBlocked, setIsBookingBlocked] = useState(true);
  const [isShared, setIsShared] = useState(false);
  const [sync, setSync] = useState<string>('busy');

  return (
    <DropdownMenu {...args} button={{label: 'Calendar options'}}>
      <DropdownMenuItem
        isSelected={isBookingBlocked}
        label="Block client booking"
        onClick={() => setIsBookingBlocked(current => !current)}
        selectionMode="checkbox"
      />
      <DropdownMenuItem
        isSelected={isShared}
        label="Share with team"
        onClick={() => setIsShared(current => !current)}
        selectionMode="checkbox"
      />
      <Divider />
      {syncOptions.map(option => (
        <DropdownMenuItem
          isSelected={sync === option.value}
          key={option.value}
          label={option.label}
          onClick={() => setSync(option.value)}
          selectionMode="radio"
        />
      ))}
      <Divider />
      <DropdownMenuItem icon={Trash2} label="Remove calendar" />
    </DropdownMenu>
  );
}

export const CheckableItems: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`selectionMode="checkbox"` items toggle independently and keep the menu open; `selectionMode="radio"` items pick one option and close it. Both render `menuitemcheckbox`/`menuitemradio` with `aria-checked` and draw a leading check or dot. Plain items in the same menu are indented so every label lines up. A `<Divider />` in compound content gets the same spacing as `{type: \'divider\'}`.',
      },
    },
  },
  render: (args): React.JSX.Element => <CheckableItemsStory {...args} />,
};

const sortOptions = ['Name', 'Date modified', 'Size'];

function CheckableItemsDataDrivenStory(
  args: React.ComponentProps<typeof DropdownMenu>,
): React.JSX.Element {
  const [isArchivedShown, setIsArchivedShown] = useState(false);
  const [sortBy, setSortBy] = useState('Name');

  return (
    <DropdownMenu
      {...args}
      button={{label: 'View options'}}
      items={[
        {
          isSelected: isArchivedShown,
          label: 'Show archived',
          onClick: () => setIsArchivedShown(current => !current),
          selectionMode: 'checkbox',
        },
        {type: 'divider'},
        {
          items: sortOptions.map(option => ({
            isSelected: sortBy === option,
            label: option,
            onClick: () => setSortBy(option),
            selectionMode: 'radio',
          })),
          title: 'Sort by',
          type: 'section',
        },
      ]}
    />
  );
}

export const CheckableItemsDataDriven: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The same `selectionMode` and `isSelected` fields work on data-driven items. A titled section groups a radio set for assistive tech.',
      },
    },
  },
  render: (args): React.JSX.Element => (
    <CheckableItemsDataDrivenStory {...args} />
  ),
};

export const EndAligned: Story = {
  args: {
    alignment: 'end',
    items: [
      {icon: Edit, label: 'Edit'},
      {icon: Archive, label: 'Archive'},
      {type: 'divider'},
      {icon: Trash2, label: 'Delete'},
    ],
    isMenuOpen: true,
    menuWidth: 240,
    offsetY: 8,
    placement: 'below',
  },
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
