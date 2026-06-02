import type {Meta, StoryObj} from '@storybook/react-vite';
import {Field, type FieldProps} from './Field';

const meta = {
  title: 'Components/Field',
  component: Field,
  args: {label: 'Field', inputId: 'field-story'},
} satisfies Meta<FieldProps>;

export default meta;
type Story = StoryObj<FieldProps>;

export const Default: Story = {
  render: (args: FieldProps) => (
    <Field {...args} description="Supporting field copy">
      <input id="field-story" />
    </Field>
  ),
};
