import type {Meta, StoryObj} from '@storybook/react-vite';
import {DateRangeInput} from './DateRangeInput';

const meta: Meta<typeof DateRangeInput> = {
  title: 'Components/DateRangeInput',
  component: DateRangeInput,
  args: {
    label: 'Window',
    value: {start: '2026-05-10', end: '2026-05-12'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
