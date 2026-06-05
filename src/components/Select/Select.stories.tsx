import type {Meta, StoryObj} from '@storybook/react-vite';
import {BriefcaseBusiness, User} from 'lucide-react';
import {useState} from 'react';
import {Select, type SelectProps} from './Select';
import {SelectOption} from './SelectOption';

const peopleOptions = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Grace Hopper', value: 'grace'},
  {label: 'Katherine Johnson', value: 'katherine'},
];

const disabledOptions: SelectProps['options'] = [
  {label: 'Ada Lovelace', value: 'ada'},
  {isDisabled: true, label: 'Grace Hopper (unavailable)', value: 'grace'},
  {label: 'Katherine Johnson', value: 'katherine'},
  {isDisabled: true, label: 'Hedy Lamarr (unavailable)', value: 'hedy'},
];

const sectionedOptions: SelectProps['options'] = [
  {
    title: 'Engineering',
    type: 'section',
    options: [
      {label: 'Ada Lovelace', value: 'ada'},
      {label: 'Grace Hopper', value: 'grace'},
    ],
  },
  {type: 'divider'},
  {
    title: 'Science',
    type: 'section',
    options: [
      {label: 'Katherine Johnson', value: 'katherine'},
      {label: 'Hedy Lamarr', value: 'hedy'},
    ],
  },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Assignee',
    options: peopleOptions,
    placeholder: 'Select a person',
  },
} satisfies Meta<SelectProps>;

export default meta;
type Story = StoryObj<SelectProps>;

function SelectStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>('ada');
  return <Select {...args} hasClear onChange={setValue} value={value} />;
}

function EmptySelectStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>(null);
  return <Select {...args} hasClear onChange={setValue} value={value} />;
}

function SizesStory(args: React.ComponentProps<typeof Select>) {
  const [small, setSmall] = useState<string | null>('ada');
  const [medium, setMedium] = useState<string | null>('grace');
  const [large, setLarge] = useState<string | null>('katherine');
  return (
    <div style={{display: 'grid', gap: 16}}>
      <Select
        {...args}
        label="Small"
        onChange={setSmall}
        size="sm"
        value={small}
      />
      <Select {...args} label="Medium" onChange={setMedium} value={medium} />
      <Select
        {...args}
        label="Large"
        onChange={setLarge}
        size="lg"
        value={large}
      />
    </div>
  );
}

function CustomOptionsStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>('ada');
  return (
    <Select
      {...args}
      hasSearch
      onChange={setValue}
      renderOption={option => (
        <SelectOption
          description={`${option.value}@example.com`}
          icon={User}
          label={option.label ?? option.value}
        />
      )}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const Searchable: Story = {
  args: {hasSearch: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const CustomOptions: Story = {
  render: (args: SelectProps) => <CustomOptionsStory {...args} />,
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const Loading: Story = {
  args: {isLoading: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const SectionsAndDividers: Story = {
  args: {options: sectionedOptions},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const ValidationStatus: Story = {
  args: {
    status: {message: 'Choose an assignee before continuing.', type: 'error'},
  },
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const Sizes: Story = {
  render: (args: SelectProps) => <SizesStory {...args} />,
};

export const WithStartIcon: Story = {
  args: {startIcon: BriefcaseBusiness},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const CustomPlaceholder: Story = {
  args: {placeholder: 'Assign someone'},
  render: (args: SelectProps) => <EmptySelectStory {...args} />,
};

export const DisabledOptions: Story = {
  args: {options: disabledOptions},
  render: (args: SelectProps) => <EmptySelectStory {...args} />,
};
