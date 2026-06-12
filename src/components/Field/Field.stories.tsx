import type {Meta, StoryObj} from '@storybook/react-vite';
import {Mail} from 'lucide-react';
import {Field, type FieldProps} from 'components/Field/Field';

const meta = {
  title: 'Components/Field',
  component: Field,
  args: {label: 'Email', inputId: 'field-story'},
} satisfies Meta<FieldProps>;

export default meta;
type Story = StoryObj<FieldProps>;

export const Default: Story = {
  render: (args: FieldProps) => (
    <Field {...args} description="We'll never share your email.">
      <input id="field-story" />
    </Field>
  ),
};

export const Required: Story = {
  args: {isRequired: true},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const Optional: Story = {
  args: {isOptional: true},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input disabled id="field-story" />
    </Field>
  ),
};

export const LabelHidden: Story = {
  args: {
    description: 'The label is visually hidden but still accessible.',
    isLabelHidden: true,
  },
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" placeholder="Email" />
    </Field>
  ),
};

export const LabelAsSpan: Story = {
  name: 'Label as span',
  args: {label: 'Preference', labelAs: 'span', labelId: 'pref-label'},
  render: (args: FieldProps) => (
    <Field {...args}>
      <div aria-labelledby="pref-label" role="radiogroup">
        <label>
          <input name="pref" type="radio" /> Email
        </label>
        <label>
          <input name="pref" type="radio" /> Phone
        </label>
      </div>
    </Field>
  ),
};

export const WithLabelIcon: Story = {
  args: {labelIcon: Mail},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const WithLabelTooltip: Story = {
  args: {labelTooltip: 'We use this to send account notifications.'},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const StatusError: Story = {
  name: 'Status — error',
  args: {status: {type: 'error', message: 'This field is required.'}},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const StatusWarning: Story = {
  name: 'Status — warning',
  args: {status: {type: 'warning', message: 'This email is already in use.'}},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const StatusSuccess: Story = {
  name: 'Status — success',
  args: {status: {type: 'success', message: 'Email is available.'}},
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const StatusDetached: Story = {
  name: 'Status — detached',
  args: {
    status: {type: 'error', message: 'This field is required.'},
    statusVariant: 'detached',
  },
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};

export const KitchenSink: Story = {
  args: {
    description: 'Your primary contact email.',
    isRequired: true,
    labelIcon: Mail,
    labelTooltip: 'Used for account recovery and notifications.',
    status: {type: 'error', message: 'Please enter a valid email.'},
  },
  render: (args: FieldProps) => (
    <Field {...args}>
      <input id="field-story" />
    </Field>
  ),
};
