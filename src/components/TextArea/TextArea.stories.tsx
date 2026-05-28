import type {Meta, StoryObj} from '@storybook/react-vite';
import {TextArea} from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  args: {label: 'Notes', value: '', placeholder: 'Add notes', rows: 4},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithCounter: Story = {
  args: {maxLength: 120, value: 'Draft note'},
};
