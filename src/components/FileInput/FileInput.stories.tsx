import type {Meta, StoryObj} from '@storybook/react-vite';
import {FileInput} from './FileInput';

const meta: Meta<typeof FileInput> = {
  title: 'Components/FileInput',
  component: FileInput,
  args: {label: 'Upload', value: null, onChange: () => {}},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Dropzone: Story = {
  args: {mode: 'dropzone', isMultiple: true},
};
