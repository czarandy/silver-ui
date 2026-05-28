import type {Meta, StoryObj} from '@storybook/react-vite';
import {TimeInput} from './TimeInput';

const meta: Meta<typeof TimeInput> = {
  title: 'Components/TimeInput',
  component: TimeInput,
  args: {label: 'Start time', value: '09:00'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithSeconds: Story = {
  args: {hasSeconds: true, value: '09:00:30'},
};
