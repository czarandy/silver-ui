import type {Meta, StoryObj} from '@storybook/react-vite';
import {FileInput, type FileInputProps} from './FileInput';

const meta = {
  title: 'Components/FileInput',
  component: FileInput,
  args: {label: 'Upload', value: null, onChange: () => {}},
} satisfies Meta<FileInputProps>;

export default meta;
type Story = StoryObj<FileInputProps>;

export const Default: Story = {};
export const Dropzone: Story = {
  args: {mode: 'dropzone', isMultiple: true},
};
