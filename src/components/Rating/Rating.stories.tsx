import type {Meta, StoryObj} from '@storybook/react-vite';
import {Rating} from 'components/Rating/Rating';

const meta: Meta<typeof Rating> = {
  title: 'Components/Rating',
  component: Rating,
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
  args: {value: 3, isReadOnly: true},
};

export const Interactive: Story = {
  args: {value: 2, onChange: () => {}},
};

export const Disabled: Story = {
  args: {value: 4, isDisabled: true},
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <Rating isReadOnly size="sm" value={3} />
      <Rating isReadOnly size="md" value={3} />
      <Rating isReadOnly size="lg" value={3} />
    </div>
  ),
};

export const CustomCount: Story = {
  args: {value: 7, count: 10, isReadOnly: true},
};

export const Empty: Story = {
  args: {value: 0, onChange: () => {}},
};

export const CustomColors: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <Rating emptyColor="gray" filledColor="red" isReadOnly value={3} />
      <Rating emptyColor="gray" filledColor="green" isReadOnly value={4} />
      <Rating emptyColor="gray" filledColor="blue" isReadOnly value={2} />
    </div>
  ),
};
