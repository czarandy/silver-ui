import type {Meta, StoryObj} from '@storybook/react-vite';
import {DateInput} from './DateInput';

const meta: Meta<typeof DateInput> = {
  title: 'Components/DateInput',
  component: DateInput,
  args: {label: 'Due date', value: '2026-05-21'},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithConstraints: Story = {
  args: {min: '2026-05-10', max: '2026-05-28', hasClear: true},
};
