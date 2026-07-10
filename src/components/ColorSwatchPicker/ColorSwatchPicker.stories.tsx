import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {
  ColorSwatchPicker,
  type ColorName,
  type ColorSwatchPickerProps,
} from 'components/ColorSwatchPicker';
import {Tag} from 'components/Tag';

function ColorSwatchPickerStory(
  args: ColorSwatchPickerProps,
): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return <ColorSwatchPicker {...args} onChange={setValue} value={value} />;
}

function SizesStory(args: ColorSwatchPickerProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <div style={{display: 'grid', gap: 16, justifyItems: 'start'}}>
      <ColorSwatchPicker
        {...args}
        onChange={setValue}
        size="sm"
        value={value}
      />
      <ColorSwatchPicker
        {...args}
        onChange={setValue}
        size="md"
        value={value}
      />
      <ColorSwatchPicker
        {...args}
        onChange={setValue}
        size="lg"
        value={value}
      />
    </div>
  );
}

function DrivesOtherComponentsStory(
  args: ColorSwatchPickerProps,
): React.JSX.Element {
  const [value, setValue] = useState<ColorName>(args.value);

  return (
    <div style={{display: 'grid', gap: 16, justifyItems: 'start'}}>
      <ColorSwatchPicker {...args} onChange={setValue} value={value} />
      <div style={{display: 'flex', gap: 8}}>
        <Tag color={value} label="North office" />
        <Badge color={value} label="North office" />
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/ColorSwatchPicker',
  component: ColorSwatchPicker,
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
  render: (args: ColorSwatchPickerProps): React.JSX.Element => (
    <ColorSwatchPickerStory {...args} />
  ),
} satisfies Meta<ColorSwatchPickerProps>;

export default meta;
type Story = StoryObj<ColorSwatchPickerProps>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args: ColorSwatchPickerProps): React.JSX.Element => (
    <SizesStory {...args} />
  ),
};

export const Subset: Story = {
  args: {
    colors: ['red', 'orange', 'green', 'blue', 'purple'],
    value: 'green',
  },
};

/**
 * Hovering a swatch grows it slightly.
 * The selected swatch carries an outer ring in its own color.
 */
export const Hover: Story = {
  args: {
    description: 'Hover a swatch to see the grow effect.',
    value: 'purple',
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
  render: (args: ColorSwatchPickerProps): React.JSX.Element => (
    <DrivesOtherComponentsStory {...args} />
  ),
};
