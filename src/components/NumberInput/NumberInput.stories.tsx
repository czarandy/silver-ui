import type {Meta, StoryObj} from '@storybook/react-vite';
import {NumberInput, type NumberInputProps} from './NumberInput';

const meta: Meta<typeof NumberInput> = {
  title: 'Components/NumberInput',
  component: NumberInput,
  args: {label: 'Quantity', value: 2, onChange: () => {}},
};

export default meta;
type Story = StoryObj<NumberInputProps>;

export const Default: Story = {};
export const WithUnits: Story = {
  args: {units: 'GB', min: 0, max: 100, hasClear: true},
};
