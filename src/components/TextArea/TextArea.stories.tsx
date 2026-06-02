import type {Meta, StoryObj} from '@storybook/react-vite';
import {TextArea, type TextAreaProps} from './TextArea';

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  args: {label: 'Notes', value: '', placeholder: 'Add notes', rows: 4},
} satisfies Meta<TextAreaProps>;

export default meta;
type Story = StoryObj<TextAreaProps>;

export const Default: Story = {};
export const WithCounter: Story = {
  args: {maxLength: 120, value: 'Draft note'},
};
