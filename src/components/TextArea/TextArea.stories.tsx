import type {Meta, StoryObj} from '@storybook/react-vite';
import {MessageSquare} from 'lucide-react';
import {useState} from 'react';
import {TextArea, type TextAreaProps} from 'components/TextArea/TextArea';

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

export const AutoComplete: Story = {
  args: {
    autoComplete: 'street-address',
    htmlName: 'street-address',
    label: 'Street address',
    placeholder: 'Street and apartment number',
    description: 'Allows the browser to suggest a saved street address.',
  },
};

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

export const WithStartIcon: Story = {
  args: {startIcon: MessageSquare},
};

export const LabelHidden: Story = {
  args: {isLabelHidden: true, placeholder: 'Add a comment...'},
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

export const ReadOnly: Story = {
  args: {
    isReadOnly: true,
    value: 'This content can be reviewed but not edited.',
  },
};

const LONG_NOTE = [
  'Client reported improved sleep since the last session.',
  'Discussed strategies for managing work stress, including scheduled breaks.',
  'Reviewed the thought record from last week; identified two recurring themes.',
  'Plan: continue weekly sessions and revisit the sleep log next time.',
].join('\n\n');

export const AutoGrow: Story = {
  args: {
    rows: undefined,
    minRows: 3,
    value: LONG_NOTE,
    description: 'Grows with its content instead of scrolling.',
  },
};

export const AutoGrowWithMaxRows: Story = {
  args: {
    rows: undefined,
    minRows: 2,
    maxRows: 5,
    value: LONG_NOTE,
    description: 'Grows up to five rows, then scrolls.',
  },
};
