import type {Meta, StoryObj} from '@storybook/react-vite';
import {Columns3, User} from 'lucide-react';
import {useState} from 'react';
import {
  MultiSelect,
  type MultiSelectProps,
} from 'components/MultiSelect/MultiSelect';
import {SelectOption} from 'components/Select';

const options = [
  {label: 'Name', value: 'name'},
  {label: 'Email', value: 'email'},
  {label: 'Role', value: 'role'},
  {label: 'Status', value: 'status'},
];

const optionsWithDisabled = [
  {label: 'Name', value: 'name'},
  {isDisabled: true, label: 'Email', value: 'email'},
  {label: 'Role', value: 'role'},
  {isDisabled: true, label: 'Status', value: 'status'},
];

const sectionedOptions: MultiSelectProps['options'] = [
  {
    title: 'Identity',
    type: 'section',
    options: [
      {label: 'Name', value: 'name'},
      {label: 'Email', value: 'email'},
    ],
  },
  {type: 'divider'},
  {
    title: 'Account',
    type: 'section',
    options: [
      {label: 'Role', value: 'role'},
      {label: 'Status', value: 'status'},
    ],
  },
];

const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  args: {label: 'Columns', options, placeholder: 'Select columns'},
} satisfies Meta<MultiSelectProps>;

export default meta;
type Story = StoryObj<MultiSelectProps>;

function MultiSelectStory(args: React.ComponentProps<typeof MultiSelect>) {
  const [value, setValue] = useState<string[]>(['name', 'email']);
  return (
    <MultiSelect
      {...args}
      hasClear
      onChange={setValue}
      startIcon={Columns3}
      value={value}
    />
  );
}

function OverflowBadgesStory(args: React.ComponentProps<typeof MultiSelect>) {
  const [value, setValue] = useState<string[]>([
    'name',
    'email',
    'role',
    'status',
  ]);
  return (
    <MultiSelect
      {...args}
      hasClear
      maxBadges={2}
      onChange={setValue}
      startIcon={Columns3}
      triggerDisplay="badges"
      value={value}
    />
  );
}

function EmptyMultiSelectStory(args: React.ComponentProps<typeof MultiSelect>) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <MultiSelect
      {...args}
      hasClear
      onChange={setValue}
      startIcon={Columns3}
      value={value}
    />
  );
}

function CustomOptionsStory(args: React.ComponentProps<typeof MultiSelect>) {
  const [value, setValue] = useState<string[]>(['name', 'role']);
  return (
    <MultiSelect {...args} hasSearch onChange={setValue} value={value}>
      {option => (
        <SelectOption
          description={`${option.value}.field`}
          icon={User}
          label={option.label ?? option.value}
        />
      )}
    </MultiSelect>
  );
}

export const Default: Story = {
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};
export const Searchable: Story = {
  args: {hasSearch: true},
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};
export const Badges: Story = {
  args: {triggerDisplay: 'badges'},
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const Labels: Story = {
  args: {triggerDisplay: 'labels'},
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const DisabledOptions: Story = {
  args: {options: optionsWithDisabled},
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const SectionsAndDividers: Story = {
  args: {options: sectionedOptions},
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const Loading: Story = {
  args: {isLoading: true},
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const ValidationStatus: Story = {
  args: {
    status: {message: 'Choose at least one column.', type: 'error'},
  },
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const CustomOptions: Story = {
  render: (args: MultiSelectProps) => <CustomOptionsStory {...args} />,
};

export const WithDescriptionAndTooltip: Story = {
  args: {
    description: 'Choose which columns are visible in the table.',
    labelTooltip: 'These settings only affect your current view.',
  },
  render: (args: MultiSelectProps) => <MultiSelectStory {...args} />,
};

export const BadgeOverflow: Story = {
  render: (args: MultiSelectProps) => <OverflowBadgesStory {...args} />,
};

export const SelectAll: Story = {
  args: {hasSelectAll: true},
  render: (args: MultiSelectProps) => <EmptyMultiSelectStory {...args} />,
};
