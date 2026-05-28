import type {Meta, StoryObj} from '@storybook/react-vite';
import {DateTimeInput} from './DateTimeInput';

const meta: Meta<typeof DateTimeInput> = {
  title: 'Components/DateTimeInput',
  component: DateTimeInput,
  args: {label: 'Meeting', value: '2026-05-21T09:00', onChange: () => {}},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
