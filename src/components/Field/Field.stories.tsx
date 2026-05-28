import type {Meta, StoryObj} from '@storybook/react-vite';
import {Field} from './Field';

const meta: Meta<typeof Field> = {
  title: 'Components/Field',
  component: Field,
  args: {label: 'Field', inputId: 'field-story'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <Field {...args} description="Supporting field copy">
      <input id="field-story" />
    </Field>
  ),
};
