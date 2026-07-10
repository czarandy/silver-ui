import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {
  SwatchPicker,
  type ColorName,
  type SwatchPickerProps,
} from 'components/SwatchPicker';
import {Tag} from 'components/Tag';

function SwatchPickerStory(args: SwatchPickerProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return <SwatchPicker {...args} onChange={setValue} value={value} />;
}

function SizesStory(args: SwatchPickerProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <div style={{display: 'grid', gap: 16, justifyItems: 'start'}}>
      <SwatchPicker {...args} onChange={setValue} size="sm" value={value} />
      <SwatchPicker {...args} onChange={setValue} size="md" value={value} />
      <SwatchPicker {...args} onChange={setValue} size="lg" value={value} />
    </div>
  );
}

function DrivesOtherComponentsStory(
  args: SwatchPickerProps,
): React.JSX.Element {
  const [value, setValue] = useState<ColorName>(args.value);

  return (
    <div style={{display: 'grid', gap: 16, justifyItems: 'start'}}>
      <SwatchPicker {...args} onChange={setValue} value={value} />
      <div style={{display: 'flex', gap: 8}}>
        <Tag color={value} label="North office" />
        <Badge color={value} label="North office" />
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/SwatchPicker',
  component: SwatchPicker,
  args: {
    label: 'Office color',
    description: 'Choose the named theme color used for this office.',
    size: 'md',
    value: 'blue',
  },
  argTypes: {
    isDisabled: {control: 'boolean'},
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
  },
  render: (args: SwatchPickerProps): React.JSX.Element => (
    <SwatchPickerStory {...args} />
  ),
} satisfies Meta<SwatchPickerProps>;

export default meta;
type Story = StoryObj<SwatchPickerProps>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args: SwatchPickerProps): React.JSX.Element => (
    <SizesStory {...args} />
  ),
};

export const Subset: Story = {
  args: {
    colors: ['red', 'orange', 'green', 'blue', 'purple'],
    value: 'green',
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
};

export const Error: Story = {
  args: {
    status: {message: 'Choose an office color.', type: 'error'},
  },
};

export const Required: Story = {
  args: {
    isRequired: true,
  },
};

export const DrivesOtherComponents: Story = {
  render: (args: SwatchPickerProps): React.JSX.Element => (
    <DrivesOtherComponentsStory {...args} />
  ),
};
