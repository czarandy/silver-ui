import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {TextArea, type TextAreaProps} from './TextArea';

function TextAreaStory(args: TextAreaProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);
  return <TextArea {...args} onChange={setValue} value={value} />;
}

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  args: {label: 'Notes', value: '', placeholder: 'Add notes', rows: 4},
  render: (args: TextAreaProps): React.JSX.Element => (
    <TextAreaStory {...args} />
  ),
} satisfies Meta<TextAreaProps>;

export default meta;
type Story = StoryObj<TextAreaProps>;

export const Default: Story = {};

export const WithCounter: Story = {
  args: {maxLength: 120, value: 'Draft note'},
};

export const OverLimit: Story = {
  args: {
    maxLength: 20,
    value: 'This text intentionally exceeds the character limit',
  },
};

export const WithDescription: Story = {
  args: {description: 'Markdown is supported.'},
};

export const Disabled: Story = {
  args: {isDisabled: true, value: 'Read-only content'},
};

export const Loading: Story = {
  args: {isLoading: true},
};

export const Required: Story = {
  args: {isRequired: true},
};

export const Error: Story = {
  args: {
    status: {message: 'Notes cannot be empty.', type: 'error'},
  },
};

export const Warning: Story = {
  args: {
    status: {message: 'Content may be too brief.', type: 'warning'},
  },
};

export const Small: Story = {
  args: {size: 'sm', rows: 3},
};

export const Large: Story = {
  args: {size: 'lg', rows: 5},
};
