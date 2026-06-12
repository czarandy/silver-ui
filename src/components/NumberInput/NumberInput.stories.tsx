import type {Meta, StoryObj} from '@storybook/react-vite';
import {Hash, Tag} from 'lucide-react';
import {useState} from 'react';
import {
  NumberInput,
  type NumberInputProps,
} from 'components/NumberInput/NumberInput';

type NumberInputStoryArgs = Omit<NumberInputProps, 'onChange'> & {
  onChange?: NumberInputProps['onChange'];
};

const meta = {
  title: 'Components/NumberInput',
  component: NumberInput as Meta['component'],
  args: {label: 'Quantity', value: 2},
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<NumberInputStoryArgs>;

export default meta;
type Story = StoryObj<NumberInputStoryArgs>;

type ControlledNumberInputProps = Omit<
  NumberInputProps,
  'onChange' | 'value'
> & {
  value?: number | null;
};

function ControlledNumberInput({
  value: initialValue = null,
  ...args
}: ControlledNumberInputProps): React.JSX.Element {
  const [value, setValue] = useState<number | null>(initialValue);

  return (
    <NumberInput
      {...(args as NumberInputProps)}
      onChange={setValue}
      value={value}
    />
  );
}

export const Default: Story = {
  render: args => <ControlledNumberInput {...args} />,
};

export const WithUnits: Story = {
  args: {hasClear: true, label: 'Storage', max: 100, min: 0, units: 'GB'},
  render: args => <ControlledNumberInput {...args} />,
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ControlledNumberInput label="Small" size="sm" value={10} />
      <ControlledNumberInput label="Medium" size="md" value={20} />
      <ControlledNumberInput label="Large" size="lg" value={30} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {isDisabled: true, value: 42},
  render: args => <ControlledNumberInput {...args} />,
};

export const StatusVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <ControlledNumberInput
        label="Error"
        status={{message: 'Value is out of range', type: 'error'}}
        value={999}
      />
      <ControlledNumberInput
        label="Warning"
        status={{message: 'Value is unusually high', type: 'warning'}}
        value={95}
      />
      <ControlledNumberInput
        label="Success"
        status={{message: 'Value is valid', type: 'success'}}
        value={50}
      />
    </div>
  ),
};

export const IntegerOnly: Story = {
  args: {
    isIntegerOnly: true,
    label: 'Count',
    placeholder: 'Whole numbers only',
  },
  render: args => <ControlledNumberInput {...args} />,
};

export const MinMax: Story = {
  args: {label: 'Percentage', max: 100, min: 0, placeholder: '0–100'},
  render: args => <ControlledNumberInput {...args} />,
};

export const WithStartIcon: Story = {
  args: {label: 'Number', startIcon: Hash},
  render: args => <ControlledNumberInput {...args} />,
};

export const WithLabelIcon: Story = {
  args: {label: 'Price', labelIcon: Tag},
  render: args => <ControlledNumberInput {...args} />,
};

export const Required: Story = {
  args: {isRequired: true},
  render: args => <ControlledNumberInput {...args} />,
};

export const Optional: Story = {
  args: {isOptional: true},
  render: args => <ControlledNumberInput {...args} />,
};

export const WithDescription: Story = {
  args: {description: 'Enter a value between 1 and 100'},
  render: args => <ControlledNumberInput {...args} />,
};

export const WithPlaceholder: Story = {
  args: {placeholder: 'Enter a number', value: null},
  render: args => <ControlledNumberInput {...args} />,
};

export const WithEndContent: Story = {
  args: {
    endContent: (
      <span style={{color: 'var(--silver-colors-fg-muted)', fontSize: 14}}>
        USD
      </span>
    ),
    label: 'Price',
  },
  render: args => <ControlledNumberInput {...args} />,
};

export const Loading: Story = {
  args: {isLoading: true, label: 'Calculating', value: 42},
  render: args => <ControlledNumberInput {...args} />,
};
