import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {getNecessity} from 'components/Field';
import {
  Slider,
  type SliderRangeProps,
  type SliderSingleProps,
} from 'components/Slider/Slider';
import {VStack} from 'components/Stack';

const DEFAULT_RANGE_VALUE: [number, number] = [20, 80];

type SliderStoryArgs = Omit<SliderSingleProps, 'onChange'> & {
  onChange?: SliderSingleProps['onChange'];
};

const meta = {
  title: 'Components/Slider',
  component: Slider as Meta['component'],
  args: {
    htmlName: 'volume',
    label: 'Volume',
    value: 50,
  },
  argTypes: {
    orientation: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
    valueDisplay: {
      control: {type: 'select'},
      options: ['tooltip', 'text', 'none'],
    },
  },
} satisfies Meta<SliderStoryArgs>;

export default meta;
type Story = StoryObj<SliderStoryArgs>;

type ControlledSingleSliderProps = Omit<
  SliderSingleProps,
  'onChange' | 'value'
> & {
  value?: number;
};

function ControlledSingleSlider({
  value: initialValue = 50,
  isOptional,
  isRequired,
  ...args
}: ControlledSingleSliderProps): React.JSX.Element {
  const [value, setValue] = useState(initialValue);

  return (
    <Slider
      {...args}
      {...getNecessity(isOptional, isRequired)}
      onChange={setValue}
      value={value}
    />
  );
}

type ControlledRangeSliderProps = Omit<
  SliderRangeProps,
  'onChange' | 'value'
> & {
  value?: [number, number];
};

function ControlledRangeSlider({
  value: initialValue = DEFAULT_RANGE_VALUE,
  isOptional,
  isRequired,
  ...args
}: ControlledRangeSliderProps): React.JSX.Element {
  const [value, setValue] = useState<[number, number]>(initialValue);

  return (
    <Slider
      {...args}
      {...getNecessity(isOptional, isRequired)}
      onChange={setValue}
      value={value}
    />
  );
}

const defaultMarks = [
  {label: '0', value: 0},
  {label: '25', value: 25},
  {label: '50', value: 50},
  {label: '75', value: 75},
  {label: '100', value: 100},
];

export const Default: Story = {
  render: args => <ControlledSingleSlider {...args} />,
};

export const Range: Story = {
  render: () => <ControlledRangeSlider label="Price range" value={[20, 80]} />,
};

export const WithMarks: Story = {
  render: () => (
    <ControlledSingleSlider
      label="Completion"
      marks={defaultMarks}
      value={50}
      valueDisplay="text"
    />
  ),
};

export const CustomFormat: Story = {
  render: () => (
    <ControlledSingleSlider
      formatValue={value => `$${value}`}
      label="Budget"
      max={500}
      step={25}
      value={250}
      valueDisplay="text"
    />
  ),
};

export const ValueDisplayText: Story = {
  render: () => (
    <ControlledSingleSlider
      formatValue={value => `${value}%`}
      label="Opacity"
      value={60}
      valueDisplay="text"
    />
  ),
};

export const ValueDisplayNone: Story = {
  render: () => (
    <ControlledSingleSlider label="Brightness" value={40} valueDisplay="none" />
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{height: 220}}>
      <ControlledSingleSlider
        label="Level"
        orientation="vertical"
        value={65}
        valueDisplay="text"
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <ControlledSingleSlider isDisabled label="Disabled volume" value={50} />
  ),
};

export const WithStatus: Story = {
  render: () => (
    <ControlledSingleSlider
      label="Volume"
      status={{
        message: 'Volume is above the recommended range.',
        type: 'error',
      }}
      value={90}
      valueDisplay="text"
    />
  ),
};

export const MinStepsBetweenThumbs: Story = {
  render: () => (
    <ControlledRangeSlider
      label="Allowed range"
      minStepsBetweenThumbs={2}
      step={5}
      value={[30, 60]}
      valueDisplay="text"
    />
  ),
};

export const CustomStep: Story = {
  render: () => (
    <VStack gap={6}>
      <ControlledSingleSlider
        label="Step 5"
        step={5}
        value={45}
        valueDisplay="text"
      />
      <ControlledSingleSlider
        formatValue={value => value.toFixed(1)}
        label="Step 0.1"
        max={1}
        step={0.1}
        value={0.5}
        valueDisplay="text"
      />
    </VStack>
  ),
};

export const MinMaxCustom: Story = {
  render: () => (
    <ControlledSingleSlider
      label="Temperature"
      marks={[
        {label: '-50F', value: -50},
        {label: '0F', value: 0},
        {label: '100F', value: 100},
        {label: '200F', value: 200},
      ]}
      max={200}
      min={-50}
      step={10}
      value={70}
      valueDisplay="text"
    />
  ),
};
