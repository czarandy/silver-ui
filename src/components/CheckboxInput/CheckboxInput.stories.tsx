import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell} from 'lucide-react';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {
  CheckboxInput,
  type CheckboxInputProps,
} from 'components/CheckboxInput/CheckboxInput';
import {Icon} from 'components/Icon';
import {HStack} from 'components/Stack/HStack';
import {VStack} from 'components/Stack/VStack';

function CheckboxStory(args: CheckboxInputProps): React.JSX.Element {
  const [value, setValue] = useState(args.value);

  return (
    <CheckboxInput
      {...args}
      onChange={checked => setValue(checked)}
      value={value}
    />
  );
}

function CheckboxRowStory(): React.JSX.Element {
  const [selected, setSelected] = useState({
    email: true,
    sms: false,
    push: true,
  });

  return (
    <HStack
      aria-label="Notification channels"
      as="fieldset"
      gap={4}
      style={{border: 0, padding: 0}}>
      <CheckboxInput
        label="Email"
        onChange={checked =>
          setSelected(current => ({...current, email: checked}))
        }
        value={selected.email}
      />
      <CheckboxInput
        label="SMS"
        onChange={checked =>
          setSelected(current => ({...current, sms: checked}))
        }
        value={selected.sms}
      />
      <CheckboxInput
        label="Push"
        onChange={checked =>
          setSelected(current => ({...current, push: checked}))
        }
        value={selected.push}
      />
    </HStack>
  );
}

function CheckboxWrappingRowStory(): React.JSX.Element {
  const [selected, setSelected] = useState({
    design: true,
    engineering: true,
    marketing: false,
    operations: false,
    support: true,
  });

  return (
    <VStack gap={3} width={420}>
      <HStack
        aria-label="Teams"
        as="fieldset"
        gap={4}
        style={{border: 0, padding: 0}}
        wrap="wrap">
        <CheckboxInput
          label="Design"
          onChange={checked =>
            setSelected(current => ({...current, design: checked}))
          }
          value={selected.design}
        />
        <CheckboxInput
          label="Engineering"
          onChange={checked =>
            setSelected(current => ({...current, engineering: checked}))
          }
          value={selected.engineering}
        />
        <CheckboxInput
          label="Marketing"
          onChange={checked =>
            setSelected(current => ({...current, marketing: checked}))
          }
          value={selected.marketing}
        />
        <CheckboxInput
          label="Operations"
          onChange={checked =>
            setSelected(current => ({...current, operations: checked}))
          }
          value={selected.operations}
        />
        <CheckboxInput
          label="Support"
          onChange={checked =>
            setSelected(current => ({...current, support: checked}))
          }
          value={selected.support}
        />
      </HStack>
    </VStack>
  );
}

const meta = {
  title: 'Components/CheckboxInput',
  component: CheckboxInput,
  args: {label: 'Accept terms', value: false},
  render: (args: CheckboxInputProps): React.JSX.Element => (
    <CheckboxStory {...args} />
  ),
} satisfies Meta<CheckboxInputProps>;

export default meta;
type Story = StoryObj<CheckboxInputProps>;

export const Default: Story = {};

export const Checked: Story = {args: {value: true}};

export const Indeterminate: Story = {args: {value: 'indeterminate'}};

export const WithDescription: Story = {
  args: {
    label: 'Subscribe to newsletter',
    description: 'Receive weekly product updates and announcements.',
  },
};

export const HorizontalRow: Story = {
  render: (): React.JSX.Element => <CheckboxRowStory />,
};

export const WrappingRow: Story = {
  render: (): React.JSX.Element => <CheckboxWrappingRowStory />,
};

export const Small: Story = {args: {size: 'sm'}};

export const Disabled: Story = {args: {isDisabled: true, value: true}};

export const ReadOnly: Story = {args: {isReadOnly: true, value: true}};

export const Loading: Story = {args: {isLoading: true, value: true}};

export const Required: Story = {args: {isRequired: true}};

export const Error: Story = {
  args: {
    status: {message: 'You must accept the terms to continue.', type: 'error'},
  },
};

export const Warning: Story = {
  args: {
    status: {message: 'This setting may affect performance.', type: 'warning'},
    value: true,
  },
};

export const Success: Story = {
  args: {
    status: {message: 'Preference saved.', type: 'success'},
    value: true,
  },
};

export const WithIcon: Story = {
  args: {
    label: 'Enable notifications',
    startContent: <Icon color="secondary" icon={Bell} size="sm" />,
  },
};

export const EndContentInline: Story = {
  args: {
    label: 'Beta features',
    endContent: <Badge color="blue" label="New" />,
    endContentPosition: 'inline',
  },
};

export const EndContentEnd: Story = {
  args: {
    label: 'Beta features',
    endContent: <Badge color="blue" label="New" />,
    endContentPosition: 'end',
  },
};
